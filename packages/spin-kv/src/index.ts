import * as spinKv from 'fermyon:spin/key-value@2.0.0';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Interface representing a key-value store with various utility methods.
 * @interface Store
 */
export interface Store {
  /**
   * Retrieves the value associated with the given key.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Uint8Array | null} The value associated with the key, or null if the key does not exist.
   */
  get: (key: string) => Uint8Array | null;
  /**
   * Sets the value for the given key.
   * @param {string} key - The key to set the value for.
   * @param {Uint8Array | string | object} value - The value to set. Can be a Uint8Array, string, or object.
   */
  set: (key: string, value: Uint8Array | string | object) => void;
  /**
   * Deletes the value associated with the given key.
   * @param {string} key - The key to delete the value for.
   */
  delete: (key: string) => void;
  /**
   * Checks if a key exists in the store.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key exists, false otherwise.
   */
  exists: (key: string) => boolean;
  /**
   * Retrieves all the keys in the store.
   * @returns {string[]} An array of all the keys in the store.
   */
  getKeys: () => string[];
  /**
   * Retrieves the JSON value associated with the given key.
   * @param {string} key - The key to retrieve the JSON value for.
   * @returns {any} The JSON value associated with the key.
   */
  getJson: (key: string) => any;
  /**
   * Sets the JSON value for the given key.
   * @param {string} key - The key to set the JSON value for.
   * @param {any} value - The JSON value to set.
   */
  setJson: (key: string, value: any) => void;
}

function createKvStore(store: spinKv.Store): Store {
  let kv = {
    get: (key: string) => {
      return store.get(key) || null;
    },
    set: (key: string, value: Uint8Array | string | object) => {
      if (!(value instanceof Uint8Array)) {
        if (typeof value === 'string') {
          value = encoder.encode(value);
        } else if (value instanceof ArrayBuffer) {
          value = new Uint8Array(value);
        } else if (typeof value === 'object') {
          value = encoder.encode(JSON.stringify(value));
        }
      }
      store.set(key, value as Uint8Array);
    },
    delete: (key: string) => {
      store.delete(key);
    },
    exists: (key: string) => {
      return store.exists(key);
    },
    getKeys: () => {
      return store.getKeys();
    },
    getJson: (key: string) => {
      return JSON.parse(decoder.decode(store.get(key) || new Uint8Array()));
    },
    setJson: (key: string, value: any) => {
      store.set(key, encoder.encode(JSON.stringify(value)));
    },
  };
  return kv;
}

/**
 * Opens a key-value store with the specified label.
 * @param {string} label - The label of the key-value store to open.
 * @returns {Store} The key-value store object.
 */
export function open(label: string): Store {
  try {
    return createKvStore(spinKv.Store.open(label));
  } catch (error: any) {
    // Wrapping the Spin KV error in a plain JS Error prevents cyclic object issues
    // that occur if the original ComponentError is thrown or spread directly.
    const e = new Error(error);
    (e as any).payload = error.payload ?? { tag: 'unknown', val: String(error) };
    throw e;
  }
}

/**
 * Opens the default key-value store.
 * @returns {Store} The default key-value store object.
 */
export function openDefault(): Store {
  try {
    return createKvStore(spinKv.Store.open('default'));
  } catch (error: any) {
    // Wrapping the Spin KV error in a plain JS Error prevents cyclic object issues
    // that occur if the original ComponentError is thrown or spread directly.
    const e = new Error(error);
    (e as any).payload = error.payload ?? { tag: 'unknown', val: String(error) };
    throw e;
  }
}
