import * as Kv from "@spinframework/spin-kv";
import { isEqualBytes } from "./helpers";

const decoder = new TextDecoder();

/**
 * Basic KV test - set and get string value
 */
export function kvTest(req: Request) {
    try {
        const store = Kv.openDefault();
        store.set("test", "try");
        
        const value = store.get("test");
        if (decoder.decode(value || new Uint8Array()) === "try") {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: value mismatch", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test with Uint8Array - binary data handling
 */
export function kvTestUint8Array(req: Request) {
    try {
        const store = Kv.openDefault();
        const arr = new Uint8Array([1, 2, 3]);
        store.set("arr", arr);
        
        const ret = store.get("arr");
        if (ret == null || !isEqualBytes(ret, arr)) {
            return new Response("failed: array mismatch", { status: 500 });
        }
        return new Response("success", { status: 200 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test - check if key exists
 */
export function kvTestExists(req: Request) {
    try {
        const store = Kv.openDefault();
        store.set("exists-test", "value");
        
        if (store.exists("exists-test") && !store.exists("non-existent-key")) {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: exists check failed", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test - delete key
 */
export function kvTestDelete(req: Request) {
    try {
        const store = Kv.openDefault();
        store.set("delete-test", "value");
        
        if (!store.exists("delete-test")) {
            return new Response("failed: key should exist before delete", { status: 500 });
        }
        
        store.delete("delete-test");
        
        if (store.exists("delete-test")) {
            return new Response("failed: key should not exist after delete", { status: 500 });
        }
        
        return new Response("success", { status: 200 });
    } catch (error) {
        //@ts-ignore
        return new Response(`failed: ${error}: ${JSON.stringify(error.payload)}`, { status: 500 });
    }
}

/**
 * KV test - get keys with prefix
 */
export function kvTestGetKeys(req: Request) {
    try {
        const store = Kv.openDefault();
        
        // Set up test data
        store.set("prefix:key1", "value1");
        store.set("prefix:key2", "value2");
        store.set("prefix:key3", "value3");
        store.set("other:key", "value");
        
        const keys = store.getKeys();
        const prefixKeys = keys.filter(k => k.startsWith("prefix:"));
        
        if (prefixKeys.length >= 3) {
            return new Response("success", { status: 200 });
        }
        return new Response(`failed: expected at least 3 keys with prefix, got ${prefixKeys.length}`, { status: 500 });
    } catch (error) {
        //@ts-ignore
        return new Response(`failed: ${error}: ${error.payload}`, { status: 500 });
    }
}

/**
 * KV test - update existing value
 */
export function kvTestUpdate(req: Request) {
    try {
        const store = Kv.openDefault();
        store.set("update-test", "initial");
        
        let value = store.get("update-test");
        if (decoder.decode(value || new Uint8Array()) !== "initial") {
            return new Response("failed: initial value mismatch", { status: 500 });
        }
        
        store.set("update-test", "updated");
        value = store.get("update-test");
        
        if (decoder.decode(value || new Uint8Array()) !== "updated") {
            return new Response("failed: updated value mismatch", { status: 500 });
        }
        
        return new Response("success", { status: 200 });
    } catch (error) {
        //@ts-ignore
        return new Response(`failed: ${error}: ${JSON.stringify(error.payload)}`, { status: 500 });
    }
}

/**
 * KV test - handle large values
 */
export function kvTestLargeValue(req: Request) {
    try {
        const store = Kv.openDefault();
        const largeString = "x".repeat(10000); // 10KB string
        store.set("large-value", largeString);
        
        const value = store.get("large-value");
        const retrieved = decoder.decode(value || new Uint8Array());
        
        if (retrieved === largeString && retrieved.length === 10000) {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: large value mismatch", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test - empty value
 */
export function kvTestEmptyValue(req: Request) {
    try {
        const store = Kv.openDefault();
        store.set("empty-test", "");
        
        const value = store.get("empty-test");
        const retrieved = decoder.decode(value || new Uint8Array());
        
        if (retrieved === "") {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: empty value test failed", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test - JSON data
 */
export function kvTestJson(req: Request) {
    try {
        const store = Kv.openDefault();
        const jsonData = { name: "test", age: 25, active: true, tags: ["a", "b"] };
        const jsonString = JSON.stringify(jsonData);
        
        store.set("json-test", jsonString);
        const value = store.get("json-test");
        const retrieved = decoder.decode(value || new Uint8Array());
        const parsed = JSON.parse(retrieved);
        
        if (parsed.name === "test" && parsed.age === 25 && parsed.active === true) {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: JSON data mismatch", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test - numeric values as strings
 */
export function kvTestNumeric(req: Request) {
    try {
        const store = Kv.openDefault();
        store.set("number-test", "12345");
        
        const value = store.get("number-test");
        const retrieved = decoder.decode(value || new Uint8Array());
        const number = parseInt(retrieved, 10);
        
        if (number === 12345) {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: numeric value mismatch", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test - special characters and unicode
 */
export function kvTestSpecialChars(req: Request) {
    try {
        const store = Kv.openDefault();
        const specialString = "Hello 世界! 🚀 @#$%^&*()";
        store.set("special-chars", specialString);
        
        const value = store.get("special-chars");
        const retrieved = decoder.decode(value || new Uint8Array());
        
        if (retrieved === specialString) {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: special characters mismatch", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test - multiple binary arrays
 */
export function kvTestMultipleBinary(req: Request) {
    try {
        const store = Kv.openDefault();
        const arr1 = new Uint8Array([0, 1, 2, 3, 4]);
        const arr2 = new Uint8Array([255, 254, 253, 252, 251]);
        const arr3 = new Uint8Array([128, 64, 32, 16, 8]);
        
        store.set("binary1", arr1);
        store.set("binary2", arr2);
        store.set("binary3", arr3);
        
        const ret1 = store.get("binary1");
        const ret2 = store.get("binary2");
        const ret3 = store.get("binary3");
        
        if (ret1 && ret2 && ret3 &&
            isEqualBytes(ret1, arr1) &&
            isEqualBytes(ret2, arr2) &&
            isEqualBytes(ret3, arr3)) {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: binary arrays mismatch", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}

/**
 * KV test - key with special characters
 */
export function kvTestKeySpecialChars(req: Request) {
    try {
        const store = Kv.openDefault();
        const specialKey = "key:with:colons-and-dashes_and_underscores";
        store.set(specialKey, "special key value");
        
        const value = store.get(specialKey);
        const retrieved = decoder.decode(value || new Uint8Array());
        
        if (store.exists(specialKey) && retrieved === "special key value") {
            return new Response("success", { status: 200 });
        }
        return new Response("failed: special key test failed", { status: 500 });
    } catch (error) {
        return new Response(`failed: ${error}`, { status: 500 });
    }
}
