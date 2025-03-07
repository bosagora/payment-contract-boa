// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../interfaces/IPhoneLinkCollection.sol";

import "../interfaces/ICurrencyRate.sol";
import "../interfaces/IValidator.sol";
import "../interfaces/IShop.sol";
import "../interfaces/ILedger.sol";
import "./LoyaltyProviderStorage.sol";

import "../lib/DMS.sol";

contract LoyaltyProvider is LoyaltyProviderStorage, Initializable, OwnableUpgradeable, UUPSUpgradeable {
    struct PurchaseData {
        string purchaseId;
        uint256 amount;
        uint256 loyalty;
        string currency;
        bytes32 shopId;
        address account;
        bytes32 phone;
        address sender;
        bytes signature;
    }

    /// @notice 검증자가 추가될 때 발생되는 이벤트
    event SavedPurchase(
        string purchaseId,
        uint256 amount,
        uint256 loyalty,
        string currency,
        bytes32 shopId,
        address account,
        bytes32 phone,
        address sender
    );

    event ProvidedLoyaltyPointToAddress(
        address provider,
        address receiver,
        uint256 amountPoint,
        uint256 amountToken,
        uint256 balancePoint,
        uint256 balanceToken
    );
    event ProvidedLoyaltyPointToPhone(
        address provider,
        bytes32 receiver,
        uint256 amountPoint,
        uint256 amountToken,
        uint256 balancePoint,
        uint256 balanceToken
    );

    function initialize(
        address _validatorAddress,
        address _linkAddress,
        address _currencyRateAddress
    ) external initializer {
        __UUPSUpgradeable_init();
        __Ownable_init_unchained();

        validatorContract = IValidator(_validatorAddress);
        linkContract = IPhoneLinkCollection(_linkAddress);
        currencyRateContract = ICurrencyRate(_currencyRateAddress);
        isSetLedger = false;
        isSetShop = false;
    }

    /// @notice 원장 컨트랙트를 등록한다.
    function setLedger(address _contractAddress) public {
        require(_msgSender() == owner(), "1050");
        if (!isSetLedger) {
            ledgerContract = ILedger(_contractAddress);
            systemAccount = ledgerContract.getSystemAccount();
            isSetLedger = true;
        }
    }

    /// @notice 상점 컨트랙트를 등록한다.
    function setShop(address _contractAddress) public {
        require(_msgSender() == owner(), "1050");
        if (!isSetShop) {
            shopContract = IShop(_contractAddress);
            isSetShop = true;
        }
    }

    function _authorizeUpgrade(address newImplementation) internal virtual override {
        require(_msgSender() == owner(), "Unauthorized access");
    }

    /// @notice 구매내역을 저장합니다.
    /// @dev 이것은 검증자들에 의해 호출되어야 합니다.
    function savePurchase(
        uint256 _height,
        PurchaseData[] calldata _data,
        bytes[] calldata _signatures,
        bytes calldata _proposerSignature
    ) external {
        // Check the number of voters and signatories
        uint256 numberOfVoters = validatorContract.lengthOfCurrentActiveValidator();
        require(numberOfVoters > 0, "1162");
        require(_signatures.length <= numberOfVoters, "1163");

        // Validation of data
        for (uint256 i = 0; i < _data.length; i++) {
            require(purchases[_data[i].purchaseId] == false, "1160");
            require(_data[i].loyalty % 1 gwei == 0, "1030");
            if (_data[i].loyalty > 0) {
                require(_data[i].loyalty <= DMS.zeroGWEI(_data[i].amount / 10), "1161");
            }
        }

        // Get a hash of all the data
        bytes32[] memory messages = new bytes32[](_data.length);
        for (uint256 i = 0; i < _data.length; i++) {
            PurchaseData memory data = _data[i];
            messages[i] = keccak256(
                abi.encode(
                    data.purchaseId,
                    data.amount,
                    data.loyalty,
                    data.currency,
                    data.shopId,
                    data.account,
                    data.phone,
                    data.sender,
                    block.chainid
                )
            );
        }

        bytes32[] memory signatureMessages = new bytes32[](_signatures.length);
        for (uint256 i = 0; i < _signatures.length; i++) {
            signatureMessages[i] = keccak256(abi.encode(keccak256(_signatures[i]), block.chainid));
        }
        bytes32 proposerDataHash = keccak256(abi.encode(_height, messages.length, messages, signatureMessages));

        // Check Proposer Signature
        address proposer = ECDSA.recover(ECDSA.toEthSignedMessageHash(proposerDataHash), _proposerSignature);
        require(validatorContract.isCurrentActiveValidator(proposer), "1000");

        bytes32 dataHash = keccak256(abi.encode(_height, messages.length, messages));

        // Counting by signature
        address[] memory participants = new address[](_signatures.length);
        uint256 length = 0;
        for (uint256 idx = 0; idx < _signatures.length; idx++) {
            address participant = ECDSA.recover(ECDSA.toEthSignedMessageHash(dataHash), _signatures[idx]);
            bool exist = false;
            for (uint256 j = 0; j < length; j++) {
                if (participants[j] == participant) {
                    exist = true;
                    break;
                }
            }
            if (!exist && validatorContract.isCurrentActiveValidator(participant)) {
                participants[length] = participant;
                length++;
            }
        }

        require(((length * 1000) / numberOfVoters) >= DMS.QUORUM, "1164");

        for (uint256 i = 0; i < _data.length; i++) {
            PurchaseData memory data = _data[i];
            if (data.loyalty > 0) {
                bytes32 purchaseDataHash = keccak256(
                    abi.encode(
                        data.purchaseId,
                        data.amount,
                        data.loyalty,
                        data.currency,
                        data.shopId,
                        data.account,
                        data.phone,
                        data.sender,
                        block.chainid
                    )
                );
                address recover = ECDSA.recover(ECDSA.toEthSignedMessageHash(purchaseDataHash), data.signature);
                address assistant = ledgerContract.assistantOf(data.sender);
                if ((assistant == address(0x0)) && (recover != data.sender)) continue;
                if ((assistant != address(0x0)) && (recover != assistant)) continue;

                uint256 loyaltyValue = data.loyalty;
                uint256 loyaltyPoint = currencyRateContract.convertCurrencyToPoint(loyaltyValue, data.currency);

                IShop.ShopData memory shop = shopContract.shopOf(data.shopId);
                if (shop.status == IShop.ShopStatus.ACTIVE) {
                    if (data.account != address(0x0)) {
                        ledgerContract.providePoint(
                            data.account,
                            loyaltyPoint,
                            loyaltyValue,
                            data.currency,
                            data.purchaseId,
                            data.shopId,
                            data.sender
                        );
                        shopContract.addProvidedAmount(
                            data.shopId,
                            currencyRateContract.convertCurrency(loyaltyValue, data.currency, shop.currency),
                            data.purchaseId
                        );
                    } else if (data.phone != DMS.NULL) {
                        address account = linkContract.toAddress(data.phone);
                        if (account == address(0x00)) {
                            ledgerContract.provideUnPayablePoint(
                                data.phone,
                                loyaltyPoint,
                                loyaltyValue,
                                data.currency,
                                data.purchaseId,
                                data.shopId,
                                data.sender
                            );
                        } else {
                            ledgerContract.providePoint(
                                account,
                                loyaltyPoint,
                                loyaltyValue,
                                data.currency,
                                data.purchaseId,
                                data.shopId,
                                data.sender
                            );
                        }
                        shopContract.addProvidedAmount(
                            data.shopId,
                            currencyRateContract.convertCurrency(loyaltyValue, data.currency, shop.currency),
                            data.purchaseId
                        );
                    }
                }
            }
            purchases[data.purchaseId] = true;
            emit SavedPurchase(
                data.purchaseId,
                data.amount,
                data.loyalty,
                data.currency,
                data.shopId,
                data.account,
                data.phone,
                data.sender
            );
        }
    }

    function purchasesOf(string calldata _purchaseId) external view returns (bool) {
        return purchases[_purchaseId];
    }

    function provideToAddress(
        address _provider,
        address _receiver,
        uint256 _point,
        bytes calldata _signature
    ) external {
        require(_provider != systemAccount, "1051");
        require(_receiver != systemAccount, "1052");
        require(ledgerContract.isProvider(_provider), "1054");
        require(_point % 1 gwei == 0, "1030");

        address recurve1 = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(
                keccak256(abi.encode(_provider, _receiver, _point, block.chainid, ledgerContract.nonceOf(_provider)))
            ),
            _signature
        );

        address sender;
        if (recurve1 == _provider) {
            sender = _provider;
        } else {
            address assistant = ledgerContract.assistantOf(_provider);
            require(assistant != address(0x0), "1501");

            address recurve2 = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(
                    keccak256(
                        abi.encode(_provider, _receiver, _point, block.chainid, ledgerContract.nonceOf(assistant))
                    )
                ),
                _signature
            );
            require(recurve2 == assistant, "1501");
            sender = assistant;
        }

        ledgerContract.providePoint(
            _receiver,
            _point,
            _point,
            DMS.DEFAULT_CURRENCY_SYMBOL,
            "",
            bytes32(0x0),
            _provider
        );
        ledgerContract.increaseNonce(sender);

        uint256 amountToken = currencyRateContract.convertPointToToken(_point);
        uint256 balancePoint = ledgerContract.pointBalanceOf(_provider);
        uint256 balanceToken = ledgerContract.tokenBalanceOf(_provider);
        emit ProvidedLoyaltyPointToAddress(_provider, _receiver, _point, amountToken, balancePoint, balanceToken);
    }

    function provideToPhone(address _provider, bytes32 _phoneHash, uint256 _point, bytes calldata _signature) external {
        require(_provider != systemAccount, "1051");
        require(ledgerContract.isProvider(_provider), "1054");
        require(_point % 1 gwei == 0, "1030");

        address recurve1 = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(
                keccak256(abi.encode(_provider, _phoneHash, _point, block.chainid, ledgerContract.nonceOf(_provider)))
            ),
            _signature
        );

        address sender;
        if (recurve1 == _provider) {
            sender = _provider;
        } else {
            address assistant = ledgerContract.assistantOf(_provider);
            require(assistant != address(0x0), "1501");

            address recurve2 = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(
                    keccak256(
                        abi.encode(_provider, _phoneHash, _point, block.chainid, ledgerContract.nonceOf(assistant))
                    )
                ),
                _signature
            );
            require(recurve2 == assistant, "1501");
            sender = assistant;
        }

        address receiver = linkContract.toAddress(_phoneHash);
        if (receiver == address(0x00)) {
            ledgerContract.provideUnPayablePoint(
                _phoneHash,
                _point,
                _point,
                DMS.DEFAULT_CURRENCY_SYMBOL,
                "",
                bytes32(0x0),
                _provider
            );
        } else {
            ledgerContract.providePoint(
                receiver,
                _point,
                _point,
                DMS.DEFAULT_CURRENCY_SYMBOL,
                "",
                bytes32(0x0),
                _provider
            );
        }
        ledgerContract.increaseNonce(sender);

        uint256 amountToken = currencyRateContract.convertPointToToken(_point);
        uint256 balancePoint = ledgerContract.pointBalanceOf(_provider);
        uint256 balanceToken = ledgerContract.tokenBalanceOf(_provider);
        emit ProvidedLoyaltyPointToPhone(_provider, _phoneHash, _point, amountToken, balancePoint, balanceToken);
    }
}
