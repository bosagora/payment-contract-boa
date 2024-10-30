// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../interfaces/ICurrencyRate.sol";
import "../interfaces/IShop.sol";
import "./ShopStorage.sol";

import "../lib/DMS.sol";

/// @notice 상점컬랙션
contract Shop is ShopStorage, Initializable, OwnableUpgradeable, UUPSUpgradeable, IShop {
    /// @notice 상점이 추가될 때 발생되는 이벤트
    event AddedShop(bytes32 shopId, string name, string currency, address account, ShopStatus status);
    /// @notice 상점의 정보가 변경될 때 발생되는 이벤트
    event UpdatedShop(bytes32 shopId, string name, string currency, address account, ShopStatus status);
    /// @notice 상점의 정보가 변경될 때 발생되는 이벤트
    event ChangedShopStatus(bytes32 shopId, ShopStatus status);
    /// @notice 상점의 위임자가 변경될 때 발생되는 이벤트
    event ChangedDelegator(bytes32 shopId, address delegator);
    /// @notice 상점에서 제공한 마일리지가 증가할 때 발생되는 이벤트
    event IncreasedProvidedAmount(bytes32 shopId, uint256 increase, uint256 total, string currency, string purchaseId);
    /// @notice 상점에서 사용된 마일리지가 증가할 때 발생되는 이벤트
    event IncreasedUsedAmount(
        bytes32 shopId,
        uint256 increase,
        uint256 total,
        string currency,
        string purchaseId,
        bytes32 paymentId
    );
    /// @notice 상점에서 사용된 마일리지가 취소될 때 발생되는 이벤트
    event DecreasedUsedAmount(
        bytes32 shopId,
        uint256 increase,
        uint256 total,
        string currency,
        string purchaseId,
        bytes32 paymentId
    );

    event Refunded(
        bytes32 shopId,
        address account,
        uint256 refundAmount,
        uint256 refundedTotal,
        string currency,
        uint256 amountToken,
        uint256 balanceToken
    );

    event SetSettlementManager(bytes32 shopId, bytes32 managerShopId);
    event RemovedSettlementManager(bytes32 shopId, bytes32 managerShopId);
    event CollectedSettlementAmount(
        bytes32 clientId,
        address clientAccount,
        string clientCurrency,
        uint256 clientAmount,
        uint256 clientTotal,
        bytes32 managerId,
        address managerAccount,
        string managerCurrency,
        uint256 managerAmount,
        uint256 managerTotal
    );

    /// @notice 생성자
    function initialize(
        address _currencyRate,
        address _providerAddress,
        address _consumerAddress
    ) external initializer {
        __UUPSUpgradeable_init();
        __Ownable_init_unchained();

        providerAddress = _providerAddress;
        consumerAddress = _consumerAddress;

        currencyRate = ICurrencyRate(_currencyRate);
    }

    function _authorizeUpgrade(address newImplementation) internal virtual override {
        require(_msgSender() == owner(), "Unauthorized access");
    }

    modifier onlyProvider() {
        require(_msgSender() == providerAddress, "1005");
        _;
    }

    modifier onlyConsumer() {
        require(_msgSender() == consumerAddress, "1006");
        _;
    }

    /// @notice 원장 컨트랙트를 등록한다.
    function setLedger(address _contractAddress) external override {
        require(_msgSender() == owner(), "1050");
        if (!isSetLedger) {
            ledgerContract = ILedger(_contractAddress);
            isSetLedger = true;
        }
    }

    /// @notice 이용할 수 있는 아이디 인지 알려준다.
    /// @param _shopId 상점 아이디
    function isAvailableId(bytes32 _shopId) external view override returns (bool) {
        if (shops[_shopId].status == ShopStatus.INVALID) return true;
        else return false;
    }

    /// @notice 상점을 추가한다
    /// @param _shopId 상점 아이디
    /// @param _name 상점이름
    /// @dev 중계서버를 통해서 호출됩니다.
    function add(
        bytes32 _shopId,
        string calldata _name,
        string calldata _currency,
        address _account,
        bytes calldata _signature
    ) external virtual {
        require(shops[_shopId].status == ShopStatus.INVALID, "1200");
        require(currencyRate.support(_currency), "1211");
        bytes32 dataHash = keccak256(abi.encode(_shopId, _account, block.chainid, nonce[_account]));
        require(ECDSA.recover(ECDSA.toEthSignedMessageHash(dataHash), _signature) == _account, "1501");

        ShopData memory data = ShopData({
            shopId: _shopId,
            name: _name,
            currency: _currency,
            account: _account,
            delegator: address(0x0),
            providedAmount: 0,
            usedAmount: 0,
            collectedAmount: 0,
            refundedAmount: 0,
            status: ShopStatus.ACTIVE,
            itemIndex: items.length,
            accountIndex: shopIdByAddress[_account].length
        });
        items.push(_shopId);
        shops[_shopId] = data;
        shopIdByAddress[_account].push(_shopId);

        ShopSettlementData storage settlementData = settlements[_shopId];
        settlementData.manager = bytes32(0x0);

        nonce[_account]++;

        ShopData memory shop = shops[_shopId];
        emit AddedShop(shop.shopId, shop.name, shop.currency, shop.account, shop.status);
    }

    /// @notice 상점정보를 수정합니다
    /// @param _shopId 상점 아이디
    /// @param _name 상점이름
    /// @dev 중계서버를 통해서 호출됩니다.
    function update(
        bytes32 _shopId,
        string calldata _name,
        string calldata _currency,
        address _account,
        bytes calldata _signature
    ) external virtual {
        bytes32 id = _shopId;
        require(shops[id].status != ShopStatus.INVALID, "1201");
        require(currencyRate.support(_currency), "1211");
        require(
            shops[id].account == _account || (shops[id].delegator != address(0x0) && shops[id].delegator == _account),
            "1050"
        );

        bytes32 dataHash = keccak256(abi.encode(id, _account, block.chainid, nonce[_account]));
        require(ECDSA.recover(ECDSA.toEthSignedMessageHash(dataHash), _signature) == _account, "1501");

        shops[id].name = _name;
        if (keccak256(abi.encodePacked(shops[id].currency)) != keccak256(abi.encodePacked(_currency))) {
            shops[id].providedAmount = currencyRate.convertCurrency(
                shops[id].providedAmount,
                shops[id].currency,
                _currency
            );
            shops[id].usedAmount = currencyRate.convertCurrency(shops[id].usedAmount, shops[id].currency, _currency);
            shops[id].refundedAmount = currencyRate.convertCurrency(
                shops[id].refundedAmount,
                shops[id].currency,
                _currency
            );
            shops[id].currency = _currency;
        }

        nonce[_account]++;

        emit UpdatedShop(shops[id].shopId, shops[id].name, shops[id].currency, shops[id].account, shops[id].status);
    }

    /// @notice 상점상태를 수정합니다
    /// @param _shopId 상점 아이디
    /// @param _status 상점의 상태
    /// @dev 중계서버를 통해서 호출됩니다.
    function changeStatus(
        bytes32 _shopId,
        ShopStatus _status,
        address _account,
        bytes calldata _signature
    ) external virtual {
        bytes32 id = _shopId;
        require(_status != ShopStatus.INVALID, "1201");
        require(shops[id].status != ShopStatus.INVALID, "1201");
        require(
            shops[id].account == _account || (shops[id].delegator != address(0x0) && shops[id].delegator == _account),
            "1050"
        );

        bytes32 dataHash = keccak256(abi.encode(id, _account, block.chainid, nonce[_account]));
        require(ECDSA.recover(ECDSA.toEthSignedMessageHash(dataHash), _signature) == _account, "1501");

        shops[id].status = _status;

        nonce[_account]++;

        emit ChangedShopStatus(shops[id].shopId, shops[id].status);
    }

    /// @notice 상점상태를 수정합니다
    /// @param _shopId 상점 아이디
    /// @param _delegator 상점의 위임자의 주소
    /// @dev 중계서버를 통해서 호출됩니다.
    function changeDelegator(
        bytes32 _shopId,
        address _delegator,
        address _account,
        bytes calldata _signature
    ) external virtual {
        bytes32 id = _shopId;
        require(shops[id].status != ShopStatus.INVALID, "1201");
        require(shops[id].account == _account, "1050");

        bytes32 dataHash = keccak256(abi.encode(id, _delegator, _account, block.chainid, nonce[_account]));
        require(ECDSA.recover(ECDSA.toEthSignedMessageHash(dataHash), _signature) == _account, "1501");

        shops[id].delegator = _delegator;

        nonce[_account]++;

        emit ChangedDelegator(shops[id].shopId, shops[id].delegator);
    }

    /// @notice 지갑주소로 등록한 상점의 아이디들을 리턴한다.
    /// @param _account 지갑주소
    function getShopsOfAccount(
        address _account,
        uint256 _from,
        uint256 _to
    ) external view override returns (bytes32[] memory) {
        bytes32[] memory values = new bytes32[](_to - _from);
        for (uint256 i = _from; i < _to; i++) {
            values[i - _from] = shopIdByAddress[_account][i];
        }
        return values;
    }

    /// @notice 지갑주소로 등록한 상점의 갯수를 리턴한다.
    /// @param _account 지갑주소
    function getShopsCountOfAccount(address _account) external view override returns (uint256) {
        return shopIdByAddress[_account].length;
    }

    /// @notice 지급된 총 마일지리를 누적한다
    function addProvidedAmount(
        bytes32 _shopId,
        uint256 _value,
        string calldata _purchaseId
    ) external override onlyProvider {
        if (shops[_shopId].status != ShopStatus.INVALID) {
            shops[_shopId].providedAmount += _value;
            emit IncreasedProvidedAmount(
                _shopId,
                _value,
                shops[_shopId].providedAmount,
                shops[_shopId].currency,
                _purchaseId
            );
        }
    }

    /// @notice 사용된 총 마일지리를 누적한다
    function addUsedAmount(
        bytes32 _shopId,
        uint256 _value,
        string calldata _purchaseId,
        bytes32 _paymentId
    ) external override onlyConsumer {
        if (shops[_shopId].status == ShopStatus.ACTIVE) {
            shops[_shopId].usedAmount += _value;
            emit IncreasedUsedAmount(
                _shopId,
                _value,
                shops[_shopId].usedAmount,
                shops[_shopId].currency,
                _purchaseId,
                _paymentId
            );
        }
    }

    /// @notice 사용된 총 마일지리를 빼준다
    function subUsedAmount(
        bytes32 _shopId,
        uint256 _value,
        string calldata _purchaseId,
        bytes32 _paymentId
    ) external override onlyConsumer {
        if (shops[_shopId].status == ShopStatus.ACTIVE) {
            if (shops[_shopId].usedAmount >= _value) {
                shops[_shopId].usedAmount -= _value;
                emit DecreasedUsedAmount(
                    _shopId,
                    _value,
                    shops[_shopId].usedAmount,
                    shops[_shopId].currency,
                    _purchaseId,
                    _paymentId
                );
            }
        }
    }

    /// @notice 상점 데이터를 리턴한다
    /// @param _shopId 상점의 아이디
    function shopOf(bytes32 _shopId) external view override returns (ShopData memory) {
        return shops[_shopId];
    }

    /// @notice 상점의 아이디를 리턴한다
    /// @param _idx 배열의 순번
    function shopIdOf(uint256 _idx) external view virtual returns (bytes32) {
        return items[_idx];
    }

    /// @notice 상점의 갯수를 리턴한다
    function shopsLength() external view virtual returns (uint256) {
        return items.length;
    }

    /// @notice 반환가능한 정산금액을 리턴한다.
    /// @param _shopId 상점의 아이디
    function refundableOf(
        bytes32 _shopId
    ) external view override returns (uint256 refundableAmount, uint256 refundableToken) {
        ShopData memory shop = shops[_shopId];
        uint256 settlementAmount = (shop.collectedAmount + shop.usedAmount > shop.providedAmount)
            ? shop.collectedAmount + shop.usedAmount - shop.providedAmount
            : 0;
        refundableAmount = (settlementAmount > shop.refundedAmount) ? settlementAmount - shop.refundedAmount : 0;
        refundableToken = currencyRate.convertCurrencyToToken(refundableAmount, shops[_shopId].currency);
    }

    /// @notice 정산금의 반환한다.
    /// @param _shopId 상점아이디
    /// @param _amount 인출금
    /// @dev 중계서버를 통해서 상점주의 서명을 가지고 호출됩니다.
    function refund(bytes32 _shopId, uint256 _amount, bytes calldata _signature) external virtual {
        require(shops[_shopId].status == ShopStatus.ACTIVE, "1202");
        require(_amount % 1 gwei == 0, "1030");

        address signer;
        address shopOwner = shops[_shopId].account;

        address recurve1 = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(keccak256(abi.encode(_shopId, _amount, block.chainid, nonce[shopOwner]))),
            _signature
        );

        if (recurve1 == shopOwner) {
            signer = shopOwner;
        } else {
            address agent = ledgerContract.refundAgentOf(shopOwner);
            require(agent != address(0x0), "1501");

            address recurve2 = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(keccak256(abi.encode(_shopId, _amount, block.chainid, nonce[agent]))),
                _signature
            );
            require(recurve2 == agent, "1501");
            signer = agent;
        }

        ShopData memory shop = shops[_shopId];
        uint256 settlementAmount = (shop.collectedAmount + shop.usedAmount > shop.providedAmount)
            ? shop.collectedAmount + shop.usedAmount - shop.providedAmount
            : 0;
        uint256 refundableAmount = (settlementAmount > shop.refundedAmount)
            ? settlementAmount - shop.refundedAmount
            : 0;

        require(_amount <= refundableAmount, "1220");

        uint256 amountToken = currencyRate.convertCurrencyToToken(_amount, shop.currency);
        ledgerContract.refund(shopOwner, _amount, shop.currency, amountToken, shop.shopId);

        shops[shop.shopId].refundedAmount += _amount;
        nonce[signer]++;

        uint256 balanceToken = ledgerContract.tokenBalanceOf(shopOwner);
        uint256 refundedTotal = shops[shop.shopId].refundedAmount;
        string memory currency = shop.currency;
        emit Refunded(_shopId, shopOwner, _amount, refundedTotal, currency, amountToken, balanceToken);
    }

    /// @notice nonce 를  리턴한다
    /// @param _account 지갑주소
    function nonceOf(address _account) external view override returns (uint256) {
        return nonce[_account];
    }

    /// @notice 정산관리자를 지정한다
    /// @param _managerShopId 정산관리자의 상점아이디
    /// @param _shopId 클라이언트의 상점아이디
    /// @param _signature 서명
    /// @dev 중계서버를 통해서 호출됩니다.
    function setSettlementManager(bytes32 _shopId, bytes32 _managerShopId, bytes calldata _signature) external {
        require(_shopId != bytes32(0x0), "1223");
        require(_managerShopId != bytes32(0x0), "1223");
        require(_shopId != _managerShopId, "1224");
        require(shops[_shopId].status != ShopStatus.INVALID, "1201");
        require(shops[_managerShopId].status != ShopStatus.INVALID, "1201");
        address account = shops[_shopId].account;
        bytes32 dataHash = keccak256(
            abi.encode("SetSettlementManager", _shopId, _managerShopId, block.chainid, nonce[account])
        );
        require(ECDSA.recover(ECDSA.toEthSignedMessageHash(dataHash), _signature) == account, "1501");

        // 정산관리자에 클라이언트를 추가한다.
        ShopSettlementData storage settlementData = settlements[_managerShopId];
        if (settlementData.clientValues[_shopId].states == SettlementClientStates.INVALID) {
            settlementData.clientValues[_shopId] = SettlementClientData({
                index: settlementData.clients.length,
                states: SettlementClientStates.ACTIVE
            });
            settlementData.clients.push(_shopId);
        }
        // 정산클라이언트의 정보에 정산관리자를 설정한다
        ShopSettlementData storage clientSettlementData = settlements[_shopId];
        clientSettlementData.manager = _managerShopId;

        nonce[account]++;

        emit SetSettlementManager(_shopId, _managerShopId);
    }

    /// @notice 정산관리자를 제거한다
    /// @param _shopId 클라이언트의 상점아이디
    /// @dev 중계서버를 통해서 호출됩니다.
    function removeSettlementManager(bytes32 _shopId, bytes calldata _signature) external {
        require(_shopId != bytes32(0x0), "1223");
        require(shops[_shopId].status != ShopStatus.INVALID, "1201");
        address account = shops[_shopId].account;
        bytes32 dataHash = keccak256(
            abi.encode("RemoveSettlementManager", _shopId, bytes32(0x0), block.chainid, nonce[account])
        );
        require(ECDSA.recover(ECDSA.toEthSignedMessageHash(dataHash), _signature) == account, "1501");

        // 정산클라이언트의 정보에 정산관리자를 제거한다
        ShopSettlementData storage clientSettlementData = settlements[_shopId];
        bytes32 managerShopId = clientSettlementData.manager;
        clientSettlementData.manager = bytes32(0x0);

        // 정산관리자에서 클라이언트를 제거한다.
        if (managerShopId != bytes32(0x0)) {
            ShopSettlementData storage settlementData = settlements[managerShopId];
            if (settlementData.clientValues[_shopId].states == SettlementClientStates.ACTIVE) {
                uint256 idx = settlementData.clientValues[_shopId].index;
                uint256 last = settlementData.clients.length - 1;
                settlementData.clients[idx] = settlementData.clients[last];
                settlementData.clientValues[settlementData.clients[idx]].index = idx;
                settlementData.clientValues[_shopId].states = SettlementClientStates.INVALID;
                settlementData.clients.pop();
            }
        }

        nonce[account]++;

        emit RemovedSettlementManager(_shopId, managerShopId);
    }

    /// @notice 정산관리자의 상점아이디를 리턴한다
    function settlementManagerOf(bytes32 _shopId) external view override returns (bytes32) {
        return settlements[_shopId].manager;
    }

    function getSettlementClientLength(bytes32 _managerShopId) external view returns (uint256) {
        require(_managerShopId != bytes32(0x0), "1223");
        require(shops[_managerShopId].status != ShopStatus.INVALID, "1201");
        return settlements[_managerShopId].clients.length;
    }

    function getSettlementClientList(
        bytes32 _managerShopId,
        uint256 startIndex,
        uint256 endIndex
    ) external view returns (bytes32[] memory) {
        require(_managerShopId != bytes32(0x0), "1223");
        require(shops[_managerShopId].status != ShopStatus.INVALID, "1201");
        uint256 length = settlements[_managerShopId].clients.length;
        uint256 first;
        uint256 last;
        if (startIndex <= endIndex) {
            first = (startIndex <= length - 1) ? startIndex : length;
            last = (endIndex <= length) ? endIndex : length;
        } else {
            first = (endIndex <= length - 1) ? endIndex : length;
            last = (startIndex <= length) ? startIndex : length;
        }
        bytes32[] memory res = new bytes32[](last - first);
        for (uint256 idx = first; idx < last; idx++) {
            res[idx - first] = settlements[_managerShopId].clients[idx];
        }
        return res;
    }

    function collectSettlementAmount(
        bytes32 _managerShopId,
        bytes32 _clientShopId,
        bytes calldata _signature
    ) external {
        require(_managerShopId != bytes32(0x0), "1223");
        require(_clientShopId != bytes32(0x0), "1223");
        require(shops[_managerShopId].status != ShopStatus.INVALID, "1201");
        require(shops[_clientShopId].status != ShopStatus.INVALID, "1201");
        require(settlements[_clientShopId].manager == _managerShopId, "1553");
        require(
            settlements[_managerShopId].clientValues[_clientShopId].states == SettlementClientStates.ACTIVE,
            "1554"
        );

        address sender;
        address shopOwner = shops[_managerShopId].account;
        address recurve1 = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(
                keccak256(
                    abi.encode(
                        "CollectSettlementAmount",
                        _managerShopId,
                        _clientShopId,
                        block.chainid,
                        nonce[shopOwner]
                    )
                )
            ),
            _signature
        );

        if (recurve1 == shopOwner) {
            sender = shopOwner;
        } else {
            address agent = ledgerContract.refundAgentOf(shopOwner);
            require(agent != address(0x0), "1501");

            address recurve2 = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(
                    keccak256(
                        abi.encode(
                            "CollectSettlementAmount",
                            _managerShopId,
                            _clientShopId,
                            block.chainid,
                            nonce[agent]
                        )
                    )
                ),
                _signature
            );
            require(recurve2 == agent, "1501");
            sender = agent;
        }

        nonce[sender]++;

        _collectSettlementAmount(_managerShopId, _clientShopId);
    }

    function collectSettlementAmountMultiClient(
        bytes32 _managerShopId,
        bytes32[] calldata _clientShopIds,
        bytes calldata _signature
    ) external {
        require(_managerShopId != bytes32(0x0), "1223");
        require(shops[_managerShopId].status != ShopStatus.INVALID, "1201");

        address sender;
        address shopOwner = shops[_managerShopId].account;

        address recurve1 = ECDSA.recover(
            ECDSA.toEthSignedMessageHash(
                keccak256(
                    abi.encode(
                        "CollectSettlementAmountMultiClient",
                        _managerShopId,
                        _clientShopIds,
                        block.chainid,
                        nonce[shopOwner]
                    )
                )
            ),
            _signature
        );

        if (recurve1 == shopOwner) {
            sender = shopOwner;
        } else {
            address agent = ledgerContract.refundAgentOf(shopOwner);
            require(agent != address(0x0), "1501");

            address recurve2 = ECDSA.recover(
                ECDSA.toEthSignedMessageHash(
                    keccak256(
                        abi.encode(
                            "CollectSettlementAmountMultiClient",
                            _managerShopId,
                            _clientShopIds,
                            block.chainid,
                            nonce[agent]
                        )
                    )
                ),
                _signature
            );
            require(recurve2 == agent, "1501");
            sender = agent;
        }

        nonce[sender]++;

        for (uint256 idx = 0; idx < _clientShopIds.length; idx++) {
            bytes32 clientShopId = _clientShopIds[idx];
            if (shops[clientShopId].status == ShopStatus.INVALID) continue;
            if (settlements[clientShopId].manager != _managerShopId) continue;
            if (settlements[_managerShopId].clientValues[clientShopId].states != SettlementClientStates.ACTIVE)
                continue;
            _collectSettlementAmount(_managerShopId, clientShopId);
        }
    }

    function _collectSettlementAmount(bytes32 _managerShopId, bytes32 _clientShopId) internal {
        ShopData storage managerShop = shops[_managerShopId];
        ShopData storage clientShop = shops[_clientShopId];

        uint256 settlementAmount = (clientShop.collectedAmount + clientShop.usedAmount > clientShop.providedAmount)
            ? clientShop.collectedAmount + clientShop.usedAmount - clientShop.providedAmount
            : 0;
        uint256 refundableAmount = (settlementAmount > clientShop.refundedAmount)
            ? settlementAmount - clientShop.refundedAmount
            : 0;

        if (refundableAmount > 0) {
            clientShop.refundedAmount += refundableAmount;
            uint256 managerAmount = currencyRate.convertCurrency(
                refundableAmount,
                clientShop.currency,
                managerShop.currency
            );
            managerShop.collectedAmount += managerAmount;

            emit CollectedSettlementAmount(
                clientShop.shopId,
                clientShop.account,
                clientShop.currency,
                refundableAmount,
                clientShop.refundedAmount,
                managerShop.shopId,
                managerShop.account,
                managerShop.currency,
                managerAmount,
                managerShop.collectedAmount
            );
        }
    }
}
