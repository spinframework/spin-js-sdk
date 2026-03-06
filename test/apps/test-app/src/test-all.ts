/**
 * Test runner that calls all test endpoints and returns a summary
 */

const TEST_ENDPOINTS = [
    // Core tests
    '/health',
    '/statusTest',
    '/headersTest',
    '/outboundHttp',
    '/streamTest',
    '/queryParamsTest',
    
    // KV tests
    '/kvTest',
    '/kvTestUint8Array',
    '/kvTestExists',
    '/kvTestDelete',
    '/kvTestGetKeys',
    '/kvTestUpdate',
    '/kvTestLargeValue',
    '/kvTestEmptyValue',
    '/kvTestJson',
    '/kvTestNumeric',
    '/kvTestSpecialChars',
    '/kvTestMultipleBinary',
    '/kvTestKeySpecialChars',
    
    // SQLite tests
    '/sqliteTestInteger',
    '/sqliteTestText',
    '/sqliteTestReal',
    '/sqliteTestNull',
    '/sqliteTestParams',
    
    // Postgres tests
    '/postgresTestInteger',
    '/postgresTestText',
    '/postgresTestBoolean',
    '/postgresTestFloat',
    '/postgresTestNull',
    '/postgresTestParams',
    
    // MySQL tests
    '/mysqlTestInteger',
    '/mysqlTestText',
    '/mysqlTestNull',
    '/mysqlTestParams',
];

interface TestResult {
    endpoint: string;
    passed: boolean;
    status?: number;
    error?: string;
}

export async function testAll() {
    const results: TestResult[] = [];
    
    // Call each test endpoint
    for (const endpoint of TEST_ENDPOINTS) {
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`);
            
            if (response.ok) {
                results.push({
                    endpoint,
                    passed: true,
                    status: response.status
                });
            } else {
                const errorText = await response.text();
                results.push({
                    endpoint,
                    passed: false,
                    status: response.status,
                    error: errorText
                });
            }
        } catch (error) {
            results.push({
                endpoint,
                passed: false,
                error: String(error)
            });
        }
    }
    
    // Calculate summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const success = failed === 0;
    
    // Return JSON response in standard format
    return new Response(
        JSON.stringify({ 
            success,
            appName: 'test-app',
            total: results.length,
            passed,
            failed,
            results
        }, null, 2), 
        { 
            status: success ? 200 : 500,
            headers: { 'Content-Type': 'application/json' } 
        }
    );
}
