import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

import { Amount } from "../src/common/Amount";
import { Config } from "../src/common/Config";
import { DelegatorApprovalScheduler } from "../src/scheduler/DelegatorApprovalScheduler";
import { Scheduler } from "../src/scheduler/Scheduler";
import { WatchScheduler } from "../src/scheduler/WatchScheduler";
import { GraphStorage } from "../src/storage/GraphStorage";
import { RelayStorage } from "../src/storage/RelayStorage";
import { ContractShopStatus, LoyaltyPaymentTaskStatus, ShopTaskStatus, TaskResultType } from "../src/types";
import { ContractUtils, LoyaltyNetworkID } from "../src/utils/ContractUtils";
import {
    BIP20DelegatedTransfer,
    CurrencyRate,
    Ledger,
    LoyaltyConsumer,
    LoyaltyExchanger,
    LoyaltyProvider,
    PhoneLinkCollection,
    Shop,
    Validator,
} from "../typechain-types";

import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";

import { Wallet } from "ethers";
import { ethers } from "hardhat";

import { ContractManager } from "../src/contract/ContractManager";
import { Deployments } from "./helper/Deployments";
import { FakerCallbackServer } from "./helper/FakerCallbackServer";
import { getPurchaseId, TestClient, TestServer } from "./helper/Utility";

import * as assert from "assert";
import * as path from "path";
import { URL } from "url";

// tslint:disable-next-line:no-var-requires
const URI = require("urijs");

chai.use(solidity);

describe("Test of Delegator", function () {
    this.timeout(1000 * 60 * 5);
    const config = new Config();
    config.readFromFile(path.resolve(process.cwd(), "config", "config_test.yaml"));
    const contractManager = new ContractManager(config);

    const deployments = new Deployments(config);
    const users = deployments.accounts.users;
    const shops = deployments.accounts.shops;

    let validatorContract: Validator;
    let tokenContract: BIP20DelegatedTransfer;
    let linkContract: PhoneLinkCollection;
    let currencyRateContract: CurrencyRate;
    let shopContract: Shop;
    let consumerContract: LoyaltyConsumer;
    let providerContract: LoyaltyProvider;
    let exchangerContract: LoyaltyExchanger;
    let ledgerContract: Ledger;

    const amount = Amount.make(20_000, 18);

    let client: TestClient;
    let storage: RelayStorage;
    let server: TestServer;
    let serverURL: URL;

    let fakerCallbackServer: FakerCallbackServer;

    interface IShopData {
        shopId: string;
        name: string;
        currency: string;
        wallet: Wallet;
    }

    const shopData: IShopData[] = [
        {
            shopId: "F000100",
            name: "Shop1",
            currency: "krw",
            wallet: shops[0],
        },
    ];

    interface IUserData {
        phone: string;
        wallet: Wallet;
        address: string;
        privateKey: string;
    }

    const userData: IUserData[] = [
        {
            phone: "08201012341001",
            wallet: users[0],
            address: users[0].address,
            privateKey: users[0].privateKey,
        },
    ];

    interface IPurchaseData {
        purchaseId: string;
        amount: number;
        providePercent: number;
        currency: string;
        userIndex: number;
        shopIndex: number;
    }

    context("Test delegator approval", () => {
        before("Set Shop ID", async () => {
            for (const elem of shopData) {
                elem.shopId = ContractUtils.getShopId(elem.wallet.address, LoyaltyNetworkID.KIOS_TESTNET);
            }
        });

        before("Deploy", async () => {
            deployments.setShopData(shopData);
            await deployments.doDeploy();

            validatorContract = deployments.getContract("Validator") as Validator;
            tokenContract = deployments.getContract("TestLYT") as BIP20DelegatedTransfer;
            ledgerContract = deployments.getContract("Ledger") as Ledger;
            linkContract = deployments.getContract("PhoneLinkCollection") as PhoneLinkCollection;
            consumerContract = deployments.getContract("LoyaltyConsumer") as LoyaltyConsumer;
            providerContract = deployments.getContract("LoyaltyProvider") as LoyaltyProvider;
            exchangerContract = deployments.getContract("LoyaltyExchanger") as LoyaltyExchanger;
            currencyRateContract = deployments.getContract("CurrencyRate") as CurrencyRate;
            shopContract = deployments.getContract("Shop") as Shop;
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

            config.relay.managerKeys = deployments.accounts.certifiers.map((m) => m.privateKey);
            config.relay.approvalSecond = 2;
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
            const graph_sidechain = await GraphStorage.make(config.graph_sidechain);
            const graph_mainchain = await GraphStorage.make(config.graph_mainchain);

            const schedulers: Scheduler[] = [];
            schedulers.push(new DelegatorApprovalScheduler("*/1 * * * * *"));
            schedulers.push(new WatchScheduler("*/1 * * * * *"));
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
                expect(await ledgerContract.pointBalanceOf(user.address)).to.equal(loyaltyAmount);
            }
        });

        let delegator: string;
        it("Endpoint POST /v1/shop/account/delegator/create", async () => {
            const url = URI(serverURL).directory("/v1/shop/account/delegator").filename("create").toString();

            const nonce = await shopContract.nonceOf(shopData[0].wallet.address);
            const message = ContractUtils.getShopAccountMessage(
                shopData[0].shopId,
                shopData[0].wallet.address,
                nonce,
                contractManager.sideChainId
            );
            const signature = await ContractUtils.signMessage(shopData[0].wallet, message);
            const params = {
                shopId: shopData[0].shopId,
                account: shopData[0].wallet.address,
                signature,
            };
            const response = await client.post(url, params);

            assert.deepStrictEqual(response.data.code, 0);
            assert.ok(response.data.data !== undefined);

            delegator = response.data.data.delegator;
        });

        it("Endpoint POST /v1/shop/account/delegator/save", async () => {
            const url = URI(serverURL).directory("/v1/shop/account/delegator").filename("save").toString();

            const nonce = await shopContract.nonceOf(shopData[0].wallet.address);
            const message = ContractUtils.getShopDelegatorAccountMessage(
                shopData[0].shopId,
                delegator,
                shopData[0].wallet.address,
                nonce,
                contractManager.sideChainId
            );
            const signature = await ContractUtils.signMessage(shopData[0].wallet, message);
            const params = {
                shopId: shopData[0].shopId,
                delegator,
                account: shopData[0].wallet.address,
                signature,
            };
            const response = await client.post(url, params);

            assert.deepStrictEqual(response.data.code, 0);
            assert.ok(response.data.data !== undefined);
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

            it("...Waiting", async () => {
                await ContractUtils.delay(2000);
            });

            it("Open New Approval", async () => {
                const responseItem = await client.get(
                    URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                );

                const nonce = await ledgerContract.nonceOf(userData[purchase.userIndex].address);
                const signature = await ContractUtils.signLoyaltyNewPayment(
                    new Wallet(userData[purchase.userIndex].privateKey),
                    paymentId,
                    responseItem.data.data.purchaseId,
                    responseItem.data.data.amount,
                    responseItem.data.data.currency,
                    responseItem.data.data.shopId,
                    nonce,
                    contractManager.sideChainId
                );

                const params = {
                    paymentId,
                    approval: "true",
                    signature,
                };
                const response = await client.post(
                    URI(serverURL).directory("/v1/payment/new").filename("approval").toString(),
                    params
                );

                assert.deepStrictEqual(response.data.code, 0);
                assert.ok(response.data.data !== undefined);
                assert.ok(response.data.data.txHash !== undefined);
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.APPROVED_NEW_SENT_TX);
            });

            it("...Waiting", async () => {
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

            it("...Check Payment Status - REPLY_COMPLETED_NEW", async () => {
                const response = await client.get(
                    URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                );
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.REPLY_COMPLETED_NEW);
            });

            it("Close New Payment", async () => {
                const response = await client.post(
                    URI(serverURL).directory("/v1/payment/new").filename("close").toString(),
                    {
                        confirm: true,
                        paymentId,
                    }
                );

                assert.deepStrictEqual(response.data.code, 0);
                assert.ok(response.data.data !== undefined);
                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.CLOSED_NEW);
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

            it("...Waiting", async () => {
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

            it("...Check Payment Status - REPLY_COMPLETED_CANCEL", async () => {
                const response = await client.get(
                    URI(serverURL).directory("/v1/payment/item").addQuery("paymentId", paymentId).toString()
                );
                assert.deepStrictEqual(
                    response.data.data.paymentStatus,
                    LoyaltyPaymentTaskStatus.REPLY_COMPLETED_CANCEL
                );
            });

            it("Close Cancel Payment", async () => {
                const response = await client.post(
                    URI(serverURL).directory("/v1/payment/cancel").filename("close").toString(),
                    {
                        confirm: true,
                        paymentId,
                    }
                );

                assert.deepStrictEqual(response.data.code, 0);
                assert.ok(response.data.data !== undefined);

                assert.deepStrictEqual(response.data.data.paymentStatus, LoyaltyPaymentTaskStatus.CLOSED_CANCEL);
            });
        });

        context("Test of shop update", async () => {
            let taskId: string;
            it("Create New Task for updating shop's information", async () => {
                const url = URI(serverURL).directory("/v1/shop/update").filename("create").toString();
                const params = {
                    shopId: shopData[0].shopId,
                    name: "새로운 이름",
                    currency: shopData[0].currency,
                };
                const response = await client.post(url, params);
                assert.deepStrictEqual(response.data.code, 0);
                assert.ok(response.data.data !== undefined);
                assert.deepStrictEqual(response.data.data.taskStatus, ShopTaskStatus.OPENED);
                taskId = response.data.data.taskId;
            });

            it("...Waiting", async () => {
                const t1 = ContractUtils.getTimeStamp();
                while (true) {
                    const responseItem = await client.get(
                        URI(serverURL).directory("/v1/shop/task").addQuery("taskId", taskId).toString()
                    );
                    if (responseItem.data.data.taskStatus === ShopTaskStatus.COMPLETED) break;
                    else if (ContractUtils.getTimeStamp() - t1 > 60) break;
                    await ContractUtils.delay(1000);
                }
            });

            it("...Check Shop Task Status - COMPLETED", async () => {
                const url = URI(serverURL).directory("/v1/shop/task").addQuery("taskId", taskId).toString();
                const response = await client.get(url);
                assert.deepStrictEqual(response.data.code, 0);
                assert.ok(response.data.data !== undefined);
                assert.deepStrictEqual(response.data.data.taskStatus, ShopTaskStatus.COMPLETED);
            });

            it("...Waiting", async () => {
                await ContractUtils.delay(2000);
            });
        });

        context("Test of shop status", async () => {
            let taskId: string;
            it("Create New Task for updating shop's status", async () => {
                const url = URI(serverURL).directory("/v1/shop/status").filename("create").toString();
                const params = {
                    shopId: shopData[0].shopId,
                    status: ContractShopStatus.INACTIVE,
                };
                const response = await client.post(url, params);
                assert.deepStrictEqual(response.data.code, 0);
                assert.ok(response.data.data !== undefined);
                assert.deepStrictEqual(response.data.data.taskStatus, ShopTaskStatus.OPENED);
                taskId = response.data.data.taskId;
            });

            it("...Waiting", async () => {
                const t1 = ContractUtils.getTimeStamp();
                while (true) {
                    const responseItem = await client.get(
                        URI(serverURL).directory("/v1/shop/task").addQuery("taskId", taskId).toString()
                    );
                    if (responseItem.data.data.taskStatus === ShopTaskStatus.COMPLETED) break;
                    else if (ContractUtils.getTimeStamp() - t1 > 60) break;
                    await ContractUtils.delay(1000);
                }
            });

            it("...Check Shop Task Status - COMPLETED", async () => {
                const url = URI(serverURL).directory("/v1/shop/task").addQuery("taskId", taskId).toString();
                const response = await client.get(url);
                assert.deepStrictEqual(response.data.code, 0);
                assert.ok(response.data.data !== undefined);
                assert.deepStrictEqual(response.data.data.type, TaskResultType.STATUS);
                assert.deepStrictEqual(response.data.data.taskStatus, ShopTaskStatus.COMPLETED);
            });

            it("...Waiting", async () => {
                await ContractUtils.delay(2000);
            });
        });
    });
});
