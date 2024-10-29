import "@nomiclabs/hardhat-ethers";
import { Wallet } from "ethers";
import * as hre from "hardhat";
import { Amount, BOACoin } from "../../src/common/Amount";
import { HardhatAccount } from "../../src/HardhatAccount";
import { ContractUtils } from "../../src/utils/ContractUtils";
import { CurrencyRate, Ledger, LoyaltyProvider } from "../../typechain-types";

import axios from "axios";
import URI from "urijs";
import { URL } from "url";

import { expect } from "chai";

async function getLedgerContract(): Promise<Ledger> {
    const factory = await hre.ethers.getContractFactory("Ledger");
    return factory.attach("0xb72784db105f0E588300827D72359B371bd557df").connect(hre.ethers.provider) as Ledger;
}

async function getCurrencyRateContract(): Promise<CurrencyRate> {
    const factory = await hre.ethers.getContractFactory("CurrencyRate");
    return factory.attach("0xcA0eA6565aE7775B85E2554B1C94e3c757B4d6a2").connect(hre.ethers.provider) as CurrencyRate;
}

async function getProviderContract(): Promise<LoyaltyProvider> {
    const factory = await hre.ethers.getContractFactory("LoyaltyProvider");
    return factory.attach("0x8fCccEE0628CBe6e8B050f6d521Bc14606394533").connect(hre.ethers.provider) as LoyaltyProvider;
}

async function main() {
    const raws = HardhatAccount.keys.map((m) => new Wallet(m, hre.ethers.provider));
    const [deployer] = raws;
    const network_provider = hre.ethers.provider;
    const sideLedgerContract = await getLedgerContract();

    const provider = new Wallet("0x70438bc3ed02b5e4b76d496625cb7c06d6b7bf4362295b16fdfe91a046d4586c"); // 0x64D111eA9763c93a003cef491941A011B8df5a49
    const receiver = new Wallet("0x595f911dcf0845cb1f2d0e5cec9f1ccfd62fa199ebeae215a72aa56014edbb32"); // 0xB6f69F0e9e70034ba0578C542476cC13eF739269
    const agent = await sideLedgerContract.provisioningAgentOf(provider.address);
    console.log(`agent: ${agent}`);

    const balance1 = await sideLedgerContract.pointBalanceOf(receiver.address);
    const pointAmount = Amount.make(100, 18).value;
    const nonce = await sideLedgerContract.nonceOf(provider.address);
    console.log(`chainId: ${hre.ethers.provider.network.chainId}`);
    const message = ContractUtils.getProvidePointToAddressMessage(
        provider.address,
        receiver.address,
        pointAmount,
        nonce,
        24680
    );
    console.log(`provider: ${provider.address}`);
    console.log(`receiver: ${receiver.address}`);
    const signature = await ContractUtils.signMessage(provider, message);

    const client = axios.create();
    const serverURL = new URL(`http://127.0.0.1:7070`);
    const response = await client.post(URI(serverURL).directory("/v1/provider/send/account").toString(), {
        provider: provider.address,
        receiver: receiver.address,
        amount: pointAmount.toString(),
        signature,
    });
    expect(response.data.code).to.equal(0);
    expect(response.data.data).to.not.equal(undefined);
    expect(response.data.data.txHash).to.match(/^0x[A-Fa-f0-9]{64}$/i);
    //
    // const sideLoyaltyProviderContract = await getProviderContract();
    // const tx = await sideLoyaltyProviderContract
    //     .connect(deployer)
    //     .provideToAddress(provider.address, receiver.address, pointAmount, signature);
    //
    // const contractReceipt = await tx.wait();
    // const log = ContractUtils.findLog(
    //     contractReceipt,
    //     sideLoyaltyProviderContract.interface,
    //     "ProvidedLoyaltyPointToAddress"
    // );
    // if (log !== undefined) {
    //     const parsedLog = sideLoyaltyProviderContract.interface.parseLog(log);
    //     console.log(parsedLog.args.provider);
    //     console.log(parsedLog.args.receiver);
    // } else {
    //     console.log("No");
    // }
    const balance2 = await sideLedgerContract.pointBalanceOf(receiver.address);
    console.log(new BOACoin(balance1).toDisplayString(true, 4));
    console.log(new BOACoin(balance2).toDisplayString(true, 4));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
