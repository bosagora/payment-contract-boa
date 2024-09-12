import "@nomiclabs/hardhat-ethers";
import { BigNumber, Wallet } from "ethers";
import { Config } from "../common/Config";
import { logger } from "../common/Logger";
import { ContractManager } from "../contract/ContractManager";
import { Metrics } from "../metrics/Metrics";
import { GraphStorage } from "../storage/GraphStorage";
import { RelayStorage } from "../storage/RelayStorage";
import { Scheduler } from "./Scheduler";

/**
 * Creates blocks at regular intervals and stores them in IPFS and databases.
 */
export class MetricsCertifierScheduler extends Scheduler {
    private _config: Config | undefined;
    private _contractManager: ContractManager | undefined;
    private _metrics: Metrics | undefined;
    private _storage: RelayStorage | undefined;
    private _graph: GraphStorage | undefined;

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

    private get metrics(): Metrics {
        if (this._metrics !== undefined) return this._metrics;
        else {
            logger.error("Metrics is not ready yet.");
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

    private get contractManager(): ContractManager {
        if (this._contractManager !== undefined) return this._contractManager;
        else {
            logger.error("ContractManager is not ready yet.");
            process.exit(1);
        }
    }

    private get graph(): GraphStorage {
        if (this._graph !== undefined) return this._graph;
        else {
            logger.error("GraphStorage is not ready yet.");
            process.exit(1);
        }
    }

    public setOption(options: any) {
        if (options) {
            if (options.config && options.config instanceof Config) this._config = options.config;
            if (options.contractManager && options.contractManager instanceof ContractManager)
                this._contractManager = options.contractManager;
            if (options.storage && options.storage instanceof RelayStorage) this._storage = options.storage;
            if (options.graph && options.graph instanceof GraphStorage) this._graph = options.graph;
            if (options.metrics && options.metrics instanceof Metrics) this._metrics = options.metrics;
        }
    }

    public async onStart() {
        //
    }

    protected async work() {
        try {
            for (const elem of this.config.relay.certifiers) {
                const wallet = new Wallet(elem, this.contractManager.sideChainProvider);
                const balance = (await wallet.getBalance()).div(BigNumber.from(1_000_000_000)).toNumber();
                this.metrics.gaugeLabels("certifier_balance", { address: wallet.address }, balance);
            }
        } catch (error) {
            logger.error(`Failed to execute the MetricsBOAScheduler: ${error}`);
        }
    }
}
