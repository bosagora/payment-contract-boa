import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AmountUnit, NullAccount, NullBytes32 } from "./utils";
import {
    Deposited as DepositedEvent,
    ProvidedPoint as ProvidedPointEvent,
    ProvidedUnPayablePoint as ProvidedUnPayablePointEvent,
    Refunded as RefundedEvent,
    Withdrawn as WithdrawnEvent,
} from "../generated/Ledger/Ledger";
import { SavedPurchase as SavedPurchaseEvent } from "../generated/LoyaltyProvider/LoyaltyProvider";
import { LoyaltyPaymentEvent as LoyaltyPaymentEventEvent } from "../generated/LoyaltyConsumer/LoyaltyConsumer";
import {
    ChangedPointToToken as ChangedPointToTokenEvent,
    ChangedToPayablePoint as ChangedToPayablePointEvent,
} from "../generated/LoyaltyExchanger/LoyaltyExchanger";
import { TransferredLoyaltyToken as TransferredLoyaltyTokenEvent } from "../generated/LoyaltyTransfer/LoyaltyTransfer";
import {
    BridgeDeposited as BridgeDepositedEvent,
    BridgeWithdrawn as BridgeWithdrawnEvent,
} from "../generated/LoyaltyBridge/LoyaltyBridge";
import {
    BurnedPoint as BurnedPointEvent,
    BurnedUnPayablePoint as BurnedUnPayablePointEvent,
} from "../generated/LoyaltyBurner/LoyaltyBurner";
import {
    BurnedPoint,
    BurnedUnPayablePoint,
    LoyaltyBridgeDeposited,
    LoyaltyBridgeWithdrawn,
    LoyaltyPaymentEvent,
    SavedPurchase,
    UserBalance,
    UserTradeHistory,
    UserUnPayableTradeHistory,
} from "../generated/schema";

enum LoyaltyPaymentStatus {
    INVALID = 0,
    OPENED_PAYMENT = 1,
    CLOSED_PAYMENT = 2,
    FAILED_PAYMENT = 3,
    OPENED_CANCEL = 4,
    CLOSED_CANCEL = 5,
    FAILED_CANCEL = 6,
}

enum UserAction {
    NONE = 0,
    SAVED = 1,
    USED = 2,
    BURNED,
    DEPOSITED = 11,
    WITHDRAWN = 12,
    CHANGED_PAYABLE_POINT = 21,
    CHANGED_TOKEN = 22,
    CHANGED_POINT = 23,
    REFUND = 31,
    TRANSFER_IN = 41,
    TRANSFER_OUT = 42,
    PROVIDER_OUT = 52,
    PROVIDER_FEE_AD_AGENT = 53,
    PROVIDER_FEE_AD_PROTOCOL = 54,
    RECEIVE_FEE_PAYMENT = 61,
    RECEIVE_FEE_PROTOCOL = 62,
    RECEIVE_FEE_AD_AGENT = 63,
    RECEIVE_FEE_AD_PROTOCOL = 64,
}

const TAG_PROVIDE_PURCHASE: u32 = 0;
const TAG_PROVIDE_AD: u32 = 1;
const TAG_PROVIDE_AD_AGENT_FEE: u32 = 10;
const TAG_PROVIDE_AD_PROTOCOL_FEE: u32 = 11;

// region UserBalance
export function handleChangedBalancePoint(
    account: Bytes,
    balance: BigInt,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes
): UserBalance {
    let entity = UserBalance.load(account.toHex());
    if (entity !== null) {
        entity.point = balance.div(AmountUnit);
        entity.blockNumber = blockNumber;
        entity.blockTimestamp = blockTimestamp;
        entity.transactionHash = transactionHash;
        entity.save();
    } else {
        entity = new UserBalance(account.toHex());
        entity.point = balance.div(AmountUnit);
        entity.token = BigInt.fromI32(0);
        entity.blockNumber = blockNumber;
        entity.blockTimestamp = blockTimestamp;
        entity.transactionHash = transactionHash;
        entity.save();
    }
    return entity;
}

export function handleChangedBalanceToken(
    account: Bytes,
    balance: BigInt,
    blockNumber: BigInt,
    blockTimestamp: BigInt,
    transactionHash: Bytes
): UserBalance {
    let entity = UserBalance.load(account.toHex());
    if (entity !== null) {
        entity.token = balance.div(AmountUnit);
        entity.blockNumber = blockNumber;
        entity.blockTimestamp = blockTimestamp;
        entity.transactionHash = transactionHash;
        entity.save();
    } else {
        entity = new UserBalance(account.toHex());
        entity.token = balance.div(AmountUnit);
        entity.point = BigInt.fromI32(0);
        entity.blockNumber = blockNumber;
        entity.blockTimestamp = blockTimestamp;
        entity.transactionHash = transactionHash;
        entity.save();
    }
    return entity;
}

// endregion

// region Ledger

export function handleDeposited(event: DepositedEvent): void {
    handleDepositedForHistory(event);
}

export function handleWithdrawn(event: WithdrawnEvent): void {
    handleWithdrawnForHistory(event);
}

export function handleDepositedForHistory(event: DepositedEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.account,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.DEPOSITED;
    entity.cancel = false;
    entity.amountPoint = BigInt.fromI32(0);
    entity.amountToken = event.params.depositedToken.div(AmountUnit);
    entity.amountValue = event.params.depositedValue.div(AmountUnit);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.balancePoint = balanceEntity.point;
    entity.purchaseId = "";
    entity.paymentId = NullBytes32;
    entity.shopId = NullBytes32;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleWithdrawnForHistory(event: WithdrawnEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.account,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.WITHDRAWN;
    entity.cancel = false;
    entity.amountPoint = BigInt.fromI32(0);
    entity.amountToken = event.params.withdrawnToken.div(AmountUnit);
    entity.amountValue = event.params.withdrawnValue.div(AmountUnit);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.balancePoint = balanceEntity.point;
    entity.purchaseId = "";
    entity.paymentId = NullBytes32;
    entity.shopId = NullBytes32;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

// endregion

// region LoyaltyExchanger

export function handleChangedToPayablePoint(event: ChangedToPayablePointEvent): void {
    handleChangedPointForHistory(event);
    handleChangedPointForUnPayablePointForHistory(event);
}

export function handleChangedPointForUnPayablePointForHistory(event: ChangedToPayablePointEvent): void {
    let entity = new UserUnPayableTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.phone = event.params.phone;
    entity.action = UserAction.CHANGED_PAYABLE_POINT;
    entity.amount = event.params.changedPoint.div(AmountUnit);
    entity.balance = BigInt.fromI32(0);

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleChangedPointForHistory(event: ChangedToPayablePointEvent): void {
    const balanceEntity = handleChangedBalancePoint(
        event.params.account,
        event.params.balancePoint,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.CHANGED_PAYABLE_POINT;
    entity.cancel = false;
    entity.amountPoint = event.params.changedPoint.div(AmountUnit);
    entity.amountToken = BigInt.fromI32(0);
    entity.amountValue = event.params.changedValue.div(AmountUnit);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.balancePoint = event.params.balancePoint.div(AmountUnit);
    entity.balanceToken = balanceEntity.token;
    entity.purchaseId = "";
    entity.paymentId = NullBytes32;
    entity.shopId = NullBytes32;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleChangedPointToToken(event: ChangedPointToTokenEvent): void {
    handleChangedPointToTokenForHistory(event);
}

export function handleChangedPointToTokenForHistory(event: ChangedPointToTokenEvent): void {
    handleChangedBalancePoint(
        event.params.account,
        event.params.balancePoint,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );

    handleChangedBalanceToken(
        event.params.account,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );

    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.CHANGED_TOKEN;
    entity.cancel = false;
    entity.amountPoint = event.params.amountPoint.div(AmountUnit);
    entity.amountToken = event.params.amountToken.div(AmountUnit);
    entity.amountValue = event.params.amountPoint.div(AmountUnit);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.balancePoint = event.params.balancePoint.div(AmountUnit);
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.purchaseId = "";
    entity.paymentId = NullBytes32;
    entity.shopId = NullBytes32;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

// endregion

// region LoyaltyProvider

export function handleSavedPurchase(event: SavedPurchaseEvent): void {
    let entity = new SavedPurchase(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.purchaseId = event.params.purchaseId;
    entity.amount = event.params.amount.div(AmountUnit);
    entity.loyalty = event.params.loyalty.div(AmountUnit);
    entity.currency = event.params.currency;
    entity.shopId = event.params.shopId;
    entity.account = event.params.account;
    entity.phone = event.params.phone;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
}

export function handleProvidedUnPayablePoint(event: ProvidedUnPayablePointEvent): void {
    handleProvidedForUnPayablePointForHistory(event);
}

export function handleProvidedPoint(event: ProvidedPointEvent): void {
    handleProvidedPointForHistory(event);
}

export function handleRefunded(event: RefundedEvent): void {
    handleRefundedForHistory(event);
}

export function handleProvidedForUnPayablePointForHistory(event: ProvidedUnPayablePointEvent): void {
    let entity = new UserUnPayableTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.phone = event.params.phone;
    entity.action = UserAction.SAVED;
    entity.amount = event.params.providedPoint.div(AmountUnit);
    entity.balance = event.params.balancePoint.div(AmountUnit);
    entity.purchaseId = event.params.purchaseId;
    entity.shopId = event.params.shopId;
    entity.provider = event.params.provider;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();

    const tag = event.params.tag.toU32();
    if (tag == TAG_PROVIDE_AD || tag == TAG_PROVIDE_AD_AGENT_FEE || tag == TAG_PROVIDE_AD_PROTOCOL_FEE) {
        const balanceEntity2 = handleChangedBalanceToken(
            event.params.provider,
            event.params.providerBalanceToken,
            event.block.number,
            event.block.timestamp,
            event.transaction.hash
        );
        let entity2 = new UserTradeHistory(
            event.transaction.hash.concatI32(event.logIndex.plus(BigInt.fromI32(64)).toI32())
        );
        entity2.account = event.params.provider;
        switch (tag) {
            case TAG_PROVIDE_AD:
                entity2.action = UserAction.PROVIDER_OUT;
                break;

            case TAG_PROVIDE_AD_AGENT_FEE:
                entity2.action = UserAction.PROVIDER_FEE_AD_AGENT;
                break;

            case TAG_PROVIDE_AD_PROTOCOL_FEE:
                entity2.action = UserAction.PROVIDER_FEE_AD_PROTOCOL;
                break;
        }
        entity2.cancel = false;
        entity2.amountPoint = BigInt.fromI32(0);
        entity2.amountToken = event.params.consumedToken.div(AmountUnit);
        entity2.amountValue = event.params.providedValue.div(AmountUnit);
        entity2.feePoint = balanceEntity2.point;
        entity2.feeToken = event.params.providerBalanceToken.div(AmountUnit);
        entity2.feeValue = BigInt.fromI32(0);
        entity2.currency = event.params.currency;
        entity2.balancePoint = BigInt.fromI32(0);
        entity2.balanceToken = BigInt.fromI32(0);
        entity2.purchaseId = "";
        entity2.paymentId = event.params.phone;
        entity2.shopId = NullBytes32;
        entity2.provider = NullAccount;

        entity2.blockNumber = event.block.number;
        entity2.blockTimestamp = event.block.timestamp;
        entity2.transactionHash = event.transaction.hash;
        entity2.save();
    }
}

export function handleProvidedPointForHistory(event: ProvidedPointEvent): void {
    const balanceEntity = handleChangedBalancePoint(
        event.params.account,
        event.params.balancePoint,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.SAVED;
    entity.cancel = false;
    entity.amountPoint = event.params.providedPoint.div(AmountUnit);
    entity.amountToken = BigInt.fromI32(0);
    entity.amountValue = event.params.providedValue.div(AmountUnit);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.currency = event.params.currency;
    entity.balancePoint = event.params.balancePoint.div(AmountUnit);
    entity.balanceToken = balanceEntity.token;
    entity.purchaseId = event.params.purchaseId;
    entity.paymentId = NullBytes32;
    entity.shopId = event.params.shopId;
    entity.provider = event.params.provider;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();

    const tag = event.params.tag.toU32();
    if (tag == TAG_PROVIDE_AD || tag == TAG_PROVIDE_AD_AGENT_FEE || tag == TAG_PROVIDE_AD_PROTOCOL_FEE) {
        const balanceEntity2 = handleChangedBalanceToken(
            event.params.provider,
            event.params.providerBalanceToken,
            event.block.number,
            event.block.timestamp,
            event.transaction.hash
        );
        let entity2 = new UserTradeHistory(
            event.transaction.hash.concatI32(event.logIndex.plus(BigInt.fromI32(64)).toI32())
        );
        entity2.account = event.params.provider;
        switch (tag) {
            case TAG_PROVIDE_AD:
                entity2.action = UserAction.PROVIDER_OUT;
                break;

            case TAG_PROVIDE_AD_AGENT_FEE:
                entity2.action = UserAction.PROVIDER_FEE_AD_AGENT;
                break;

            case TAG_PROVIDE_AD_PROTOCOL_FEE:
                entity2.action = UserAction.PROVIDER_FEE_AD_PROTOCOL;
                break;
        }

        entity2.cancel = false;
        entity2.amountPoint = BigInt.fromI32(0);
        entity2.amountToken = event.params.consumedToken.div(AmountUnit);
        entity2.amountValue = event.params.providedValue.div(AmountUnit);
        entity2.feePoint = BigInt.fromI32(0);
        entity2.feeToken = BigInt.fromI32(0);
        entity2.feeValue = BigInt.fromI32(0);
        entity2.currency = event.params.currency;
        entity2.balancePoint = balanceEntity2.point;
        entity2.balanceToken = event.params.providerBalanceToken.div(AmountUnit);
        entity2.purchaseId = "";
        entity2.paymentId = event.params.account;
        entity2.shopId = NullBytes32;
        entity2.provider = NullAccount;

        entity2.blockNumber = event.block.number;
        entity2.blockTimestamp = event.block.timestamp;
        entity2.transactionHash = event.transaction.hash;
        entity2.save();
    }
}

export function handleRefundedForHistory(event: RefundedEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.account,
        event.params.balanceToken,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.REFUND;
    entity.cancel = false;
    entity.amountPoint = BigInt.fromI32(0);
    entity.amountToken = event.params.amountToken.div(AmountUnit);
    entity.amountValue = event.params.amountValue.div(AmountUnit);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.currency = event.params.currency;
    entity.balanceToken = event.params.balanceToken.div(AmountUnit);
    entity.balancePoint = balanceEntity.point;
    entity.purchaseId = "";
    entity.paymentId = NullBytes32;
    entity.shopId = event.params.shopId;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

// endregion

// region LoyaltyTransfer
export function handleTransferredLoyaltyToken(event: TransferredLoyaltyTokenEvent): void {
    handleTransferredLoyaltyTokenForHistory(event);
}

export function handleTransferredLoyaltyTokenForHistory(event: TransferredLoyaltyTokenEvent): void {
    {
        const balanceEntity = handleChangedBalanceToken(
            event.params.from,
            event.params.balanceOfFrom,
            event.block.number,
            event.block.timestamp,
            event.transaction.hash
        );

        let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
        entity.account = event.params.from;
        entity.action = UserAction.TRANSFER_OUT;
        entity.cancel = false;
        entity.amountPoint = BigInt.fromI32(0);
        entity.amountToken = event.params.amount.div(AmountUnit);
        entity.amountValue = BigInt.fromI32(0);
        entity.feePoint = BigInt.fromI32(0);
        entity.feeToken = event.params.fee.div(AmountUnit);
        entity.feeValue = BigInt.fromI32(0);
        entity.currency = "TOKEN";
        entity.balanceToken = balanceEntity.token;
        entity.balancePoint = balanceEntity.point;
        entity.purchaseId = "";
        entity.paymentId = NullBytes32;
        entity.shopId = NullBytes32;
        entity.provider = NullBytes32;

        entity.blockNumber = event.block.number;
        entity.blockTimestamp = event.block.timestamp;
        entity.transactionHash = event.transaction.hash;
        entity.save();
    }

    {
        const balanceEntity = handleChangedBalanceToken(
            event.params.to,
            event.params.balanceOfTo,
            event.block.number,
            event.block.timestamp,
            event.transaction.hash
        );

        let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32() + 1));
        entity.account = event.params.to;
        entity.action = UserAction.TRANSFER_IN;
        entity.cancel = false;
        entity.amountPoint = BigInt.fromI32(0);
        entity.amountToken = event.params.amount.div(AmountUnit);
        entity.amountValue = BigInt.fromI32(0);
        entity.feePoint = BigInt.fromI32(0);
        entity.feeToken = BigInt.fromI32(0);
        entity.feeValue = BigInt.fromI32(0);
        entity.currency = "TOKEN";
        entity.balanceToken = balanceEntity.token;
        entity.balancePoint = balanceEntity.point;
        entity.purchaseId = "";
        entity.paymentId = NullBytes32;
        entity.shopId = NullBytes32;
        entity.provider = NullBytes32;

        entity.blockNumber = event.block.number;
        entity.blockTimestamp = event.block.timestamp;
        entity.transactionHash = event.transaction.hash;
        entity.save();
    }
}

// endregion

// region LoyaltyConsumer
export function handleLoyaltyPaymentEvent(event: LoyaltyPaymentEventEvent): void {
    let entity = new LoyaltyPaymentEvent(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.paymentId = event.params.payment.paymentId;
    entity.purchaseId = event.params.payment.purchaseId;
    entity.currency = event.params.payment.currency;
    entity.shopId = event.params.payment.shopId;
    entity.account = event.params.payment.account;
    entity.timestamp = event.params.payment.timestamp;
    entity.paidPoint = event.params.payment.paidPoint;
    entity.paidToken = event.params.payment.paidToken;
    entity.paidValue = event.params.payment.paidValue;
    entity.feePoint = event.params.payment.feePoint;
    entity.feeToken = event.params.payment.feeToken;
    entity.feeValue = event.params.payment.feeValue;
    entity.status = event.params.payment.status;
    entity.balance = event.params.balance;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleLoyaltyPaymentEventForHistory(event);
}

export function handleLoyaltyPaymentEventForHistory(event: LoyaltyPaymentEventEvent): void {
    if (event.params.payment.status == LoyaltyPaymentStatus.CLOSED_PAYMENT) {
        handlePaidPointForHistory(event);
    } else if (event.params.payment.status == LoyaltyPaymentStatus.CLOSED_CANCEL) {
        handleCanceledPointForHistory(event);
    }
}

export function handlePaidPointForHistory(event: LoyaltyPaymentEventEvent): void {
    const balanceEntity = handleChangedBalancePoint(
        event.params.payment.account,
        event.params.balance,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.payment.account;
    entity.action = UserAction.USED;
    entity.cancel = false;
    entity.amountPoint = event.params.payment.paidPoint.plus(event.params.payment.feePoint).div(AmountUnit);
    entity.amountToken = BigInt.fromI32(0);
    entity.amountValue = event.params.payment.paidValue.plus(event.params.payment.feeValue).div(AmountUnit);
    entity.feePoint = event.params.payment.feePoint.div(AmountUnit);
    entity.feeToken = event.params.payment.feeToken.div(AmountUnit);
    entity.feeValue = event.params.payment.feeValue.div(AmountUnit);
    entity.currency = event.params.payment.currency;
    entity.balancePoint = balanceEntity.point;
    entity.balanceToken = balanceEntity.token;
    entity.purchaseId = event.params.payment.purchaseId;
    entity.paymentId = event.params.payment.paymentId;
    entity.shopId = event.params.payment.shopId;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleCanceledPointForHistory(event: LoyaltyPaymentEventEvent): void {
    const balanceEntity = handleChangedBalancePoint(
        event.params.payment.account,
        event.params.balance,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );
    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.payment.account;
    entity.action = UserAction.USED;
    entity.cancel = true;
    entity.amountPoint = event.params.payment.paidPoint.plus(event.params.payment.feePoint).div(AmountUnit);
    entity.amountToken = BigInt.fromI32(0);
    entity.amountValue = event.params.payment.paidValue.plus(event.params.payment.feeValue).div(AmountUnit);
    entity.feePoint = event.params.payment.feePoint.div(AmountUnit);
    entity.feeToken = event.params.payment.feeToken.div(AmountUnit);
    entity.feeValue = event.params.payment.feeValue.div(AmountUnit);
    entity.currency = event.params.payment.currency;
    entity.balancePoint = balanceEntity.point;
    entity.balanceToken = balanceEntity.token;
    entity.purchaseId = event.params.payment.purchaseId;
    entity.paymentId = event.params.payment.paymentId;
    entity.shopId = event.params.payment.shopId;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

// endregion

// region LoyaltyBurner
export function handleBurnedPoint(event: BurnedPointEvent): void {
    let entity = new BurnedPoint(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.amount = event.params.amount;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleBurnedPointForHistory(event);
}

export function handleBurnedPointForHistory(event: BurnedPointEvent): void {
    const balanceEntity = handleChangedBalancePoint(
        event.params.account,
        event.params.balance,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );

    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.BURNED;
    entity.cancel = false;
    entity.amountPoint = BigInt.fromI32(0);
    entity.amountToken = event.params.amount.div(AmountUnit);
    entity.amountValue = BigInt.fromI32(0);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.balanceToken = balanceEntity.token;
    entity.balancePoint = balanceEntity.point;
    entity.purchaseId = "";
    entity.paymentId = NullBytes32;
    entity.shopId = NullBytes32;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleBurnedUnPayablePoint(event: BurnedUnPayablePointEvent): void {
    let entity = new BurnedUnPayablePoint(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.phone = event.params.phone;
    entity.amount = event.params.amount;
    entity.balance = event.params.balance;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();
}

export function handleBurnedUnPayablePointForHistory(event: BurnedUnPayablePointEvent): void {
    let entity = new UserUnPayableTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.phone = event.params.phone;
    entity.action = UserAction.BURNED;
    entity.amount = event.params.amount.div(AmountUnit);
    entity.balance = event.params.balance.div(AmountUnit);
    entity.purchaseId = "";
    entity.shopId = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

// endregion

// region LoyaltyBridge

export function handleBridgeDeposited(event: BridgeDepositedEvent): void {
    let entity = new LoyaltyBridgeDeposited(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.tokenId = event.params.tokenId;
    entity.depositId = event.params.depositId;
    entity.account = event.params.account;
    entity.amount = event.params.amount.div(AmountUnit);
    entity.balance = event.params.balance.div(AmountUnit);

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleBridgeDepositedForHistory(event);
}

export function handleBridgeDepositedForHistory(event: BridgeDepositedEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.account,
        event.params.balance,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );

    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.WITHDRAWN;
    entity.cancel = false;
    entity.amountPoint = BigInt.fromI32(0);
    entity.amountToken = event.params.amount.div(AmountUnit);
    entity.amountValue = BigInt.fromI32(0);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.balanceToken = balanceEntity.token;
    entity.balancePoint = balanceEntity.point;
    entity.purchaseId = "";
    entity.paymentId = NullBytes32;
    entity.shopId = NullBytes32;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

export function handleBridgeWithdrawn(event: BridgeWithdrawnEvent): void {
    let entity = new LoyaltyBridgeWithdrawn(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.tokenId = event.params.tokenId;
    entity.withdrawId = event.params.withdrawId;
    entity.account = event.params.account;
    entity.amount = event.params.amount.div(AmountUnit);
    entity.balance = event.params.balance.div(AmountUnit);

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    handleBridgeWithdrawnForHistory(event);
}

export function handleBridgeWithdrawnForHistory(event: BridgeWithdrawnEvent): void {
    const balanceEntity = handleChangedBalanceToken(
        event.params.account,
        event.params.balance,
        event.block.number,
        event.block.timestamp,
        event.transaction.hash
    );

    let entity = new UserTradeHistory(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.account = event.params.account;
    entity.action = UserAction.DEPOSITED;
    entity.cancel = false;
    entity.amountPoint = BigInt.fromI32(0);
    entity.amountToken = event.params.amount.div(AmountUnit);
    entity.amountValue = BigInt.fromI32(0);
    entity.feePoint = BigInt.fromI32(0);
    entity.feeToken = BigInt.fromI32(0);
    entity.feeValue = BigInt.fromI32(0);
    entity.balanceToken = balanceEntity.token;
    entity.balancePoint = balanceEntity.point;
    entity.purchaseId = "";
    entity.paymentId = NullBytes32;
    entity.shopId = NullBytes32;
    entity.provider = NullBytes32;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
}

// endregion
