// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "loyalty-tokens/contracts/BIP20/BIP20DelegatedTransfer.sol";

import "kios-bridge-contracts-v2/contracts/interfaces/IBridge.sol";
import "kios-bridge-contracts-v2/contracts/interfaces/IBridgeValidator.sol";
import "kios-bridge-contracts-v2/contracts/lib/BridgeLib.sol";

import "../lib/DMS.sol";

import "../interfaces/ILedger.sol";
import "./LoyaltyBridgeStorage.sol";

contract LoyaltyBridge is LoyaltyBridgeStorage, Initializable, OwnableUpgradeable, UUPSUpgradeable, IBridge {
    function initialize(address _validatorAddress) external initializer {
        __UUPSUpgradeable_init();
        __Ownable_init_unchained();

        protocolFee = DMS.TOKEN_DEFAULT_PROTOCOL_FEE;
        validatorContract = IBridgeValidator(_validatorAddress);

        isSetLedger = false;
    }

    /// @notice 원장 컨트랙트를 등록한다.
    function setLedger(address _contractAddress) public {
        require(_msgSender() == owner(), "1050");
        if (!isSetLedger) {
            ledgerContract = ILedger(_contractAddress);
            systemAccount = ledgerContract.getSystemAccount();
            tokenContract = BIP20DelegatedTransfer(ledgerContract.getTokenAddress());
            tokenId = BridgeLib.getTokenId(tokenContract.name(), tokenContract.symbol());
            isSetLedger = true;
        }
    }

    function _authorizeUpgrade(address newImplementation) internal virtual override {
        require(_msgSender() == owner(), "Unauthorized access");
    }

    modifier onlyValidator(address _account) {
        require(validatorContract.isValidator(_account), "1000");
        _;
    }

    modifier notExistDeposit(bytes32 _depositId) {
        require(deposits[_depositId].account == address(0x0), "1711");
        _;
    }

    modifier existWithdraw(bytes32 _withdrawId) {
        require(withdraws[_withdrawId].account != address(0x0), "1712");
        _;
    }

    modifier notConfirmed(bytes32 _withdrawId, address _validator) {
        require(!confirmations[_withdrawId][_validator], "1715");
        _;
    }

    function isAvailableDepositId(bytes32 _depositId) external view override returns (bool) {
        if (deposits[_depositId].account == address(0x0)) return true;
        else return false;
    }

    function isAvailableWithdrawId(bytes32 _withdrawId) external view override returns (bool) {
        if (withdraws[_withdrawId].account == address(0x0)) return true;
        else return false;
    }

    /// @notice 브리지에 자금을 에치합니다.
    function depositToBridge(
        bytes32 _tokenId,
        bytes32 _depositId,
        address _account,
        uint256 _amount,
        uint256 _expiry,
        bytes calldata _signature
    ) external payable override notExistDeposit(_depositId) {
        require(_tokenId == tokenId, "1713");
        require(_account != systemAccount, "1053");

        address account = _account;
        uint256 amount = _amount;
        uint256 expiry = _expiry;
        address signer;
        address recurve1 = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(
                keccak256(
                    abi.encode(
                        block.chainid,
                        address(tokenContract),
                        account,
                        address(this),
                        amount,
                        ledgerContract.nonceOf(account),
                        expiry
                    )
                )
            ),
            _signature
        );

        if (recurve1 == account) {
            signer = account;
        } else {
            address agent = ledgerContract.withdrawalAgentOf(account);
            require(agent != address(0x0), "1501");

            address recurve2 = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(
                    keccak256(
                        abi.encode(
                            block.chainid,
                            address(tokenContract),
                            account,
                            address(this),
                            amount,
                            ledgerContract.nonceOf(agent),
                            expiry
                        )
                    )
                ),
                _signature
            );
            require(recurve2 == agent, "1501");
            signer = agent;
        }

        require(expiry > block.timestamp, "1506");
        require(ledgerContract.tokenBalanceOf(account) >= amount, "1511");
        require(amount % 1 gwei == 0, "1030");
        require(amount > protocolFee, "1031");

        ledgerContract.transferToken(account, address(this), amount);
        ledgerContract.increaseNonce(account);

        DepositData memory data = DepositData({ tokenId: _tokenId, account: account, amount: amount });
        deposits[_depositId] = data;
        emit BridgeDeposited(_tokenId, _depositId, account, amount, ledgerContract.tokenBalanceOf(account));
    }

    /// @notice 브리지에서 자금을 인출합니다. 검증자들의 합의가 완료되면 인출이 됩니다.
    function withdrawFromBridge(
        bytes32 _tokenId,
        bytes32 _withdrawId,
        address _account,
        uint256 _amount
    ) external override onlyValidator(_msgSender()) notConfirmed(_withdrawId, _msgSender()) {
        require(_tokenId == tokenId, "1713");
        require(_amount % 1 gwei == 0, "1030");
        require(_amount > protocolFee, "1031");

        if (withdraws[_withdrawId].account == address(0x0)) {
            WithdrawData memory data = WithdrawData({
                tokenId: _tokenId,
                account: _account,
                amount: _amount,
                executed: false
            });
            withdraws[_withdrawId] = data;
        } else {
            require(withdraws[_withdrawId].account == _account, "1717");
            require(withdraws[_withdrawId].amount == _amount, "1718");
        }
        confirmations[_withdrawId][_msgSender()] = true;

        if (!withdraws[_withdrawId].executed && _isConfirmed(_withdrawId)) {
            uint256 withdrawalAmount = _amount - protocolFee;
            if (ledgerContract.tokenBalanceOf(address(this)) >= withdraws[_withdrawId].amount) {
                ledgerContract.transferToken(address(this), _account, withdrawalAmount);
                ledgerContract.transferToken(address(this), ledgerContract.getProtocolFeeAccount(), protocolFee);
                withdraws[_withdrawId].executed = true;
                emit BridgeWithdrawn(
                    _tokenId,
                    _withdrawId,
                    _account,
                    withdrawalAmount,
                    ledgerContract.tokenBalanceOf(_account)
                );
            }
        }
    }

    /// @notice 브리지에 자금을 인출합니다.
    function executeWithdraw(
        bytes32 _withdrawId
    ) external override onlyValidator(_msgSender()) existWithdraw(_withdrawId) {
        if (!withdraws[_withdrawId].executed && _isConfirmed(_withdrawId)) {
            uint256 withdrawalAmount = withdraws[_withdrawId].amount - protocolFee;
            if (ledgerContract.tokenBalanceOf(address(this)) >= withdraws[_withdrawId].amount) {
                ledgerContract.transferToken(address(this), withdraws[_withdrawId].account, withdrawalAmount);
                ledgerContract.transferToken(address(this), ledgerContract.getProtocolFeeAccount(), protocolFee);
                withdraws[_withdrawId].executed = true;
                emit BridgeWithdrawn(
                    tokenId,
                    _withdrawId,
                    withdraws[_withdrawId].account,
                    withdrawalAmount,
                    ledgerContract.tokenBalanceOf(withdraws[_withdrawId].account)
                );
            }
        }
    }

    /// @notice 검증자들의 합의가 완료되었는지 체크합니다.
    function isConfirmed(bytes32 _withdrawId) external view override returns (bool) {
        return _isConfirmed(_withdrawId);
    }

    /// @notice 검증자들의 합의가 완료되었는지 체크합니다.
    function _isConfirmed(bytes32 _withdrawId) internal view returns (bool) {
        uint256 count = 0;
        for (uint256 i = 0; i < validatorContract.getLength(); i++) {
            address validator = validatorContract.itemOf(i);
            if (confirmations[_withdrawId][validator]) count += 1;
            if (count >= validatorContract.getRequired()) return true;
        }
        return false;
    }

    /// @notice 입력된 주소에 대해 검증이 되었는지를 리턴합니다.
    function isConfirmedOf(bytes32 _withdrawId, address validator) external view override returns (bool) {
        return confirmations[_withdrawId][validator];
    }

    /// @notice 예치정보를 조회합니다
    function getDepositInfo(bytes32 _depositId) external view override returns (DepositData memory) {
        return deposits[_depositId];
    }

    /// @notice 인출정보를 조회합니다
    function getWithdrawInfo(bytes32 _withdrawId) external view override returns (WithdrawData memory) {
        return withdraws[_withdrawId];
    }

    function getProtocolFee(bytes32 _tokenId) external view override returns (uint256) {
        return protocolFee;
    }

    function changeProtocolFee(bytes32 _tokenId, uint256 _protocolFee) external override {
        require(_tokenId == tokenId, "1713");
        require(_msgSender() == owner(), "1050");
        require(_protocolFee <= DMS.TOKEN_MAX_PROTOCOL_FEE, "1714");
        protocolFee = _protocolFee;
    }

    /// @notice 전체 유동성 자금을 조회합니다.
    function getTotalLiquidity(bytes32 _tokenId) external view override returns (uint256) {
        require(_tokenId == tokenId, "1713");
        return ledgerContract.tokenBalanceOf(address(this));
    }
}
