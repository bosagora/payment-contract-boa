import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

import { Amount } from "../src/common/Amount";
import { Config } from "../src/common/Config";
import { ContractManager } from "../src/contract/ContractManager";
import { ApprovalScheduler } from "../src/scheduler/ApprovalScheduler";
import { CloseScheduler } from "../src/scheduler/CloseScheduler";
import { Scheduler } from "../src/scheduler/Scheduler";
import { WatchScheduler } from "../src/scheduler/WatchScheduler";
import { GraphStorage } from "../src/storage/GraphStorage";
import { RelayStorage } from "../src/storage/RelayStorage";
import { IShopData, IUserData, LoyaltyPaymentTaskStatus } from "../src/types";
import { ContractUtils } from "../src/utils/ContractUtils";
import { BIP20DelegatedTransfer, Ledger, LoyaltyProvider } from "../typechain-types";
import { Deployments } from "./helper/Deployments";
import { FakerCallbackServer } from "./helper/FakerCallbackServer";
import { getPurchaseId, TestClient, TestServer } from "./helper/Utility";

import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";

import * as assert from "assert";
import { Wallet } from "ethers";
import * as fs from "fs";
import { ethers } from "hardhat";
import * as path from "path";
import URI from "urijs";
import { URL } from "url";

chai.use(solidity);

describe("Test of Server", function () {
    this.timeout(1000 * 60 * 5);
    const config = new Config();
    config.readFromFile(path.resolve(process.cwd(), "config", "config_test.yaml"));
    const contractManager = new ContractManager(config);
    const deployments = new Deployments(config);

    let tokenContract: BIP20DelegatedTransfer;
    let providerContract: LoyaltyProvider;
    let ledgerContract: Ledger;

    const amount = Amount.make(20_000, 18);

    let client: TestClient;
    let storage: RelayStorage;
    let server: TestServer;
    let serverURL: URL;

    let fakerCallbackServer: FakerCallbackServer;

    const userData: IUserData[] = [];
    const shopData: IShopData[] = [];

    interface IPurchaseData {
        purchaseId: string;
        amount: number;
        providePercent: number;
        currency: string;
        userIndex: number;
        shopIndex: number;
    }

    context("Test forced close 1", () => {
        before("Load User & Shop", async () => {
            const users = JSON.parse(fs.readFileSync("./src/data/users.json", "utf8")) as IUserData[];
            const userIdx = Math.floor(Math.random() * users.length);
            while (userData.length > 0) userData.pop();
            userData.push(users[userIdx]);

            const shops = JSON.parse(fs.readFileSync("./src/data/shops.json", "utf8")) as IShopData[];
            const shopIdx = Math.floor(Math.random() * shops.length);
            while (shopData.length > 0) shopData.pop();
            shopData.push(shops[shopIdx]);
        });

        before("Transfer native token", async () => {
            for (const user of userData) {
                await deployments.accounts.deployer.sendTransaction({
                    to: user.address,
                    value: Amount.make("100").value,
                });
            }
            for (const shop of shopData) {
                await deployments.accounts.deployer.sendTransaction({
                    to: shop.address,
                    value: Amount.make("100").value,
                });
            }
        });

        before("Deploy", async () => {
            deployments.setShopData(
                shopData.map((m) => {
                    return {
                        shopId: m.shopId,
                        name: m.name,
                        currency: m.currency,
                        wallet: new Wallet(m.privateKey, ethers.provider),
                    };
                })
            );
            await deployments.doDeploy();

            tokenContract = deployments.getContract("TestLYT") as BIP20DelegatedTransfer;
            ledgerContract = deployments.getContract("Ledger") as Ledger;
            providerContract = deployments.getContract("LoyaltyProvider") as LoyaltyProvider;
        });

        before("Create Config", async () => {
            config.contracts.sideChain.tokenAddress = deployments.getContractAddress("TestLYT") || "";
            config.contracts.sideChain.currencyRateAddress = deployments.getContractAddress("CurrencyRate") || "";
            config.contracts.sideChain.phoneLinkerAddress = deployments.getContractAddress("PhoneLinkCollection") || "";
            config.contracts.sideChain.ledgerAddress = deployments.getContractAddress("Ledger") || "";
            config.contracts.sideChain.shopAddress = deployments.getContractAddress("Shop") || "";
            config.contracts.sideChain.loyaltyProviderAddress = deployments.getContractAddress("LoyaltyProvider") || "";
            config.contracts.sideChain.loyaltyConsumerAddress = deployments.getContractAddress("LoyaltyConsumer") || "";
            config.contracts.sideChain.loyaltyExchangerAddress =
                deployments.getContractAddress("LoyaltyExchanger") || "";
            config.contracts.sideChain.loyaltyTransferAddress = deployments.getContractAddress("LoyaltyTransfer") || "";
            config.contracts.sideChain.loyaltyBridgeAddress = deployments.getContractAddress("LoyaltyBridge") || "";
            config.contracts.sideChain.chainBridgeAddress = deployments.getContractAddress("SideChainBridge") || "";

            config.contracts.mainChain.tokenAddress = deployments.getContractAddress("MainChainKIOS") || "";
            config.contracts.mainChain.loyaltyBridgeAddress =
                deployments.getContractAddress("MainChainLoyaltyBridge") || "";
            config.contracts.mainChain.chainBridgeAddress = deployments.getContractAddress("MainChainBridge") || "";

            config.relay.certifiers = deployments.accounts.certifiers.map((m) => m.privateKey);
            config.relay.forcedCloseSecond = 5;
            config.relay.paymentTimeoutSecond = 2;
            config.relay.callbackEndpoint = "http://127.0.0.1:3400/callback";
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

            const schedulers: Scheduler[] = [];
            schedulers.push(new CloseScheduler("*/1 * * * * *"));
            schedulers.push(new WatchScheduler("*/1 * * * * *"));
            const graph_sidechain = await GraphStorage.make(config.graph_sidechain);
            const graph_mainchain = await GraphStorage.make(config.graph_mainchain);
            await contractManager.attach();
            server = new TestServer(config, contractManager, storage, graph_sidechain, graph_mainchain, schedulers);
        });

        before("Start TestServer", async () => {
            await server.start();
        });

        after("Stop TestServer", async () => {
            await server.stop();
            await storage.dropTestDB();
        });

        before("Start CallbackServer", async () => {
            fakerCallbackServer = new FakerCallbackServer(3400);
            await fakerCallbackServer.start();
        });

        after("Stop CallbackServer", async () => {
            await fakerCallbackServer.stop();
        });

        it("Transfer token", async () => {
            for (const account of userData) {
                await tokenContract.connect(deployments.accounts.owner).transfer(account.address, amount.value);
            }

            for (const account of shopData) {
                await tokenContract.connect(deployments.accounts.owner).transfer(account.address, amount.value);
            }
        });

        it("Provide Loyalty Point - Save Purchase Data", async () => {
            const phoneHash = ContractUtils.getPhoneHash("");
            const purchaseAmount = Amount.make(100_000_000, 18).value;
            const loyaltyAmount = purchaseAmount.mul(10).div(100);
            const purchaseParam = await Promise.all(
                userData.map(async (m) => {
                    const purchaseItem = {
                        purchaseId: getPurchaseId(),
                        amount: purchaseAmount,
                        loyalty: loyaltyAmount,
                        currency: "krw",
                        shopId: shopData[0].shopId,
                        account: m.address,
                        phone: phoneHash,
                        sender: deployments.accounts.system.address,
                        signature: "",
                    };
                    purchaseItem.signature = await ContractUtils.getPurchaseSignature(
                        deployments.accounts.system,
                        purchaseItem,
                        contractManager.sideChainId
                    );
                    return purchaseItem;
                })
            );
            const purchaseMessage = ContractUtils.getPurchasesMessage(0, purchaseParam, contractManager.sideChainId);
            const signatures = await Promise.all(
                deployments.accounts.validators.map((m) => ContractUtils.signMessage(m, purchaseMessage))
            );
            const proposeMessage = ContractUtils.getPurchasesProposeMessage(
                0,
                purchaseParam,
                signatures,
                contractManager.sideChainId
            );
            const proposerSignature = await ContractUtils.signMessage(
                deployments.accounts.validators[0],
                proposeMessage
            );
            await providerContract
                .connect(deployments.accounts.certifiers[0])
                .savePurchase(0, purchaseParam, signatures, proposerSignature);

            for (const user of userData) {
                expect(await ledgerContract.pointBalanceOf(user.address)).to.equal(loyaltyAmount);
            }
        });

        context("Test of payment", async () => {
            const purchase: IPurchaseData = {
                purchaseId: getPurchaseId(),
                amount: 1000,
                providePercent: 10,
                currency: "krw",
                shopIndex: 0,
                userIndex: 0,
            };
            const purchaseAmount = Amount.make(purchase.amount, 18).value;

            let paymentId: string;
            it("Open New Payment", async () => {
                const url = URI(serverURL).directory("/v1/payment/new").filename("open").toString();

                const params = {
                    purchaseId: purchase.purchaseId,
                    amount: purchaseAmount.toString(),
                    currency: "krw",
                    shopId: shopData[purchase.shopIndex].shopId,
                    account: userData[purchase.userIndex].address,
                };
                const response = await client.post(url, params);

                assert.deepStrictEqual(response.data.code, 0, response.data?.error?.message);
                assert.ok(response.data.data !== undefined);

                assert.deepStrictEqual(response.data.data.account, userData[purchase.userIndex].address);
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.OPENED_NEW);

                paymentId = response.data.data.paymentId;
            });

            it("...Waiting for FAILED_NEW", async () => {
                const t1 = ContractUtils.getTimeStamp();
                while (true) {
                    const responseItem = await client.get(
                        URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                    );
                    if (responseItem.data.data.paymentStatus === LoyaltyPaymentTaskStatus.FAILED_NEW) break;
                    else if (ContractUtils.getTimeStamp() - t1 > 60) break;
                    await ContractUtils.delay(2000);
                }
            });

            it("...Check Payment Status - FAILED_NEW", async () => {
                const response = await client.get(
                    URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                );
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.FAILED_NEW);
            });
        });
    });

    context("Test forced close 2", () => {
        before("Load User & Shop", async () => {
            const users = JSON.parse(fs.readFileSync("./src/data/users.json", "utf8")) as IUserData[];
            const userIdx = Math.floor(Math.random() * users.length);
            while (userData.length > 0) userData.pop();
            userData.push(users[userIdx]);

            const shops = JSON.parse(fs.readFileSync("./src/data/shops.json", "utf8")) as IShopData[];
            const shopIdx = Math.floor(Math.random() * shops.length);
            while (shopData.length > 0) shopData.pop();
            shopData.push(shops[shopIdx]);
        });

        before("Transfer native token", async () => {
            for (const user of userData) {
                await deployments.accounts.deployer.sendTransaction({
                    to: user.address,
                    value: Amount.make("100").value,
                });
            }
            for (const shop of shopData) {
                await deployments.accounts.deployer.sendTransaction({
                    to: shop.address,
                    value: Amount.make("100").value,
                });
            }
        });

        before("Deploy", async () => {
            deployments.setShopData(
                shopData.map((m) => {
                    return {
                        shopId: m.shopId,
                        name: m.name,
                        currency: m.currency,
                        wallet: new Wallet(m.privateKey, ethers.provider),
                    };
                })
            );
            await deployments.doDeploy();

            tokenContract = deployments.getContract("TestLYT") as BIP20DelegatedTransfer;
            ledgerContract = deployments.getContract("Ledger") as Ledger;
            providerContract = deployments.getContract("LoyaltyProvider") as LoyaltyProvider;
        });

        before("Create Config", async () => {
            config.contracts.sideChain.tokenAddress = deployments.getContractAddress("TestLYT") || "";
            config.contracts.sideChain.currencyRateAddress = deployments.getContractAddress("CurrencyRate") || "";
            config.contracts.sideChain.phoneLinkerAddress = deployments.getContractAddress("PhoneLinkCollection") || "";
            config.contracts.sideChain.ledgerAddress = deployments.getContractAddress("Ledger") || "";
            config.contracts.sideChain.shopAddress = deployments.getContractAddress("Shop") || "";
            config.contracts.sideChain.loyaltyProviderAddress = deployments.getContractAddress("LoyaltyProvider") || "";
            config.contracts.sideChain.loyaltyConsumerAddress = deployments.getContractAddress("LoyaltyConsumer") || "";
            config.contracts.sideChain.loyaltyExchangerAddress =
                deployments.getContractAddress("LoyaltyExchanger") || "";
            config.contracts.sideChain.loyaltyTransferAddress = deployments.getContractAddress("LoyaltyTransfer") || "";
            config.contracts.sideChain.loyaltyBridgeAddress = deployments.getContractAddress("LoyaltyBridge") || "";
            config.contracts.sideChain.chainBridgeAddress = deployments.getContractAddress("SideChainBridge") || "";

            config.contracts.mainChain.tokenAddress = deployments.getContractAddress("MainChainKIOS") || "";
            config.contracts.mainChain.loyaltyBridgeAddress =
                deployments.getContractAddress("MainChainLoyaltyBridge") || "";
            config.contracts.mainChain.chainBridgeAddress = deployments.getContractAddress("MainChainBridge") || "";

            config.relay.certifiers = deployments.accounts.certifiers.map((m) => m.privateKey);
            config.relay.approvalSecond = 2;
            config.relay.forcedCloseSecond = 5;
            config.relay.callbackEndpoint = "http://127.0.0.1:3400/callback";
            config.relay.relayEndpoint = `http://127.0.0.1:${config.server.port}`;
        });

        before("Create TestServer", async () => {
            serverURL = new URL(`http://127.0.0.1:${config.server.port}`);
            storage = await RelayStorage.make(config.database);

            const schedulers: Scheduler[] = [];
            schedulers.push(new ApprovalScheduler("*/1 * * * * *"));
            schedulers.push(new CloseScheduler("*/1 * * * * *"));
            schedulers.push(new WatchScheduler("*/1 * * * * *"));
            const graph_sidechain = await GraphStorage.make(config.graph_sidechain);
            const graph_mainchain = await GraphStorage.make(config.graph_mainchain);
            await contractManager.attach();
            server = new TestServer(config, contractManager, storage, graph_sidechain, graph_mainchain, schedulers);
        });

        before("Start TestServer", async () => {
            await server.start();
        });

        after("Stop TestServer", async () => {
            await server.stop();
            await storage.dropTestDB();
        });

        before("Start CallbackServer", async () => {
            fakerCallbackServer = new FakerCallbackServer(3400);
            await fakerCallbackServer.start();
        });

        after("Stop CallbackServer", async () => {
            await fakerCallbackServer.stop();
        });

        it("Provide Loyalty Point - Save Purchase Data", async () => {
            const phoneHash = ContractUtils.getPhoneHash("");
            const purchaseAmount = Amount.make(100_000_000, 18).value;
            const loyaltyAmount = purchaseAmount.mul(10).div(100);
            const purchaseParam = await Promise.all(
                userData.map(async (m) => {
                    const purchaseItem = {
                        purchaseId: getPurchaseId(),
                        amount: purchaseAmount,
                        loyalty: loyaltyAmount,
                        currency: "krw",
                        shopId: shopData[0].shopId,
                        account: m.address,
                        phone: phoneHash,
                        sender: deployments.accounts.system.address,
                        signature: "",
                    };
                    purchaseItem.signature = await ContractUtils.getPurchaseSignature(
                        deployments.accounts.system,
                        purchaseItem,
                        contractManager.sideChainId
                    );
                    return purchaseItem;
                })
            );
            const purchaseMessage = ContractUtils.getPurchasesMessage(0, purchaseParam, contractManager.sideChainId);
            const signatures = await Promise.all(
                deployments.accounts.validators.map((m) => ContractUtils.signMessage(m, purchaseMessage))
            );
            const proposeMessage = ContractUtils.getPurchasesProposeMessage(
                0,
                purchaseParam,
                signatures,
                contractManager.sideChainId
            );
            const proposerSignature = await ContractUtils.signMessage(
                deployments.accounts.validators[0],
                proposeMessage
            );
            await providerContract
                .connect(deployments.accounts.certifiers[0])
                .savePurchase(0, purchaseParam, signatures, proposerSignature);

            for (const user of userData) {
                assert.deepStrictEqual(await ledgerContract.pointBalanceOf(user.address), loyaltyAmount);
            }
        });

        context("Test of payment", async () => {
            const purchase: IPurchaseData = {
                purchaseId: getPurchaseId(),
                amount: 1000,
                providePercent: 10,
                currency: "krw",
                shopIndex: 0,
                userIndex: 0,
            };
            const purchaseAmount = Amount.make(purchase.amount, 18).value;

            let paymentId: string;
            it("Open New Payment", async () => {
                const url = URI(serverURL).directory("/v1/payment/new").filename("open").toString();

                const params = {
                    purchaseId: purchase.purchaseId,
                    amount: purchaseAmount.toString(),
                    currency: "krw",
                    shopId: shopData[purchase.shopIndex].shopId,
                    account: userData[purchase.userIndex].address,
                };
                const response = await client.post(url, params);

                assert.deepStrictEqual(response.data.code, 0, response.data?.error?.message);
                assert.ok(response.data.data !== undefined);

                assert.deepStrictEqual(response.data.data.account, userData[purchase.userIndex].address);
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.OPENED_NEW);

                paymentId = response.data.data.paymentId;
            });

            it("...Waiting for REPLY_COMPLETED_NEW", async () => {
                const t1 = ContractUtils.getTimeStamp();
                while (true) {
                    const responseItem = await client.get(
                        URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                    );
                    if (responseItem.data.data.paymentStatus === LoyaltyPaymentTaskStatus.REPLY_COMPLETED_NEW) break;
                    else if (ContractUtils.getTimeStamp() - t1 > 60) break;
                    await ContractUtils.delay(1000);
                }
            });

            it("Close New Payment", async () => {
                const url = URI(serverURL).directory("/v1/payment/new").filename("close").toString();
                const params = {
                    confirm: true,
                    paymentId,
                };
                const response = await client.post(url, params);
                assert.deepStrictEqual(response.data.code, 0, response.data?.error?.message);
                assert.ok(response.data.data !== undefined);
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.CLOSED_NEW);
            });

            it("...Waiting", async () => {
                await ContractUtils.delay(3000);
            });

            it("Open Cancel Payment", async () => {
                const url = URI(serverURL).directory("/v1/payment/cancel").filename("open").toString();

                const params = {
                    paymentId,
                };
                const response = await client.post(url, params);

                assert.deepStrictEqual(response.data.code, 0);
                assert.ok(response.data.data !== undefined);

                assert.deepStrictEqual(response.data.data.paymentId, paymentId);
                assert.deepStrictEqual(response.data.data.purchaseId, purchase.purchaseId);
                assert.deepStrictEqual(response.data.data.account, userData[purchase.userIndex].address);
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.OPENED_CANCEL);
            });

            it("...Waiting for REPLY_COMPLETED_CANCEL", async () => {
                const t1 = ContractUtils.getTimeStamp();
                while (true) {
                    const responseItem = await client.get(
                        URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                    );
                    if (responseItem.data.data.paymentStatus === LoyaltyPaymentTaskStatus.REPLY_COMPLETED_CANCEL) break;
                    else if (ContractUtils.getTimeStamp() - t1 > 60) break;
                    await ContractUtils.delay(1000);
                }
            });

            it("...Waiting for FAILED_CANCEL", async () => {
                const t1 = ContractUtils.getTimeStamp();
                while (true) {
                    const responseItem = await client.get(
                        URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                    );
                    if (responseItem.data.data.paymentStatus === LoyaltyPaymentTaskStatus.FAILED_CANCEL) break;
                    else if (ContractUtils.getTimeStamp() - t1 > 60) break;
                    await ContractUtils.delay(1000);
                }
            });

            it("...Check Payment Status - FAILED_CANCEL", async () => {
                const response = await client.get(
                    URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                );
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.FAILED_CANCEL);
            });
        });
    });
});
