import { HandleRequest, HttpRequest, HttpResponse, Pg } from "@fermyon/spin-sdk"

const encoder = new TextEncoder()

const DB_URL = "host=localhost user=postgres dbname=spin_dev"

/*
 Run the following commands to setup the mysql instance:
 create database spin_dev;
 \c spin_dev;
 create table test(id int, val int);
 insert into test values (4,4);
*/

export const handleRequest: HandleRequest = async function (request: HttpRequest): Promise<HttpResponse> {

    Pg.execute(DB_URL, "delete from test where id=4", [])
    Pg.execute(DB_URL, "insert into test values (4,5)", [])
    let test = Pg.query(DB_URL, "select * from test", [])

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
