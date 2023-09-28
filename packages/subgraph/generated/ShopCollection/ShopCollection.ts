// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class AddedShop extends ethereum.Event {
  get params(): AddedShop__Params {
    return new AddedShop__Params(this);
  }
}

export class AddedShop__Params {
  _event: AddedShop;

  constructor(event: AddedShop) {
    this._event = event;
  }

  get shopId(): string {
    return this._event.parameters[0].value.toString();
  }

  get provideWaitTime(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get providePercent(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get phone(): Bytes {
    return this._event.parameters[3].value.toBytes();
  }
}

export class IncreasedClearedPoint extends ethereum.Event {
  get params(): IncreasedClearedPoint__Params {
    return new IncreasedClearedPoint__Params(this);
  }
}

export class IncreasedClearedPoint__Params {
  _event: IncreasedClearedPoint;

  constructor(event: IncreasedClearedPoint) {
    this._event = event;
  }

  get shopId(): string {
    return this._event.parameters[0].value.toString();
  }

  get increase(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get total(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get purchaseId(): string {
    return this._event.parameters[3].value.toString();
  }
}

export class IncreasedProvidedPoint extends ethereum.Event {
  get params(): IncreasedProvidedPoint__Params {
    return new IncreasedProvidedPoint__Params(this);
  }
}

export class IncreasedProvidedPoint__Params {
  _event: IncreasedProvidedPoint;

  constructor(event: IncreasedProvidedPoint) {
    this._event = event;
  }

  get shopId(): string {
    return this._event.parameters[0].value.toString();
  }

  get increase(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get total(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get purchaseId(): string {
    return this._event.parameters[3].value.toString();
  }
}

export class IncreasedUsedPoint extends ethereum.Event {
  get params(): IncreasedUsedPoint__Params {
    return new IncreasedUsedPoint__Params(this);
  }
}

export class IncreasedUsedPoint__Params {
  _event: IncreasedUsedPoint;

  constructor(event: IncreasedUsedPoint) {
    this._event = event;
  }

  get shopId(): string {
    return this._event.parameters[0].value.toString();
  }

  get increase(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get total(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get purchaseId(): string {
    return this._event.parameters[3].value.toString();
  }
}

export class ShopCollection__shopOfResultValue0Struct extends ethereum.Tuple {
  get shopId(): string {
    return this[0].toString();
  }

  get provideWaitTime(): BigInt {
    return this[1].toBigInt();
  }

  get providePercent(): BigInt {
    return this[2].toBigInt();
  }

  get phone(): Bytes {
    return this[3].toBytes();
  }

  get providedPoint(): BigInt {
    return this[4].toBigInt();
  }

  get usedPoint(): BigInt {
    return this[5].toBigInt();
  }

  get clearedPoint(): BigInt {
    return this[6].toBigInt();
  }

  get status(): i32 {
    return this[7].toI32();
  }
}

export class ShopCollection extends ethereum.SmartContract {
  static bind(address: Address): ShopCollection {
    return new ShopCollection("ShopCollection", address);
  }

  NULL(): Bytes {
    let result = super.call("NULL", "NULL():(bytes32)", []);

    return result[0].toBytes();
  }

  try_NULL(): ethereum.CallResult<Bytes> {
    let result = super.tryCall("NULL", "NULL():(bytes32)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  deployer(): Address {
    let result = super.call("deployer", "deployer():(address)", []);

    return result[0].toAddress();
  }

  try_deployer(): ethereum.CallResult<Address> {
    let result = super.tryCall("deployer", "deployer():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getClearPoint(_shopId: string): BigInt {
    let result = super.call(
      "getClearPoint",
      "getClearPoint(string):(uint256)",
      [ethereum.Value.fromString(_shopId)]
    );

    return result[0].toBigInt();
  }

  try_getClearPoint(_shopId: string): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "getClearPoint",
      "getClearPoint(string):(uint256)",
      [ethereum.Value.fromString(_shopId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  ledgerAddress(): Address {
    let result = super.call("ledgerAddress", "ledgerAddress():(address)", []);

    return result[0].toAddress();
  }

  try_ledgerAddress(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "ledgerAddress",
      "ledgerAddress():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  shopIdOf(_idx: BigInt): string {
    let result = super.call("shopIdOf", "shopIdOf(uint256):(string)", [
      ethereum.Value.fromUnsignedBigInt(_idx)
    ]);

    return result[0].toString();
  }

  try_shopIdOf(_idx: BigInt): ethereum.CallResult<string> {
    let result = super.tryCall("shopIdOf", "shopIdOf(uint256):(string)", [
      ethereum.Value.fromUnsignedBigInt(_idx)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  shopOf(_shopId: string): ShopCollection__shopOfResultValue0Struct {
    let result = super.call(
      "shopOf",
      "shopOf(string):((string,uint256,uint256,bytes32,uint256,uint256,uint256,uint8))",
      [ethereum.Value.fromString(_shopId)]
    );

    return changetype<ShopCollection__shopOfResultValue0Struct>(
      result[0].toTuple()
    );
  }

  try_shopOf(
    _shopId: string
  ): ethereum.CallResult<ShopCollection__shopOfResultValue0Struct> {
    let result = super.tryCall(
      "shopOf",
      "shopOf(string):((string,uint256,uint256,bytes32,uint256,uint256,uint256,uint8))",
      [ethereum.Value.fromString(_shopId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      changetype<ShopCollection__shopOfResultValue0Struct>(value[0].toTuple())
    );
  }

  shopsLength(): BigInt {
    let result = super.call("shopsLength", "shopsLength():(uint256)", []);

    return result[0].toBigInt();
  }

  try_shopsLength(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("shopsLength", "shopsLength():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  validatorAddress(): Address {
    let result = super.call(
      "validatorAddress",
      "validatorAddress():(address)",
      []
    );

    return result[0].toAddress();
  }

  try_validatorAddress(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "validatorAddress",
      "validatorAddress():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _validatorAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class AddCall extends ethereum.Call {
  get inputs(): AddCall__Inputs {
    return new AddCall__Inputs(this);
  }

  get outputs(): AddCall__Outputs {
    return new AddCall__Outputs(this);
  }
}

export class AddCall__Inputs {
  _call: AddCall;

  constructor(call: AddCall) {
    this._call = call;
  }

  get _shopId(): string {
    return this._call.inputValues[0].value.toString();
  }

  get _provideWaitTime(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _providePercent(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get _phone(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }
}

export class AddCall__Outputs {
  _call: AddCall;

  constructor(call: AddCall) {
    this._call = call;
  }
}

export class AddClearedPointCall extends ethereum.Call {
  get inputs(): AddClearedPointCall__Inputs {
    return new AddClearedPointCall__Inputs(this);
  }

  get outputs(): AddClearedPointCall__Outputs {
    return new AddClearedPointCall__Outputs(this);
  }
}

export class AddClearedPointCall__Inputs {
  _call: AddClearedPointCall;

  constructor(call: AddClearedPointCall) {
    this._call = call;
  }

  get _shopId(): string {
    return this._call.inputValues[0].value.toString();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _purchaseId(): string {
    return this._call.inputValues[2].value.toString();
  }
}

export class AddClearedPointCall__Outputs {
  _call: AddClearedPointCall;

  constructor(call: AddClearedPointCall) {
    this._call = call;
  }
}

export class AddProvidedPointCall extends ethereum.Call {
  get inputs(): AddProvidedPointCall__Inputs {
    return new AddProvidedPointCall__Inputs(this);
  }

  get outputs(): AddProvidedPointCall__Outputs {
    return new AddProvidedPointCall__Outputs(this);
  }
}

export class AddProvidedPointCall__Inputs {
  _call: AddProvidedPointCall;

  constructor(call: AddProvidedPointCall) {
    this._call = call;
  }

  get _shopId(): string {
    return this._call.inputValues[0].value.toString();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _purchaseId(): string {
    return this._call.inputValues[2].value.toString();
  }
}

export class AddProvidedPointCall__Outputs {
  _call: AddProvidedPointCall;

  constructor(call: AddProvidedPointCall) {
    this._call = call;
  }
}

export class AddUsedPointCall extends ethereum.Call {
  get inputs(): AddUsedPointCall__Inputs {
    return new AddUsedPointCall__Inputs(this);
  }

  get outputs(): AddUsedPointCall__Outputs {
    return new AddUsedPointCall__Outputs(this);
  }
}

export class AddUsedPointCall__Inputs {
  _call: AddUsedPointCall;

  constructor(call: AddUsedPointCall) {
    this._call = call;
  }

  get _shopId(): string {
    return this._call.inputValues[0].value.toString();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _purchaseId(): string {
    return this._call.inputValues[2].value.toString();
  }
}

export class AddUsedPointCall__Outputs {
  _call: AddUsedPointCall;

  constructor(call: AddUsedPointCall) {
    this._call = call;
  }
}

export class SetLedgerAddressCall extends ethereum.Call {
  get inputs(): SetLedgerAddressCall__Inputs {
    return new SetLedgerAddressCall__Inputs(this);
  }

  get outputs(): SetLedgerAddressCall__Outputs {
    return new SetLedgerAddressCall__Outputs(this);
  }
}

export class SetLedgerAddressCall__Inputs {
  _call: SetLedgerAddressCall;

  constructor(call: SetLedgerAddressCall) {
    this._call = call;
  }

  get _ledgerAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetLedgerAddressCall__Outputs {
  _call: SetLedgerAddressCall;

  constructor(call: SetLedgerAddressCall) {
    this._call = call;
  }
}
