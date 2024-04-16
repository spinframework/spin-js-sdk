//@ts-ignore
import * as spinPg from "fermyon:spin/postgres@2.0.0";
export const Postgres = {
    open: (address) => {
        return spinPg.Connection.open(address);
    }
};
