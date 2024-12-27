// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "../interfaces/IPhoneLinkCollection.sol";

import "../interfaces/IValidator.sol";
import "../interfaces/ILedger.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - validatorContract: IValidator at slot 0
 * - linkContract: IPhoneLinkCollection at slot 1
 * - ledgerContract: ILedger at slot 2
 * - isSetLedger: bool at slot 3
 * - __gap: uint256[50] starting at slot 4
 */
contract LoyaltyBurnerStorage {
    IValidator internal validatorContract;
    IPhoneLinkCollection internal linkContract;
    ILedger internal ledgerContract;

    bool internal isSetLedger;

    uint256[50] private __gap;
}
