// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "loyalty-tokens/contracts/BIP20/BIP20DelegatedTransfer.sol";

import "kios-bridge-contracts-v2/contracts/interfaces/IBridge.sol";
import "kios-bridge-contracts-v2/contracts/interfaces/IBridgeValidator.sol";

import "../interfaces/ILedger.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - deposits: mapping(bytes32 => DepositData) at slot 0
 * - withdraws: mapping(bytes32 => WithdrawData) at slot 1
 * - confirmations: mapping(bytes32 => mapping(address => bool)) at slot 2
 * - systemAccount: address at slot 3
 * - protocolFee: uint256 at slot 4
 * - isSetLedger: bool at slot 5
 * - ledgerContract: ILedger at slot 6
 * - validatorContract: IBridgeValidator at slot 7
 * - tokenContract: BIP20DelegatedTransfer at slot 8
 * - tokenId: bytes32 at slot 9
 * - __gap: uint256[50] starting at slot 10
 */
contract LoyaltyBridgeStorage {
    mapping(bytes32 => IBridge.DepositData) internal deposits;
    mapping(bytes32 => IBridge.WithdrawData) internal withdraws;
    mapping(bytes32 => mapping(address => bool)) internal confirmations;

    address internal systemAccount;

    uint256 internal protocolFee;

    bool internal isSetLedger;
    ILedger internal ledgerContract;
    IBridgeValidator internal validatorContract;
    BIP20DelegatedTransfer internal tokenContract;
    bytes32 internal tokenId;

    uint256[50] private __gap;
}
