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
import URI from "urijs";
import { URL } from "url";

import { AddressZero } from "@ethersproject/constants";

chai.use(solidity);

describe("Test of LoyaltyProvider", function () {
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

    it("Deposit token", async () => {
        for (const userIndex of [0, 1]) {
            const amount = Amount.make(1000, 18).value;
            const oldTokenBalance = await contractManager.sideLedgerContract.tokenBalanceOf(
                deployments.accounts.users[userIndex].address
            );
            await contractManager.sideTokenContract
                .connect(deployments.accounts.users[userIndex])
                .approve(contractManager.sideLedgerContract.address, amount);
            await expect(
                contractManager.sideLedgerContract.connect(deployments.accounts.users[userIndex]).deposit(amount)
            )
                .to.emit(contractManager.sideLedgerContract, "Deposited")
                .withNamedArgs({
                    account: deployments.accounts.users[userIndex].address,
                    depositedToken: amount,
                    balanceToken: oldTokenBalance.add(amount),
                });
            expect(
                await contractManager.sideLedgerContract.tokenBalanceOf(deployments.accounts.users[userIndex].address)
            ).to.deep.equal(oldTokenBalance.add(amount));
        }
    });

    it("Check Summary of Account", async () => {
        const response = await client.get(
            URI(serverURL).directory(`/v1/summary/account/${deployments.accounts.users[0].address}`).toString()
        );

        expect(response.data.data.provider.enable).to.deep.equal(false);
        expect(response.data.data.provider.assistant).to.deep.equal(AddressZero);
    });

    it("Register Provide", async () => {
        expect(await contractManager.sideLedgerContract.isProvider(deployments.accounts.users[0].address)).equal(false);

        await expect(
            contractManager.sideLedgerContract
                .connect(deployments.accounts.deployer)
                .registerProvider(deployments.accounts.users[0].address)
        ).emit(contractManager.sideLedgerContract, "RegisteredProvider");

        expect(await contractManager.sideLedgerContract.isProvider(deployments.accounts.users[0].address)).equal(true);
    });

    it("Check Summary of Account", async () => {
        const response = await client.get(
            URI(serverURL).directory(`/v1/summary/account/${deployments.accounts.users[0].address}`).toString()
        );

        expect(response.data.data.provider.enable).to.deep.equal(true);
        expect(response.data.data.provider.assistant).to.deep.equal(AddressZero);
    });

    it("Balance of Provider", async () => {
        const tokenAmount = Amount.make(1000, 18).value;
        const pointAmount = await contractManager.sideCurrencyRateContract.convertTokenToPoint(tokenAmount);
        const response = await client.get(
            URI(serverURL).directory(`/v1/provider/balance/${deployments.accounts.users[0].address}`).toString()
        );
        expect(response.data.data.provider).to.deep.equal(deployments.accounts.users[0].address);
        expect(response.data.data.providable.token).to.deep.equal(tokenAmount);
        expect(response.data.data.providable.point).to.deep.equal(pointAmount);
    });

    it("Provide Point for Address", async () => {
        const provider = deployments.accounts.users[0];
        const receiver = deployments.accounts.users[1];
        const balance0 = await contractManager.sideLedgerContract.tokenBalanceOf(provider.address);
        const balance1 = await contractManager.sideLedgerContract.pointBalanceOf(receiver.address);
        const pointAmount = Amount.make(10, 18).value;
        const tokenAmount = await contractManager.sideCurrencyRateContract.convertPointToToken(pointAmount);
        const nonce = await contractManager.sideLedgerContract.nonceOf(provider.address);
        const message = ContractUtils.getProvidePointToAddressMessage(
            provider.address,
            receiver.address,
            pointAmount,
            nonce,
            contractManager.sideChainId
        );
        const signature = await ContractUtils.signMessage(provider, message);
        const response = await client.post(URI(serverURL).directory("/v1/provider/send/account").toString(), {
            provider: provider.address,
            receiver: receiver.address,
            amount: pointAmount.toString(),
            signature,
        });

        expect(response.data.code).to.equal(0);
        expect(response.data.data).to.not.equal(undefined);
        expect(response.data.data.txHash).to.match(/^0x[A-Fa-f0-9]{64}$/i);

        expect(await contractManager.sideLedgerContract.tokenBalanceOf(provider.address)).to.deep.equal(
            balance0.sub(tokenAmount)
        );
        expect(await contractManager.sideLedgerContract.pointBalanceOf(receiver.address)).to.deep.equal(
            balance1.add(pointAmount)
        );
    });

    it("Provide Point for Phone number", async () => {
        const phoneNumber = "+82 10-1000-9000";
        const phoneHash = ContractUtils.getPhoneHash(phoneNumber);
        const provider = deployments.accounts.users[0];
        const balance0 = await contractManager.sideLedgerContract.tokenBalanceOf(provider.address);
        const balance1 = await contractManager.sideLedgerContract.unPayablePointBalanceOf(phoneHash);
        const pointAmount = Amount.make(10, 18).value;
        const tokenAmount = await contractManager.sideCurrencyRateContract.convertPointToToken(pointAmount);
        const nonce = await contractManager.sideLedgerContract.nonceOf(provider.address);
        const message = ContractUtils.getProvidePointToPhoneMessage(
            provider.address,
            phoneHash,
            pointAmount,
            nonce,
            contractManager.sideChainId
        );
        const signature = await ContractUtils.signMessage(provider, message);
        const response = await client.post(URI(serverURL).directory("/v1/provider/send/phoneHash").toString(), {
            provider: provider.address,
            receiver: phoneHash,
            amount: pointAmount.toString(),
            signature,
        });

        expect(response.data.code).to.equal(0);
        expect(response.data.data).to.not.equal(undefined);
        expect(response.data.data.txHash).to.match(/^0x[A-Fa-f0-9]{64}$/i);

        expect(await contractManager.sideLedgerContract.tokenBalanceOf(provider.address)).to.deep.equal(
            balance0.sub(tokenAmount)
        );
        expect(await contractManager.sideLedgerContract.unPayablePointBalanceOf(phoneHash)).to.deep.equal(
            balance1.add(pointAmount)
        );
    });

    it("Register assistant", async () => {
        const provider = deployments.accounts.users[0];
        const response1 = await client.get(
            URI(serverURL).directory(`/v1/provider/assistant/${provider.address}`).toString()
        );
        expect(response1.data.data.provider).to.deep.equal(provider.address);
        expect(response1.data.data.assistant).to.deep.equal(AddressZero);

        const assistant = deployments.accounts.users[1];
        const nonce = await contractManager.sideLedgerContract.nonceOf(provider.address);
        const message = ContractUtils.getRegisterAssistanceMessage(
            provider.address,
            assistant.address,
            nonce,
            contractManager.sideChainId
        );
        const signature = await ContractUtils.signMessage(provider, message);
        const response2 = await client.post(URI(serverURL).directory(`/v1/provider/assistant/register`).toString(), {
            provider: provider.address,
            assistant: assistant.address,
            signature,
        });
        expect(response2.data.code).to.equal(0);
        expect(response2.data.data).to.not.equal(undefined);
        expect(response2.data.data.txHash).to.match(/^0x[A-Fa-f0-9]{64}$/i);

        const response3 = await client.get(
            URI(serverURL).directory(`/v1/provider/assistant/${provider.address}`).toString()
        );
        expect(response3.data.data.provider).to.deep.equal(provider.address);
        expect(response3.data.data.assistant).to.deep.equal(assistant.address);
    });

    it("Check Summary of Account", async () => {
        const response = await client.get(
            URI(serverURL).directory(`/v1/summary/account/${deployments.accounts.users[0].address}`).toString()
        );

        expect(response.data.data.provider.enable).to.deep.equal(true);
        expect(response.data.data.provider.assistant).to.deep.equal(deployments.accounts.users[1].address);
    });

    it("Provide Point for Address by Assistant", async () => {
        const provider = deployments.accounts.users[0];
        const assistant = deployments.accounts.users[1];
        const receiver = deployments.accounts.users[2];
        const balance0 = await contractManager.sideLedgerContract.tokenBalanceOf(provider.address);
        const balance1 = await contractManager.sideLedgerContract.pointBalanceOf(receiver.address);
        const pointAmount = Amount.make(10, 18).value;
        const tokenAmount = await contractManager.sideCurrencyRateContract.convertPointToToken(pointAmount);
        const nonce = await contractManager.sideLedgerContract.nonceOf(assistant.address);
        const message = ContractUtils.getProvidePointToAddressMessage(
            provider.address,
            receiver.address,
            pointAmount,
            nonce,
            contractManager.sideChainId
        );
        const signature = await ContractUtils.signMessage(assistant, message);
        const response = await client.post(URI(serverURL).directory("/v1/provider/send/account").toString(), {
            provider: provider.address,
            receiver: receiver.address,
            amount: pointAmount.toString(),
            signature,
        });

        expect(response.data.code).to.equal(0);
        expect(response.data.data).to.not.equal(undefined);
        expect(response.data.data.txHash).to.match(/^0x[A-Fa-f0-9]{64}$/i);

        expect(await contractManager.sideLedgerContract.tokenBalanceOf(provider.address)).to.deep.equal(
            balance0.sub(tokenAmount)
        );
        expect(await contractManager.sideLedgerContract.pointBalanceOf(receiver.address)).to.deep.equal(
            balance1.add(pointAmount)
        );
    });

    it("Provide Point for Phone number by Assistant", async () => {
        const phoneNumber = "+82 10-1000-9000";
        const phoneHash = ContractUtils.getPhoneHash(phoneNumber);
        const provider = deployments.accounts.users[0];
        const assistant = deployments.accounts.users[1];
        const balance0 = await contractManager.sideLedgerContract.tokenBalanceOf(provider.address);
        const balance1 = await contractManager.sideLedgerContract.unPayablePointBalanceOf(phoneHash);
        const pointAmount = Amount.make(10, 18).value;
        const tokenAmount = await contractManager.sideCurrencyRateContract.convertPointToToken(pointAmount);
        const nonce = await contractManager.sideLedgerContract.nonceOf(assistant.address);
        const message = ContractUtils.getProvidePointToPhoneMessage(
            provider.address,
            phoneHash,
            pointAmount,
            nonce,
            contractManager.sideChainId
        );
        const signature = await ContractUtils.signMessage(assistant, message);
        const response = await client.post(URI(serverURL).directory("/v1/provider/send/phoneHash").toString(), {
            provider: provider.address,
            receiver: phoneHash,
            amount: pointAmount.toString(),
            signature,
        });

        expect(response.data.code).to.equal(0);
        expect(response.data.data).to.not.equal(undefined);
        expect(response.data.data.txHash).to.match(/^0x[A-Fa-f0-9]{64}$/i);

        expect(await contractManager.sideLedgerContract.tokenBalanceOf(provider.address)).to.deep.equal(
            balance0.sub(tokenAmount)
        );
        expect(await contractManager.sideLedgerContract.unPayablePointBalanceOf(phoneHash)).to.deep.equal(
            balance1.add(pointAmount)
        );
    });
});
