import { AutoRouter } from "itty-router"
import { headersTest, health, outboundHttp, statusTest, stream, streamTest, queryParamsTest } from "./core.test";
import { 
    kvTest, 
    kvTestUint8Array, 
    kvTestExists, 
    kvTestDelete, 
    kvTestGetKeys, 
    kvTestUpdate, 
    kvTestLargeValue, 
    kvTestEmptyValue,
    kvTestJson,
    kvTestNumeric,
    kvTestSpecialChars,
    kvTestMultipleBinary,
    kvTestKeySpecialChars
} from "./kv.test";
import { 
    sqliteTestInteger,
    sqliteTestText,
    sqliteTestReal,
    sqliteTestNull,
    sqliteTestParams
} from "./sqlite.test";
import { 
    postgresTestInteger,
    postgresTestText,
    postgresTestBoolean,
    postgresTestFloat,
    postgresTestNull,
    postgresTestParams
} from "./postgres.test";
import { 
    mysqlTestInteger,
    mysqlTestText,
    mysqlTestNull,
    mysqlTestParams
} from "./mysql.test";
import { testAll } from "./test-all";


let router = AutoRouter()

// Test runner endpoint
router.get("/testAll", testAll)

// Core tests
router.get("/health", health)
router.get("/stream", stream)
router.get("/statusTest", statusTest)
router.get("/headersTest", headersTest)
router.get("/outboundHttp", outboundHttp)
router.get("/streamTest", streamTest)
router.get("/queryParamsTest", queryParamsTest)

// KV tests
router.get("/kvTest", kvTest)
router.get("/kvTestUint8Array", kvTestUint8Array)
router.get("/kvTestExists", kvTestExists)
router.get("/kvTestDelete", kvTestDelete)
router.get("/kvTestGetKeys", kvTestGetKeys)
router.get("/kvTestUpdate", kvTestUpdate)
router.get("/kvTestLargeValue", kvTestLargeValue)
router.get("/kvTestEmptyValue", kvTestEmptyValue)
router.get("/kvTestJson", kvTestJson)
router.get("/kvTestNumeric", kvTestNumeric)
router.get("/kvTestSpecialChars", kvTestSpecialChars)
router.get("/kvTestMultipleBinary", kvTestMultipleBinary)
router.get("/kvTestKeySpecialChars", kvTestKeySpecialChars)

// SQLite tests
router.get("/sqliteTestInteger", sqliteTestInteger)
router.get("/sqliteTestText", sqliteTestText)
router.get("/sqliteTestReal", sqliteTestReal)
router.get("/sqliteTestNull", sqliteTestNull)
router.get("/sqliteTestParams", sqliteTestParams)

// Postgres tests
router.get("/postgresTestInteger", postgresTestInteger)
router.get("/postgresTestText", postgresTestText)
router.get("/postgresTestBoolean", postgresTestBoolean)
router.get("/postgresTestFloat", postgresTestFloat)
router.get("/postgresTestNull", postgresTestNull)
router.get("/postgresTestParams", postgresTestParams)

// MySQL tests
router.get("/mysqlTestInteger", mysqlTestInteger)
router.get("/mysqlTestText", mysqlTestText)
router.get("/mysqlTestNull", mysqlTestNull)
router.get("/mysqlTestParams", mysqlTestParams)

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});