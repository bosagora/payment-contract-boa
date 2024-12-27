// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interfaces/IValidator.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - MINIMUM_DEPOSIT_AMOUNT: uint256 at slot 0
 * - token: IERC20 at slot 1
 * - items: address[] at slot 2
 * - activeItems: address[] at slot 3
 * - validators: mapping(address => ValidatorData) at slot 4
 * - __gap: uint256[50] starting at slot 5
 */
contract ValidatorStorage {
    uint256 public constant MINIMUM_DEPOSIT_AMOUNT = 100000 ether;
    IERC20 internal token;
    address[] internal items;
    address[] internal activeItems;
    mapping(address => IValidator.ValidatorData) internal validators;

    uint256[50] private __gap;
}
