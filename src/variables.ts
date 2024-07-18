//@ts-ignore
import { get as spinGet } from 'fermyon:spin/variables@2.0.0';

/**
 * Gets the value of a variable if it exists, otherwise returns null.
 * @param {string} key - The key of the variable to retrieve.
 * @returns {string | null} The value of the variable, or null if it does not exist or an error occurs.
 */
export function get(key: string): string | null {
  try {
    return spinGet(key);
  } catch (e) {
    return null;
  }
}
