// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "../interfaces/IValidator.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - NULL_CURRENCY: bytes32 at slot 0
 * - MULTIPLE: uint256 at slot 1
 * - rates: mapping(string => uint256) at slot 2
 * - prevHeight: uint256 at slot 3
 * - validator: IValidator at slot 4
 * - tokenSymbol: string at slot 5
 * - __gap: uint256[50] starting at slot 6
 */
contract CurrencyStorage {
    bytes32 public constant NULL_CURRENCY = keccak256(abi.encodePacked(""));
    uint256 public constant MULTIPLE = 1000000000;
    mapping(string => uint256) internal rates;

    uint256 internal prevHeight;

    IValidator internal validator;
    string internal tokenSymbol;

    uint256[50] private __gap;
}
