import { HandleRequest, HttpRequest, HttpResponse } from "spin-sdk"

const encoder = new TextEncoder()

// Connects as the root user without a password 
const DB_URL = "mysql://root:@127.0.0.1/spin_dev"

/*
 Run the following commands to setup the instance:
 create database spin_dev;
 use spin_dev;
 create table test(id int, val int);
 insert into test values (4,4);
*/

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

    spinSdk.mysql.execute(DB_URL, "delete from test where id=?", [4])
    spinSdk.mysql.execute(DB_URL, "insert into test values (4,5)", [])
    let test = spinSdk.mysql.query(DB_URL, "select * from test", [])

    console.log(test.columns)
    test.rows.map (k => {
        console.log(k)
    })

    return {
        status: 200,
        headers: {"foo": "bar"},
        body: encoder.encode("Hello from JS-SDK").buffer
    }
}
