// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "../interfaces/ILedger.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - systemAccount: address at slot 0
 * - protocolFee: uint256 at slot 1
 * - ledgerContract: ILedger at slot 2
 * - isSetLedger: bool at slot 3
 * - __gap: uint256[50] starting at slot 4
 */
contract LoyaltyTransferStorage {
    address internal systemAccount;
    uint256 internal protocolFee;

    ILedger internal ledgerContract;

    bool internal isSetLedger;

    uint256[50] private __gap;
}
