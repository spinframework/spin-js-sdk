//@ts-ignore
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
   * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
   * @returns {Uint8Array | null} The value associated with the key, or null if the key does not exist.
   */
  get: (key: string) => Uint8Array | null;
  /**
   * Sets the value for the given key.
   * @param {string} key - The key to set the value for.
   * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
   * @param {Uint8Array | string | object} value - The value to set. Can be a Uint8Array, string, or object.
   */
  set: (key: string, value: Uint8Array | string | object) => void;
  /**
   * Deletes the value associated with the given key.
   * @param {string} key - The key to delete the value for.
   * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
   */
  delete: (key: string) => void;
  /**
   * Checks if a key exists in the store.
   * @param {string} key - The key to check.
   * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
   * @returns {boolean} True if the key exists, false otherwise.
   */
  exists: (key: string) => boolean;
  /**
   * Retrieves all the keys in the store.
   * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
   * @returns {string[]} An array of all the keys in the store.
   */
  getKeys: () => string[];
  /**
   * Retrieves the JSON value associated with the given key.
   * @param {string} key - The key to retrieve the JSON value for.
   * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
   * @returns {any} The JSON value associated with the key.
   */
  getJson: (key: string) => any;
  /**
   * Sets the JSON value for the given key.
   * @param {string} key - The key to set the JSON value for.
   * @param {any} value - The JSON value to set.
   * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
   */
  setJson: (key: string, value: any) => void;
}

function createKvStore(store: spinKv.store): Store {
  let kv = {
    get: (key: string) => {
      return store.get(key);
    },
    set: (key: string, value: Uint8Array | string | object) => {
      if (typeof value === 'string') {
        value = encoder.encode(value);
      } else if (typeof value === 'object') {
        value = encoder.encode(JSON.stringify(value));
      }
      store.set(key, value);
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
 * @throws {@link ErrorStoreTableFull} Too many stores have been opened simultaneously. Closing one or more stores prior to retrying may address this.
 * @throws {@link ErrorNoSuchStore} The host does not recognize the store label requested.
 * @throws {@link ErrorAccessDenied} The requesting component does not have access to the specified store (which may or may not exist).
 * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
 * @returns {Store} The key-value store object.
 */
export function open(label: string): Store {
  return createKvStore(spinKv.Store.open(label));
}

/**
 * Opens the default key-value store.
 * @throws {@link ErrorStoreTableFull} Too many stores have been opened simultaneously. Closing one or more stores prior to retrying may address this.
 * @throws {@link ErrorNoSuchStore} The host does not recognize the store label requested.
 * @throws {@link ErrorAccessDenied} The requesting component does not have access to the specified store (which may or may not exist).
 * @throws {@link ErrorOther} Some implementation-specific error has occurred (e.g. I/O).
 * @returns {Store} The default key-value store object.
 */
export function openDefault(): Store {
  return createKvStore(spinKv.Store.open('default'));
}

export interface ErrorStoreTableFull {
  tag: 'store-table-full';
}
export interface ErrorNoSuchStore {
  tag: 'no-such-store';
}
export interface ErrorAccessDenied {
  tag: 'access-denied';
}
export interface ErrorOther {
  tag: 'other';
  val: string;
}
