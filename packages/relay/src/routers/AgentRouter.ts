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

import { AddressZero } from "@ethersproject/constants";
import { BigNumber, ethers } from "ethers";
import express from "express";
import { body, param, validationResult } from "express-validator";
import { BOACoin } from "../common/Amount";

export class AgentRouter {
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

    public async registerRoutes() {
        this.app.post(
            "/v1/agent/provision",
            [
                body("account").exists().trim().isEthereumAddress(),
                body("agent").exists().trim().isEthereumAddress(),
                body("signature")
                    .exists()
                    .trim()
                    .matches(/^(0x)[0-9a-f]{130}$/i),
            ],
            this.post_agent_provision.bind(this)
        );

        this.app.get(
            "/v1/agent/provision/:account",
            [param("account").exists().trim().isEthereumAddress()],
            this.get_agent_provision.bind(this)
        );

        this.app.post(
            "/v1/agent/refund",
            [
                body("account").exists().trim().isEthereumAddress(),
                body("agent").exists().trim().isEthereumAddress(),
                body("signature")
                    .exists()
                    .trim()
                    .matches(/^(0x)[0-9a-f]{130}$/i),
            ],
            this.post_agent_refund.bind(this)
        );

        this.app.get(
            "/v1/agent/refund/:account",
            [param("account").exists().trim().isEthereumAddress()],
            this.get_agent_refund.bind(this)
        );

        this.app.post(
            "/v1/agent/withdrawal",
            [
                body("account").exists().trim().isEthereumAddress(),
                body("agent").exists().trim().isEthereumAddress(),
                body("signature")
                    .exists()
                    .trim()
                    .matches(/^(0x)[0-9a-f]{130}$/i),
            ],
            this.post_agent_withdrawal.bind(this)
        );

        this.app.get(
            "/v1/agent/withdrawal/:account",
            [param("account").exists().trim().isEthereumAddress()],
            this.get_agent_withdrawal.bind(this)
        );
    }

    private async post_agent_provision(req: express.Request, res: express.Response) {
        logger.http(`POST /v1/agent/provision ${req.ip}:${JSON.stringify(req.body)}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        const signerItem = await this.getRelaySigner(this.contractManager.sideChainProvider);
        try {
            const account: string = String(req.body.account).trim();
            const agent: string = String(req.body.agent).trim();
            const signature: string = String(req.body.signature).trim();

            const nonce = await this.contractManager.sideLedgerContract.nonceOf(account);
            const message = ContractUtils.getRegisterAgentMessage(
                account,
                agent,
                nonce,
                this.contractManager.sideChainId
            );
            if (!ContractUtils.verifyMessage(account, message, signature))
                return res.status(200).json(ResponseMessage.getErrorMessage("1501"));
            const tx = await this.contractManager.sideLedgerContract
                .connect(signerItem.signer)
                .registerProvisionAgent(account, agent, signature);
            this.metrics.add("success", 1);
            return res.status(200).json(this.makeResponseData(0, { account, agent, txHash: tx.hash }));
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`POST /v1/agent/provision : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        } finally {
            this.releaseRelaySigner(signerItem);
        }
    }

    private async get_agent_provision(req: express.Request, res: express.Response) {
        logger.http(`GET /v1/agent/provision/:account ${req.ip}:${JSON.stringify(req.params)}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        try {
            const account: string = String(req.params.account).trim();
            const agent = await this.contractManager.sideLedgerContract.provisionAgentOf(account);
            this.metrics.add("success", 1);
            return res.status(200).json(this.makeResponseData(0, { account, agent }));
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`GET /v1/agent/provision/:account : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        }
    }

    private async post_agent_refund(req: express.Request, res: express.Response) {
        logger.http(`POST /v1/agent/refund ${req.ip}:${JSON.stringify(req.body)}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        const signerItem = await this.getRelaySigner(this.contractManager.sideChainProvider);
        try {
            const account: string = String(req.body.account).trim();
            const agent: string = String(req.body.agent).trim();
            const signature: string = String(req.body.signature).trim();

            const nonce = await this.contractManager.sideLedgerContract.nonceOf(account);
            const message = ContractUtils.getRegisterAgentMessage(
                account,
                agent,
                nonce,
                this.contractManager.sideChainId
            );
            if (!ContractUtils.verifyMessage(account, message, signature))
                return res.status(200).json(ResponseMessage.getErrorMessage("1501"));
            const tx = await this.contractManager.sideLedgerContract
                .connect(signerItem.signer)
                .registerRefundAgent(account, agent, signature);
            this.metrics.add("success", 1);
            return res.status(200).json(this.makeResponseData(0, { account, agent, txHash: tx.hash }));
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`POST /v1/agent/refund : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        } finally {
            this.releaseRelaySigner(signerItem);
        }
    }

    private async get_agent_refund(req: express.Request, res: express.Response) {
        logger.http(`GET /v1/agent/refund/:account ${req.ip}:${JSON.stringify(req.params)}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        try {
            const account: string = String(req.params.account).trim();
            const agent = await this.contractManager.sideLedgerContract.refundAgentOf(account);
            this.metrics.add("success", 1);
            return res.status(200).json(this.makeResponseData(0, { account, agent }));
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`GET /v1/agent/refund/:account : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        }
    }

    private async post_agent_withdrawal(req: express.Request, res: express.Response) {
        logger.http(`POST /v1/agent/withdrawal/ ${req.ip}:${JSON.stringify(req.body)}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        const signerItem = await this.getRelaySigner(this.contractManager.sideChainProvider);
        try {
            const account: string = String(req.body.account).trim();
            const agent: string = String(req.body.agent).trim();
            const signature: string = String(req.body.signature).trim();

            const nonce = await this.contractManager.sideLedgerContract.nonceOf(account);
            const message = ContractUtils.getRegisterAgentMessage(
                account,
                agent,
                nonce,
                this.contractManager.sideChainId
            );
            if (!ContractUtils.verifyMessage(account, message, signature))
                return res.status(200).json(ResponseMessage.getErrorMessage("1501"));
            const tx = await this.contractManager.sideLedgerContract
                .connect(signerItem.signer)
                .registerWithdrawalAgent(account, agent, signature);
            this.metrics.add("success", 1);
            return res.status(200).json(this.makeResponseData(0, { account, agent, txHash: tx.hash }));
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`POST /v1/agent/withdrawal/ : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        } finally {
            this.releaseRelaySigner(signerItem);
        }
    }

    private async get_agent_withdrawal(req: express.Request, res: express.Response) {
        logger.http(`GET /v1/agent/withdrawal/:account ${req.ip}:${JSON.stringify(req.params)}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        try {
            const account: string = String(req.params.account).trim();
            const agent = await this.contractManager.sideLedgerContract.withdrawalAgentOf(account);
            this.metrics.add("success", 1);
            return res.status(200).json(this.makeResponseData(0, { account, agent }));
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`GET /v1/agent/withdrawal/:account : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        }
    }
}
