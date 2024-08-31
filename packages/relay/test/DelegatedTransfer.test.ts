import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

import { Amount } from "../src/common/Amount";
import { Config } from "../src/common/Config";
import { ContractManager } from "../src/contract/ContractManager";
import { GraphStorage } from "../src/storage/GraphStorage";
import { RelayStorage } from "../src/storage/RelayStorage";
import { ContractUtils } from "../src/utils/ContractUtils";
import { Deployments } from "./helper/Deployments";
import { TestClient, TestServer } from "./helper/Utility";

import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";

import * as path from "path";
import { URL } from "url";

// tslint:disable-next-line:no-var-requires
const URI = require("urijs");

chai.use(solidity);

describe("Test of delegated transfer", function () {
    this.timeout(1000 * 60 * 5);

    const config = new Config();
    config.readFromFile(path.resolve(process.cwd(), "config", "config_test.yaml"));
    const contractManager = new ContractManager(config);
    const deployments = new Deployments(config);

    let client: TestClient;
    let server: TestServer;
    let storage: RelayStorage;
    let serverURL: URL;

    before("Deploy", async () => {
        deployments.setShopData([]);
        await deployments.doDeploy();
    });

    before("Create Config", async () => {
        config.contracts.sideChain.tokenAddress = deployments.getContractAddress("TestLYT") || "";
        config.contracts.sideChain.currencyRateAddress = deployments.getContractAddress("CurrencyRate") || "";
        config.contracts.sideChain.phoneLinkerAddress = deployments.getContractAddress("PhoneLinkCollection") || "";
        config.contracts.sideChain.ledgerAddress = deployments.getContractAddress("Ledger") || "";
        config.contracts.sideChain.shopAddress = deployments.getContractAddress("Shop") || "";
        config.contracts.sideChain.loyaltyProviderAddress = deployments.getContractAddress("LoyaltyProvider") || "";
        config.contracts.sideChain.loyaltyConsumerAddress = deployments.getContractAddress("LoyaltyConsumer") || "";
        config.contracts.sideChain.loyaltyExchangerAddress = deployments.getContractAddress("LoyaltyExchanger") || "";
        config.contracts.sideChain.loyaltyTransferAddress = deployments.getContractAddress("LoyaltyTransfer") || "";
        config.contracts.sideChain.loyaltyBridgeAddress = deployments.getContractAddress("LoyaltyBridge") || "";
        config.contracts.sideChain.chainBridgeAddress = deployments.getContractAddress("SideChainBridge") || "";

        config.contracts.mainChain.tokenAddress = deployments.getContractAddress("MainChainKIOS") || "";
        config.contracts.mainChain.loyaltyBridgeAddress =
            deployments.getContractAddress("MainChainLoyaltyBridge") || "";
        config.contracts.mainChain.chainBridgeAddress = deployments.getContractAddress("MainChainBridge") || "";

        config.relay.certifiers = deployments.accounts.certifiers.map((m) => m.privateKey);
        config.relay.relayEndpoint = `http://127.0.0.1:${config.server.port}`;

        client = new TestClient({
            headers: {
                Authorization: config.relay.accessKey,
            },
        });
    });

    before("Create TestServer", async () => {
        serverURL = new URL(`http://127.0.0.1:${config.server.port}`);
        storage = await RelayStorage.make(config.database);
        const graph_sidechain = await GraphStorage.make(config.graph_sidechain);
        const graph_mainchain = await GraphStorage.make(config.graph_mainchain);
        await contractManager.attach();
        server = new TestServer(config, contractManager, storage, graph_sidechain, graph_mainchain);
    });

    before("Start TestServer", async () => {
        await server.start();
    });

    after("Stop TestServer", async () => {
        await server.stop();
        await storage.dropTestDB();
    });

    it("delegated transfer of main chain token", async () => {
        const source = deployments.accounts.owner;
        const target = deployments.accounts.users[0];
        const balance0 = await contractManager.mainTokenContract.balanceOf(source.address);
        const balance1 = await contractManager.mainTokenContract.balanceOf(target.address);
        const amount = Amount.make(500, 18).value;
        const nonce = await contractManager.mainTokenContract.nonceOf(source.address);
        const expiry = ContractUtils.getTimeStamp() * 600;
        const message = ContractUtils.getTransferMessage(
            contractManager.mainChainId,
            contractManager.mainTokenContract.address,
            source.address,
            target.address,
            amount,
            nonce,
            expiry
        );
        const signature = await ContractUtils.signMessage(source, message);
        const response = await client.post(URI(serverURL).directory("/v1/token/main/transfer").toString(), {
            from: source.address,
            to: target.address,
            amount: amount.toString(),
            expiry,
            signature,
        });

        expect(response.data.code).to.equal(0, response.data.error?.message);
        expect(response.data.data).to.not.equal(undefined);
        expect(response.data.data.txHash).to.match(/^0x[A-Fa-f0-9]{64}$/i);

        const protocolFee = await contractManager.mainTokenContract.getProtocolFee();
        expect(await contractManager.mainTokenContract.balanceOf(source.address)).to.deep.equal(balance0.sub(amount));
        expect(await contractManager.mainTokenContract.balanceOf(target.address)).to.deep.equal(
            balance1.add(amount.sub(protocolFee))
        );
    });

    it("delegated transfer of side chain token", async () => {
        const source = deployments.accounts.owner;
        const target = deployments.accounts.users[0];
        const balance0 = await contractManager.sideTokenContract.balanceOf(source.address);
        const balance1 = await contractManager.sideTokenContract.balanceOf(target.address);
        const amount = Amount.make(500, 18).value;
        const nonce = await contractManager.sideTokenContract.nonceOf(source.address);
        const expiry = ContractUtils.getTimeStamp() * 600;
        const message = ContractUtils.getTransferMessage(
            contractManager.sideChainId,
            contractManager.sideTokenContract.address,
            source.address,
            target.address,
            amount,
            nonce,
            expiry
        );
        const signature = await ContractUtils.signMessage(source, message);
        const response = await client.post(URI(serverURL).directory("/v1/token/side/transfer").toString(), {
            from: source.address,
            to: target.address,
            amount: amount.toString(),
            expiry,
            signature,
        });

        const fee = await contractManager.sideTokenContract.getProtocolFee();
        expect(response.data.code).to.equal(0, response.data.error?.message);
        expect(response.data.data).to.not.equal(undefined);
        expect(response.data.data.txHash).to.match(/^0x[A-Fa-f0-9]{64}$/i);

        expect(await contractManager.sideTokenContract.balanceOf(source.address)).to.deep.equal(balance0.sub(amount));
        expect(await contractManager.sideTokenContract.balanceOf(target.address)).to.deep.equal(
            balance1.add(amount).sub(fee)
        );
    });
});
