export type RdbmsValueBoolean = { tag: 'boolean'; val: boolean };
export type RdbmsValueInt8 = { tag: 'int8'; val: number };
export type RdbmsValueInt16 = { tag: 'int16'; val: number };
export type RdbmsValueInt32 = { tag: 'int32'; val: number };
export type RdbmsValueInt64 = { tag: 'int64'; val: bigint };
export type RdbmsValueUint8 = { tag: 'uint8'; val: number };
export type RdbmsValueUint16 = { tag: 'uint16'; val: number };
export type RdbmsValueUint32 = { tag: 'uint32'; val: number };
export type RdbmsValueUint64 = { tag: 'uint64'; val: bigint };
export type RdbmsValueFloating32 = { tag: 'floating32'; val: number };
export type RdbmsValueFloating64 = { tag: 'floating64'; val: number };
export type RdbmsValueStr = { tag: 'str'; val: string };
export type RdbmsValueBinary = { tag: 'binary'; val: Uint8Array };
export type RdbmsValueDbNull = { tag: 'db-null' };

export type SpinRdbmsParameterValue =
  | RdbmsValueBoolean
  | RdbmsValueInt8
  | RdbmsValueInt16
  | RdbmsValueInt32
  | RdbmsValueInt64
  | RdbmsValueUint8
  | RdbmsValueUint16
  | RdbmsValueUint32
  | RdbmsValueUint64
  | RdbmsValueFloating32
  | RdbmsValueFloating64
  | RdbmsValueStr
  | RdbmsValueBinary
  | RdbmsValueDbNull;

export type RdbmsParameterValue =
  | SpinRdbmsParameterValue
  | number
  | bigint
  | boolean
  | null
  | Uint8Array
  | string;

export interface RdbmsColumn {
  name: string;
  dataType: RdbmsDataType[];
}

export type RdbmsRow = RdbmsDbValue[];

export interface SpinRdbmsRowSet {
  columns: RdbmsColumn[];
  rows: RdbmsRow[];
}

export interface RdbmsRowSet {
  columns: RdbmsColumn[];
  rows: {
    [key: string]: number | boolean | bigint | null | string | Uint8Array;
  }[];
}

export type RdbmsDbBoolean = { tag: 'boolean'; val: boolean };
export type RdbmsDbInt8 = { tag: 'int8'; val: number };
export type RdbmsDbInt16 = { tag: 'int16'; val: number };
export type RdbmsDbInt32 = { tag: 'int32'; val: number };
export type RdbmsDbInt64 = { tag: 'int64'; val: number };
export type RdbmsDbUint8 = { tag: 'uint8'; val: number };
export type RdbmsDbUint16 = { tag: 'uint16'; val: number };
export type RdbmsDbUint32 = { tag: 'uint32'; val: number };
export type RdbmsDbUint64 = { tag: 'uint64'; val: number };
export type RdbmsDbFloating32 = { tag: 'floating32'; val: number };
export type RdbmsDbFloating64 = { tag: 'floating64'; val: number };
export type RdbmsDbStr = { tag: 'str'; val: string };
export type RdbmsDbBinary = { tag: 'binary'; val: Uint8Array };
export type RdbmsDbNull = { tag: 'db-null' };
export type RdbmsDbUnsupported = { tag: 'unsupported' };

export type RdbmsDbValue =
  | RdbmsDbBoolean
  | RdbmsDbInt8
  | RdbmsDbInt16
  | RdbmsDbInt32
  | RdbmsDbInt64
  | RdbmsDbUint8
  | RdbmsDbUint16
  | RdbmsDbUint32
  | RdbmsDbUint64
  | RdbmsDbFloating32
  | RdbmsDbFloating64
  | RdbmsDbStr
  | RdbmsDbBinary
  | RdbmsDbNull
  | RdbmsDbUnsupported;

export enum RdbmsDataType {
  RdbmsBoolean = 'boolean',
  RdbmsInt8 = 'int8',
  RdbmsInt16 = 'int16',
  RdbmsInt32 = 'int32',
  RdbmsInt64 = 'int64',
  RdbmsUint8 = 'uint8',
  RdbmsUint16 = 'uint16',
  RdbmsUint32 = 'uint32',
  RdbmsUint64 = 'uint64',
  RdbmsFloating32 = 'floating32',
  RdbmsFloating64 = 'floating64',
  RdbmsStr = 'str',
  RdbmsBinary = 'binary',
  RdbmsOther = 'other',
}
