//@ts-ignore
import * as spinMysql from "fermyon:spin/mysql@2.0.0";
export const Mysql = {
    open: (address) => {
        return spinMysql.Connection.open(address);
    }
};
