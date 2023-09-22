import {
    Deposited as DepositedEvent,
    ExchangedMileageToToken as ExchangedMileageToTokenEvent,
    ExchangedTokenToMileage as ExchangedTokenToMileageEvent,
    PaidMileage as PaidMileageEvent,
    PaidToken as PaidTokenEvent,
    ProvidedMileage as ProvidedMileageEvent,
    ProvidedMileageToFranchisee as ProvidedMileageToFranchiseeEvent,
    ProvidedToken as ProvidedTokenEvent,
    SavedPurchase as SavedPurchaseEvent,
    Withdrawn as WithdrawnEvent,
} from "../generated/Ledger/Ledger";
import {
    Deposited,
    ExchangedMileageToToken,
    ExchangedTokenToMileage,
    PaidMileage,
    PaidToken,
    ProvidedMileage,
    ProvidedMileageToFranchisee,
    ProvidedToken,
    SavedPurchase,
    Withdrawn,
    UserBalance,
    UserTradeHistory,
} from "../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AmountUnit, NullAccount } from "./utils";

export function handleDeposited(event: DepositedEvent): void {
    let entity = new Deposited(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.depositAmount = event.params.depositAmount;
    entity.value = event.params.value;
    entity.balanceToken = event.params.balanceToken;
    entity.account = event.params.account;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleDepositedForHistory(event);
}

export function handleExchangedMileageToToken(event: ExchangedMileageToTokenEvent): void {
    let entity = new ExchangedMileageToToken(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.amountMileage = event.params.amountMileage;
    entity.amountToken = event.params.amountToken;
    entity.balanceMileage = event.params.balanceMileage;
    entity.balanceToken = event.params.balanceToken;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleExchangedMileageToTokenForHistory(event);
}

export function handleExchangedTokenToMileage(event: ExchangedTokenToMileageEvent): void {
    let entity = new ExchangedTokenToMileage(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.amountMileage = event.params.amountMileage;
    entity.amountToken = event.params.amountToken;
    entity.balanceMileage = event.params.balanceMileage;
    entity.balanceToken = event.params.balanceToken;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleExchangedTokenToMileageForHistory(event);
}

export function handlePaidMileage(event: PaidMileageEvent): void {
    let entity = new PaidMileage(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.paidAmountMileage = event.params.paidAmountMileage;
    entity.value = event.params.value;
    entity.balanceMileage = event.params.balanceMileage;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handlePaidMileageForHistory(event);
}

export function handlePaidToken(event: PaidTokenEvent): void {
    let entity = new PaidToken(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.paidAmountToken = event.params.paidAmountToken;
    entity.value = event.params.value;
    entity.balanceToken = event.params.balanceToken;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handlePaidTokenForHistory(event);
}

export function handleProvidedMileage(event: ProvidedMileageEvent): void {
    let entity = new ProvidedMileage(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.providedAmountMileage = event.params.providedAmountMileage;
    entity.value = event.params.value;
    entity.balanceMileage = event.params.balanceMileage;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleProvidedMileageForHistory(event);
}

export function handleProvidedMileageToFranchisee(event: ProvidedMileageToFranchiseeEvent): void {
    let entity = new ProvidedMileageToFranchisee(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.providedAmountMileage = event.params.providedAmountMileage;
    entity.value = event.params.value;
    entity.balanceMileage = event.params.balanceMileage;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleProvidedMileageToFranchiseeForHistory(event);
}

export function handleProvidedToken(event: ProvidedTokenEvent): void {
    let entity = new ProvidedToken(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.providedAmountToken = event.params.providedAmountToken;
    entity.value = event.params.value;
    entity.balanceToken = event.params.balanceToken;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleProvidedTokenForHistory(event);
}

export function handleSavedPurchase(event: SavedPurchaseEvent): void {
    let entity = new SavedPurchase(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.purchaseId = event.params.purchaseId;
    entity.timestamp = event.params.timestamp;
    entity.amount = event.params.amount;
    entity.email = event.params.email;
    entity.franchiseeId = event.params.franchiseeId;
    entity.method = event.params.method;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
    let entity = new Withdrawn(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.withdrawAmount = event.params.withdrawAmount;
    entity.value = event.params.value;
    entity.balanceToken = event.params.balanceToken;
    entity.account = event.params.account;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleWithdrawnForHistory(event);
}

export function handleChangedBalanceMileage(
    email: Bytes,
    balance: BigInt,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes
): UserBalance {
    let entity = UserBalance.load(email.toHex());
    if (entity !== null) {
        entity.mileage = balance.div(AmountUnit);
        entity.blockNumber = blockNumber;
        entity.blockTimestamp = blockTimestamp;
        entity.transactionHash = transactionHash;
        entity.save();
    } else {
        entity = new UserBalance(email.toHex());
        entity.mileage = balance.div(AmountUnit);
        entity.token = BigInt.fromI32(0);
        entity.blockNumber = blockNumber;
        entity.blockTimestamp = blockTimestamp;
        entity.transactionHash = transactionHash;
        entity.save();
    }
    return entity;
}

export function handleChangedBalanceToken(
    email: Bytes,
    balance: BigInt,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes
): UserBalance {
    let entity = UserBalance.load(email.toHex());
    if (entity !== null) {
        entity.token = balance.div(AmountUnit);
        entity.blockNumber = blockNumber;
        entity.blockTimestamp = blockTimestamp;
        entity.transactionHash = transactionHash;
        entity.save();
    } else {
        entity = new UserBalance(email.toHex());
        entity.token = balance.div(AmountUnit);
        entity.mileage = BigInt.fromI32(0);
        entity.blockNumber = blockNumber;
        entity.blockTimestamp = blockTimestamp;
        entity.transactionHash = transactionHash;
        entity.save();
    }
    return entity;
}

export function handleProvidedMileageForHistory(event: ProvidedMileageEvent): void {
    const balanceEntity = handleChangedBalanceMileage(
        event.params.email,
        event.params.balanceMileage,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "ProvidedMileage";
    entity.assetFlow = "MileageInput";
    entity.amountMileage = event.params.providedAmountMileage;
    entity.amountToken = BigInt.fromI32(0);
    entity.value = event.params.value.div(AmountUnit);
    entity.balanceMileage = event.params.balanceMileage;
    entity.balanceToken = balanceEntity.token;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;
    entity.account = NullAccount;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleProvidedMileageToFranchiseeForHistory(event: ProvidedMileageToFranchiseeEvent): void {
    const balanceEntity = handleChangedBalanceMileage(
        event.params.email,
        event.params.balanceMileage,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "ClearedMileage";
    entity.assetFlow = "MileageInput";
    entity.amountMileage = event.params.providedAmountMileage.div(AmountUnit);
    entity.amountToken = BigInt.fromI32(0);
    entity.value = event.params.value.div(AmountUnit);
    entity.balanceMileage = event.params.balanceMileage.div(AmountUnit);
    entity.balanceToken = balanceEntity.token;
    entity.franchiseeId = event.params.franchiseeId;
    entity.account = NullAccount;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleProvidedTokenForHistory(event: ProvidedTokenEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.email,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "ProvidedToken";
    entity.assetFlow = "TokenInput";
    entity.amountMileage = BigInt.fromI32(0);
    entity.amountToken = event.params.providedAmountToken.div(AmountUnit);
    entity.value = event.params.value.div(AmountUnit);
    entity.balanceToken = event.params.balanceToken;
    entity.balanceMileage = balanceEntity.mileage;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;
    entity.account = NullAccount;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handlePaidMileageForHistory(event: PaidMileageEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.email,
        event.params.balanceMileage,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "PaidMileage";
    entity.assetFlow = "MileageOutput";
    entity.amountMileage = event.params.paidAmountMileage.div(AmountUnit);
    entity.amountToken = BigInt.fromI32(0);
    entity.value = event.params.value.div(AmountUnit);
    entity.balanceMileage = event.params.balanceMileage.div(AmountUnit);
    entity.balanceToken = balanceEntity.token;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;
    entity.account = NullAccount;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handlePaidTokenForHistory(event: PaidTokenEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.email,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "PaidToken";
    entity.assetFlow = "TokenOutput";
    entity.amountMileage = BigInt.fromI32(0);
    entity.amountToken = event.params.paidAmountToken.div(AmountUnit);
    entity.value = event.params.value.div(AmountUnit);
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.balanceMileage = balanceEntity.mileage;
    entity.purchaseId = event.params.purchaseId;
    entity.franchiseeId = event.params.franchiseeId;
    entity.account = NullAccount;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleDepositedForHistory(event: DepositedEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.email,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "DepositedToken";
    entity.assetFlow = "TokenInput";
    entity.amountMileage = BigInt.fromI32(0);
    entity.amountToken = event.params.depositAmount.div(AmountUnit);
    entity.value = event.params.value.div(AmountUnit);
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.balanceMileage = balanceEntity.mileage;
    entity.purchaseId = "";
    entity.franchiseeId = "";
    entity.account = event.params.account;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleWithdrawnForHistory(event: WithdrawnEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.email,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "WithdrawnToken";
    entity.assetFlow = "TokenOutput";
    entity.amountMileage = BigInt.fromI32(0);
    entity.amountToken = event.params.withdrawAmount.div(AmountUnit);
    entity.value = event.params.value.div(AmountUnit);
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.balanceMileage = balanceEntity.mileage;
    entity.purchaseId = "";
    entity.franchiseeId = "";
    entity.account = event.params.account;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleExchangedMileageToTokenForHistory(event: ExchangedMileageToTokenEvent): void {
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "ExchangedMileageToToken";
    entity.assetFlow = "None";
    entity.amountMileage = event.params.amountMileage.div(AmountUnit);
    entity.amountToken = event.params.amountToken.div(AmountUnit);
    entity.value = event.params.amountMileage.div(AmountUnit);
    entity.balanceMileage = event.params.balanceMileage.div(AmountUnit);
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.purchaseId = "";
    entity.franchiseeId = "";
    entity.account = NullAccount;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleChangedBalanceMileage(
        event.params.email,
        event.params.balanceMileage,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    handleChangedBalanceToken(
        event.params.email,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
}

export function handleExchangedTokenToMileageForHistory(event: ExchangedTokenToMileageEvent): void {
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.email = event.params.email;
    entity.action = "ExchangedTokenToMileage";
    entity.assetFlow = "None";
    entity.amountMileage = event.params.amountMileage.div(AmountUnit);
    entity.amountToken = event.params.amountToken.div(AmountUnit);
    entity.value = event.params.amountMileage.div(AmountUnit);
    entity.balanceMileage = event.params.balanceMileage.div(AmountUnit);
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.purchaseId = "";
    entity.franchiseeId = "";
    entity.account = NullAccount;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleChangedBalanceMileage(
        event.params.email,
        event.params.balanceMileage,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    handleChangedBalanceToken(
        event.params.email,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
}
