// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

/**
 * @dev 스토리지 레이아웃
 *
 * [스토리지 슬롯 레이아웃]
 * - NULL: bytes32 at slot 0
 * - phoneToAddress: mapping(bytes32 => address) at slot 1
 * - addressToPhone: mapping(address => bytes32) at slot 2
 * - nonce: mapping(address => uint256) at slot 3
 * - requests: mapping(bytes32 => RequestItem) at slot 4
 * - requestIds: bytes32[] at slot 5
 * - quorum: uint256 at slot 6
 * - validators: mapping(address => ValidatorItem) at slot 7
 * - validatorAddresses: address[] at slot 8
 * - __gap: uint256[50] starting at slot 9
 */
contract PhoneStorage {
    /// @notice 요청 아이템의 상태코드
    enum RequestStatus {
        INVALID,
        REQUESTED,
        ACCEPTED,
        REJECTED
    }

    struct RequestItem {
        bytes32 id;
        bytes32 phone;
        address wallet;
        bytes signature;
        uint32 agreement;
        mapping(address => bool) voters;
        RequestStatus status;
    }

    /// @notice 검증자의 상태코드
    enum ValidatorStatus {
        INVALID, //  초기값
        ACTIVE //  검증자의 기능이 활성화됨
    }

    struct ValidatorItem {
        address validator; // 검증자의 지갑주소
        uint256 index;
        string endpoint;
        ValidatorStatus status; // 검증자의 상태
    }

    bytes32 public constant NULL = 0x32105b1d0b88ada155176b58ee08b45c31e4f2f7337475831982c313533b880c;
    mapping(bytes32 => address) internal phoneToAddress;
    mapping(address => bytes32) internal addressToPhone;
    mapping(address => uint256) internal nonce;
    mapping(bytes32 => RequestItem) internal requests;
    bytes32[] internal requestIds;
    uint256 internal quorum;
    mapping(address => ValidatorItem) internal validators;
    address[] internal validatorAddresses;

    uint256[50] private __gap;
}
