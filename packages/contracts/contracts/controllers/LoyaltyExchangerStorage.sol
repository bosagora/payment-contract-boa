// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "../interfaces/IPhoneLinkCollection.sol";
import "../interfaces/ICurrencyRate.sol";
import "../interfaces/ILedger.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - systemAccount: address at slot 0
 * - linkContract: IPhoneLinkCollection at slot 1
 * - currencyRateContract: ICurrencyRate at slot 2
 * - ledgerContract: ILedger at slot 3
 * - isSetLedger: bool at slot 4
 * - __gap: uint256[50] starting at slot 5
 */
contract LoyaltyExchangerStorage {
    address internal systemAccount;

    IPhoneLinkCollection internal linkContract;
    ICurrencyRate internal currencyRateContract;
    ILedger internal ledgerContract;

    bool internal isSetLedger;

    uint256[50] private __gap;
}
