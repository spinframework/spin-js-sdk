//@ts-ignore
import { get as spinGet } from 'fermyon:spin/variables@2.0.0';

/**
 * Gets the value of a variable if it exists, otherwise returns null.
 * @param {string} key - The key of the variable to retrieve.
 * @throws {@link ErrorInvalidName} The provided variable name is invalid.
 * @throws {@link ErrorUndefined} The provided variable is undefined.
 * @throws {@link ErrorProvider} A variables provider specific error has occurred.
 * @throws {@link ErrorOther} Some implementation-specific error has occurred.
 * @returns {string | null} The value of the variable, or null if it does not exist or an error occurs.
 */
export function get(key: string): string | null {
  try {
    return spinGet(key);
  } catch (e) {
    return null;
  }
}

export interface ErrorInvalidName {
  tag: 'invalid-name';
  val: string;
}
export interface ErrorUndefined {
  tag: 'undefined';
  val: string;
}
export interface ErrorProvider {
  tag: 'provider';
  val: string;
}
export interface ErrorOther {
  tag: 'other';
  val: string;
}
