import { RdbmsParameterValue, SpinRdbmsParameterValue } from './types/rdbms';

export function convertRdbmsToWitTypes(
  parameters: RdbmsParameterValue[],
): SpinRdbmsParameterValue[] {
  let sanitized: SpinRdbmsParameterValue[] = [];
  for (let k of parameters) {
    if (typeof k === 'object') {
      sanitized.push(k as SpinRdbmsParameterValue);
      continue;
    }
    if (typeof k === 'string') {
      sanitized.push({ tag: 'str', val: k });
      continue;
    }
    if (typeof k === null) {
      sanitized.push({ tag: 'db-null' });
      continue;
    }
    if (typeof k === 'boolean') {
      sanitized.push({ tag: 'boolean', val: k });
      continue;
    }
    if (typeof k === 'bigint') {
      sanitized.push({ tag: 'int64', val: k });
      continue;
    }
    if (typeof k === 'number') {
      isFloat(k)
        ? sanitized.push({ tag: 'floating64', val: k })
        : sanitized.push({ tag: 'int32', val: k });
      continue;
    }
    if ((k as any) instanceof Uint8Array) {
      sanitized.push({ tag: 'binary', val: k });
      continue;
    }
  }
  return sanitized;
}

function isFloat(number: number) {
  return number % 1 !== 0;
}
