import { Config } from "../common/Config";
import { logger } from "../common/Logger";
import { ContractManager } from "../contract/ContractManager";
import { ISignerItem, RelaySigners } from "../contract/Signers";
import { Metrics } from "../metrics/Metrics";
import { WebService } from "../service/WebService";
import { GraphStorage } from "../storage/GraphStorage";
import { RelayStorage } from "../storage/RelayStorage";
import { ContractUtils } from "../utils/ContractUtils";
import { ResponseMessage } from "../utils/Errors";
import { Validation } from "../validation";

import { BigNumber, ethers } from "ethers";
import express from "express";
import { body, validationResult } from "express-validator";

export class BridgeRouter {
    private web_service: WebService;
    private readonly config: Config;
    private readonly contractManager: ContractManager;
    private readonly metrics: Metrics;
    private readonly relaySigners: RelaySigners;
    private storage: RelayStorage;
    private graph_sidechain: GraphStorage;
    private graph_mainchain: GraphStorage;

    constructor(
        service: WebService,
        config: Config,
        contractManager: ContractManager,
        metrics: Metrics,
        storage: RelayStorage,
        graph_sidechain: GraphStorage,
        graph_mainchain: GraphStorage,
        relaySigners: RelaySigners
    ) {
        this.web_service = service;
        this.config = config;
        this.contractManager = contractManager;
        this.metrics = metrics;

        this.storage = storage;
        this.graph_sidechain = graph_sidechain;
        this.graph_mainchain = graph_mainchain;
        this.relaySigners = relaySigners;
    }

    private get app(): express.Application {
        return this.web_service.app;
    }

    /***
     * 트팬잭션을 중계할 때 사용될 서명자
     * @private
     */
    private async getRelaySigner(provider?: ethers.providers.Provider): Promise<ISignerItem> {
        if (provider === undefined) provider = this.contractManager.sideChainProvider;
        return this.relaySigners.getSigner(provider);
    }

    /***
     * 트팬잭션을 중계할 때 사용될 서명자
     * @private
     */
    private releaseRelaySigner(signer: ISignerItem) {
        signer.using = false;
    }

    /**
     * Make the response data
     * @param code      The result code
     * @param data      The result data
     * @param error     The error
     * @private
     */
    private makeResponseData(code: number, data: any, error?: any): any {
        return {
            code,
            data,
            error,
        };
    }

    public registerRoutes() {
        this.app.post(
            "/v1/bridge/withdraw",
            [
                body("account").exists().trim().isEthereumAddress(),
                body("amount").exists().custom(Validation.isAmount),
                body("expiry").exists().isNumeric(),
                body("signature")
                    .exists()
                    .trim()
                    .matches(/^(0x)[0-9a-f]{130}$/i),
            ],
            this.bridge_withdraw.bind(this)
        );

        this.app.post(
            "/v1/bridge/deposit",
            [
                body("account").exists().trim().isEthereumAddress(),
                body("amount").exists().custom(Validation.isAmount),
                body("expiry").exists().isNumeric(),
                body("signature")
                    .exists()
                    .trim()
                    .matches(/^(0x)[0-9a-f]{130}$/i),
            ],
            this.bridge_deposit.bind(this)
        );
    }

    private async getDepositIdMainChain(account: string): Promise<string> {
        while (true) {
            const id = ContractUtils.getRandomId(account);
            if (await this.contractManager.mainChainBridgeContract.isAvailableDepositId(id)) return id;
        }
    }

    private async getDepositIdSideChain(account: string): Promise<string> {
        while (true) {
            const id = ContractUtils.getRandomId(account);
            if (await this.contractManager.sideChainBridgeContract.isAvailableDepositId(id)) return id;
        }
    }

    private async bridge_withdraw(req: express.Request, res: express.Response) {
        logger.http(`POST /v1/bridge/withdraw ${req.ip}:${JSON.stringify(req.body)}`);

        if (!this.config.relay.bridgeActiveStatus) {
            return res.status(200).json(ResponseMessage.getErrorMessage("3001"));
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        const signerItem = await this.getRelaySigner(this.contractManager.sideChainProvider);
        try {
            const account: string = String(req.body.account).trim();
            const amount: BigNumber = BigNumber.from(req.body.amount);
            const expiry: number = Number(req.body.expiry);
            const signature: string = String(req.body.signature).trim();

            const balance = await this.contractManager.sideTokenContract.balanceOf(account);
            if (balance.lt(amount)) return res.status(200).json(ResponseMessage.getErrorMessage("1511"));

            const nonce = await this.contractManager.sideTokenContract.nonceOf(account);
            const message = ContractUtils.getTransferMessage(
                this.contractManager.sideChainId,
                this.contractManager.sideTokenContract.address,
                account,
                this.contractManager.sideChainBridgeContract.address,
                amount,
                nonce,
                expiry
            );
            if (!ContractUtils.verifyMessage(account, message, signature))
                return res.status(200).json(ResponseMessage.getErrorMessage("1501"));

            const tokenId = ContractUtils.getTokenId(
                await this.contractManager.sideTokenContract.name(),
                await this.contractManager.sideTokenContract.symbol()
            );
            const depositId = await this.getDepositIdSideChain(account);
            const tx = await this.contractManager.sideChainBridgeContract
                .connect(signerItem.signer)
                .depositToBridge(tokenId, depositId, account, amount, expiry, signature);

            return res.status(200).json(this.makeResponseData(0, { tokenId, depositId, amount, txHash: tx.hash }));
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`POST /v1/bridge/withdraw : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        } finally {
            this.releaseRelaySigner(signerItem);
        }
    }

    private async bridge_deposit(req: express.Request, res: express.Response) {
        logger.http(`POST /v1/bridge/deposit ${req.ip}:${JSON.stringify(req.body)}`);

        if (!this.config.relay.bridgeActiveStatus) {
            return res.status(200).json(ResponseMessage.getErrorMessage("3001"));
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        const signerItem = await this.getRelaySigner(this.contractManager.mainChainProvider);
        try {
            const account: string = String(req.body.account).trim();
            const amount: BigNumber = BigNumber.from(req.body.amount);
            const expiry: number = Number(req.body.expiry);
            const signature: string = String(req.body.signature).trim();

            const balance = await this.contractManager.mainTokenContract.balanceOf(account);
            if (balance.lt(amount)) return res.status(200).json(ResponseMessage.getErrorMessage("1511"));

            const nonce = await this.contractManager.mainTokenContract.nonceOf(account);
            const message = ContractUtils.getTransferMessage(
                this.contractManager.mainChainId,
                this.contractManager.mainTokenContract.address,
                account,
                this.contractManager.mainChainBridgeContract.address,
                amount,
                nonce,
                expiry
            );
            if (!ContractUtils.verifyMessage(account, message, signature))
                return res.status(200).json(ResponseMessage.getErrorMessage("1501"));

            const tokenId = ContractUtils.getTokenId(
                await this.contractManager.mainTokenContract.name(),
                await this.contractManager.mainTokenContract.symbol()
            );
            const depositId = await this.getDepositIdMainChain(account);
            const tx = await this.contractManager.mainChainBridgeContract
                .connect(signerItem.signer)
                .depositToBridge(tokenId, depositId, account, amount, expiry, signature);

            return res.status(200).json(this.makeResponseData(0, { tokenId, depositId, amount, txHash: tx.hash }));
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`POST /v1/bridge/deposit : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        } finally {
            this.releaseRelaySigner(signerItem);
        }
    }
}
