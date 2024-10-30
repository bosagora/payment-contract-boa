// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "loyalty-tokens/contracts/BIP20/IBIP20DelegatedTransfer.sol";
import "../interfaces/IPhoneLinkCollection.sol";

import "../interfaces/ICurrencyRate.sol";
import "../interfaces/ILedger.sol";

contract LedgerStorage {
    /// @notice Hash value of a blank string
    uint32 public constant MAX_PAYMENT_FEE = 500;

    mapping(bytes32 => uint256) internal unPayablePointBalances;
    mapping(address => uint256) internal pointBalances;
    mapping(address => uint256) internal tokenBalances;
    mapping(address => uint256) internal nonce;
    mapping(address => uint256) internal liquidity;

    mapping(address => bool) internal providers;
    mapping(address => address) internal provisionAgents;
    mapping(address => address) internal refundAgents;
    mapping(address => address) internal withdrawalAgents;

    address public systemAccount;
    address public paymentFeeAccount;
    address public protocolFeeAccount;
    address public providerAddress;
    address public consumerAddress;
    address public exchangerAddress;
    address public burnerAddress;
    address public transferAddress;
    address public bridgeAddress;
    address public tokenAddress;
    address public shopAddress;

    uint32 internal paymentFee;
    address internal temporaryAddress;

    IPhoneLinkCollection internal linkContract;
    IBIP20DelegatedTransfer internal tokenContract;
    ICurrencyRate internal currencyRateContract;
    bytes32 internal tokenId;
}
