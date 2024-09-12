import { Config } from "../common/Config";
import { logger } from "../common/Logger";
import { ContractManager } from "../contract/ContractManager";
import { Metrics } from "../metrics/Metrics";
import { WebService } from "../service/WebService";
import { RelayStorage } from "../storage/RelayStorage";
import { ResponseMessage } from "../utils/Errors";

// tslint:disable-next-line:no-implicit-dependencies
import express from "express";
import { param, validationResult } from "express-validator";

export class TaskRouter {
    private web_service: WebService;
    private readonly config: Config;
    private readonly contractManager: ContractManager;
    private readonly metrics: Metrics;
    private storage: RelayStorage;

    constructor(
        service: WebService,
        config: Config,
        contractManager: ContractManager,
        metrics: Metrics,
        storage: RelayStorage
    ) {
        this.web_service = service;
        this.config = config;
        this.contractManager = contractManager;
        this.metrics = metrics;
        this.storage = storage;
    }

    private get app(): express.Application {
        return this.web_service.app;
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
        this.app.get("/v1/tasks/:sequence", [param("sequence").exists()], this.tasks.bind(this));
    }

    private async tasks(req: express.Request, res: express.Response) {
        logger.http(`GET /v1/tasks/items/:sequence ${req.ip}:${JSON.stringify(req.params)}`);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json(ResponseMessage.getErrorMessage("2001", { validation: errors.array() }));
        }

        try {
            const value = String(req.params.sequence);
            if (value === "latest") {
                const tasks = await this.storage.readCallBackLatest();
                this.metrics.add("success", 1);
                return res.status(200).json(this.makeResponseData(0, tasks));
            } else if (value === "0") {
                const tasks = await this.storage.readCallBackDefault();
                this.metrics.add("success", 1);
                return res.status(200).json(this.makeResponseData(0, tasks));
            } else {
                const sequence = BigInt(value);
                const tasks = await this.storage.readCallBack(sequence);
                this.metrics.add("success", 1);
                return res.status(200).json(this.makeResponseData(0, tasks));
            }
        } catch (error: any) {
            const msg = ResponseMessage.getEVMErrorMessage(error);
            logger.error(`GET /v1/tasks/items/:sequence : ${msg.error.message}`);
            this.metrics.add("failure", 1);
            return res.status(200).json(this.makeResponseData(msg.code, undefined, msg.error));
        }
    }
}
