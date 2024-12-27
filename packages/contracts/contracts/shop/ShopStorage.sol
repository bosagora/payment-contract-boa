// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "../interfaces/ICurrencyRate.sol";
import "../interfaces/IShop.sol";
import "../interfaces/ILedger.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - shops: mapping(bytes32 => ShopData) at slot 0
 * - shopIdByAddress: mapping(address => bytes32[]) at slot 1
 * - settlements: mapping(bytes32 => ShopSettlementData) at slot 2
 * - items: bytes32[] at slot 3
 * - providerAddress: address at slot 4
 * - consumerAddress: address at slot 5
 * - nonce: mapping(address => uint256) at slot 6
 * - currencyRate: ICurrencyRate at slot 7
 * - ledgerContract: ILedger at slot 8
 * - isSetLedger: bool at slot 9
 * - __gap: uint256[50] starting at slot 10
 */
contract ShopStorage {
    mapping(bytes32 => IShop.ShopData) internal shops;
    mapping(address => bytes32[]) internal shopIdByAddress;
    mapping(bytes32 => IShop.ShopSettlementData) internal settlements;

    bytes32[] internal items;

    address public providerAddress;
    address public consumerAddress;
    mapping(address => uint256) internal nonce;

    ICurrencyRate internal currencyRate;
    ILedger internal ledgerContract;

    bool internal isSetLedger;

    uint256[50] private __gap;
}
