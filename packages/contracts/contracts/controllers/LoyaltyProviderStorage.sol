// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "../interfaces/IPhoneLinkCollection.sol";

import "../interfaces/ICurrencyRate.sol";
import "../interfaces/IValidator.sol";
import "../interfaces/IShop.sol";
import "../interfaces/ILedger.sol";

contract LoyaltyProviderStorage {
    uint32 public constant DEFAULT_AD_ACTION_AGENT_FEE = 200;
    uint32 public constant MAX_AD_ACTION_AGENT_FEE = 500;
    uint32 public constant DEFAULT_AD_ACTION_PROTOCOL_FEE = 300;
    uint32 public constant MAX_AD_ACTION_PROTOCOL_FEE = 500;
    IValidator internal validatorContract;
    IPhoneLinkCollection internal linkContract;
    ICurrencyRate internal currencyRateContract;
    IShop internal shopContract;
    ILedger internal ledgerContract;
    address internal systemAccount;

    mapping(string => bool) internal purchases;

    bool internal isSetLedger;
    bool internal isSetShop;

    uint32 internal adActionAgentFee;
    uint32 internal adActionProtocolFee;
    address internal adActionProtocolFeeAccount;
}
