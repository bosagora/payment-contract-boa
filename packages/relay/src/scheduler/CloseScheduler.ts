import "@nomiclabs/hardhat-ethers";
import { Config } from "../common/Config";
import { logger } from "../common/Logger";
import { Scheduler } from "./Scheduler";

import { RelayStorage } from "../storage/RelayStorage";
import { ContractUtils } from "../utils/ContractUtils";

import axios from "axios";
import URI from "urijs";
import { LoyaltyPaymentTaskStatus } from "../types";

/**
 * Creates blocks at regular intervals and stores them in IPFS and databases.
 */
export class CloseScheduler extends Scheduler {
    private _config: Config | undefined;

    private _storage: RelayStorage | undefined;

    constructor(expression: string) {
        super(expression);
    }

    private get config(): Config {
        if (this._config !== undefined) return this._config;
        else {
            logger.error("Config is not ready yet.");
            process.exit(1);
        }
    }

    private get storage(): RelayStorage {
        if (this._storage !== undefined) return this._storage;
        else {
            logger.error("Storage is not ready yet.");
            process.exit(1);
        }
    }

    public setOption(options: any) {
        if (options) {
            if (options.config && options.config instanceof Config) this._config = options.config;
            if (options.storage && options.storage instanceof RelayStorage) this._storage = options.storage;
        }
    }

    public async onStart() {
        //
    }

    protected async work() {
        try {
            await this.onNewPayment();
            await this.onCancelPayment();
        } catch (error) {
            logger.error(`Failed to execute the CloseScheduler: ${error}`);
        }
    }

    private async onNewPayment() {
        const payments = await this.storage.getPaymentsStatusOf([
            LoyaltyPaymentTaskStatus.OPENED_NEW,
            LoyaltyPaymentTaskStatus.APPROVED_NEW_FAILED_TX,
            LoyaltyPaymentTaskStatus.APPROVED_NEW_SENT_TX,
            LoyaltyPaymentTaskStatus.APPROVED_NEW_CONFIRMED_TX,
            LoyaltyPaymentTaskStatus.APPROVED_NEW_REVERTED_TX,
            LoyaltyPaymentTaskStatus.DENIED_NEW,
            LoyaltyPaymentTaskStatus.REPLY_COMPLETED_NEW,
        ]);
        for (const payment of payments) {
            if (ContractUtils.getTimeStamp() - payment.openNewTimestamp < this.config.relay.forcedCloseSecond) continue;
            logger.info(`CloseScheduler.onNewPayment ${payment.paymentId}`);

            const serverURL = `http://localhost:${this.config.server.port}`;
            const client = axios.create();
            try {
                const response = await client.post(
                    URI(serverURL).directory("/v1/payment/new").filename("close").toString(),
                    {
                        accessKey: this.config.relay.accessKey,
                        confirm: false,
                        paymentId: payment.paymentId,
                    }
                );
                if (response.data.error !== undefined) {
                    logger.warn(`CloseScheduler.onNewPayment: ${response.data.code} - ${response.data.error.message}`);
                }
            } catch (e) {
                //
            }
        }
    }

    private async onCancelPayment() {
        const payments = await this.storage.getPaymentsStatusOf([
            LoyaltyPaymentTaskStatus.OPENED_CANCEL,
            LoyaltyPaymentTaskStatus.APPROVED_CANCEL_FAILED_TX,
            LoyaltyPaymentTaskStatus.APPROVED_CANCEL_SENT_TX,
            LoyaltyPaymentTaskStatus.APPROVED_CANCEL_CONFIRMED_TX,
            LoyaltyPaymentTaskStatus.APPROVED_CANCEL_REVERTED_TX,
            LoyaltyPaymentTaskStatus.DENIED_CANCEL,
            LoyaltyPaymentTaskStatus.REPLY_COMPLETED_CANCEL,
        ]);
        for (const payment of payments) {
            if (ContractUtils.getTimeStamp() - payment.openCancelTimestamp < this.config.relay.forcedCloseSecond)
                continue;
            logger.info(`CloseScheduler.onCancelPayment ${payment.paymentId}`);

            const serverURL = `http://localhost:${this.config.server.port}`;
            const client = axios.create();
            try {
                const response = await client.post(
                    URI(serverURL).directory("/v1/payment/cancel").filename("close").toString(),
                    {
                        accessKey: this.config.relay.accessKey,
                        confirm: false,
                        paymentId: payment.paymentId,
                    }
                );
                if (response.data.error !== undefined) {
                    logger.warn(
                        `CloseScheduler.onCancelPayment: ${response.data.code} - ${response.data.error.message}`
                    );
                }
            } catch (e) {
                //
            }
        }
    }
}
