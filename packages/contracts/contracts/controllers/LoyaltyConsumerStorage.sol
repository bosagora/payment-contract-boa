// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "../interfaces/ICurrencyRate.sol";
import "../interfaces/IShop.sol";
import "../interfaces/ILedger.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - loyaltyPayments: mapping(bytes32 => LoyaltyPaymentData) at slot 0
 * - systemAccount: address at slot 1
 * - temporaryAddress: address at slot 2
 * - currencyRateContract: ICurrencyRate at slot 3
 * - shopContract: IShop at slot 4
 * - ledgerContract: ILedger at slot 5
 * - isSetLedger: bool at slot 6
 * - isSetShop: bool at slot 7
 * - __gap: uint256[50] starting at slot 8
 */
contract LoyaltyConsumerStorage {
    enum LoyaltyPaymentStatus {
        INVALID,
        OPENED_PAYMENT,
        CLOSED_PAYMENT,
        FAILED_PAYMENT,
        OPENED_CANCEL,
        CLOSED_CANCEL,
        FAILED_CANCEL
    }

    struct LoyaltyPaymentData {
        bytes32 paymentId;
        string purchaseId;
        string currency;
        bytes32 shopId;
        address account;
        bytes32 secretLock;
        uint256 timestamp;
        uint256 paidPoint;
        uint256 paidToken;
        uint256 paidValue;
        uint256 feePoint;
        uint256 feeToken;
        uint256 feeValue;
        uint256 usedValueShop;
        LoyaltyPaymentStatus status;
    }

    mapping(bytes32 => LoyaltyPaymentData) internal loyaltyPayments;
    address internal systemAccount;
    address internal temporaryAddress;

    ICurrencyRate internal currencyRateContract;
    IShop internal shopContract;
    ILedger internal ledgerContract;

    bool internal isSetLedger;
    bool internal isSetShop;

    uint256[50] private __gap;
}
