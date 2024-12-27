// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "../interfaces/IPhoneLinkCollection.sol";
import "../interfaces/ICurrencyRate.sol";
import "../interfaces/IValidator.sol";
import "../interfaces/IShop.sol";
import "../interfaces/ILedger.sol";

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - purchases: mapping(string => bool) at slot 0
 * - validatorContract: IValidator at slot 1
 * - linkContract: IPhoneLinkCollection at slot 2
 * - currencyRateContract: ICurrencyRate at slot 3
 * - shopContract: IShop at slot 4
 * - ledgerContract: ILedger at slot 5
 * - systemAccount: address at slot 6
 * - isSetLedger: bool at slot 7
 * - isSetShop: bool at slot 8
 * - adActionAgentFee: uint32 at slot 9
 * - adActionProtocolFee: uint32 at slot 10
 * - adActionProtocolFeeAccount: address at slot 11
 * - __gap: uint256[50] starting at slot 12
 */
contract LoyaltyProviderStorage {
    uint32 public constant DEFAULT_AD_ACTION_AGENT_FEE = 200;
    uint32 public constant MAX_AD_ACTION_AGENT_FEE = 500;
    uint32 public constant DEFAULT_AD_ACTION_PROTOCOL_FEE = 300;
    uint32 public constant MAX_AD_ACTION_PROTOCOL_FEE = 500;

    mapping(string => bool) internal purchases;

    IValidator internal validatorContract;
    IPhoneLinkCollection internal linkContract;
    ICurrencyRate internal currencyRateContract;
    IShop internal shopContract;
    ILedger internal ledgerContract;
    address internal systemAccount;

    bool internal isSetLedger;
    bool internal isSetShop;

    uint32 internal adActionAgentFee;
    uint32 internal adActionProtocolFee;
    address internal adActionProtocolFeeAccount;

    uint256[50] private __gap;
}
