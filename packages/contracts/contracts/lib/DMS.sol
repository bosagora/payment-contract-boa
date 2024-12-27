// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

library DMS {
    uint256 public constant QUORUM = (uint256(2000) / uint256(3));

    uint256 public constant TOKEN_MAX_PROTOCOL_FEE = 5e18;
    uint256 public constant TOKEN_DEFAULT_PROTOCOL_FEE = 1e17;

    string public constant DEFAULT_CURRENCY_SYMBOL = "php";

    uint256 public constant TAG_PROVIDE_PURCHASE = 0;
    uint256 public constant TAG_PROVIDE_AD = 1;
    uint256 public constant TAG_PROVIDE_AD_FEE = 10;
    uint256 public constant TAG_PROVIDE_AD_PROTOCOL_FEE = 11;

    /// @notice Hash value of a blank string
    bytes32 public constant NULL = 0x32105b1d0b88ada155176b58ee08b45c31e4f2f7337475831982c313533b880c;

    function zeroGWEI(uint256 value) internal pure returns (uint256) {
        return (value / 1 gwei) * 1 gwei;
    }
}
