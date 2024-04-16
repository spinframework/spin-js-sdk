//@ts-ignore
import * as spinSqlite from "fermyon:spin/sqlite@2.0.0";
export const Sqlite = {
    open: (label) => {
        return spinSqlite.Connection.open(label);
    },
    openDefault: () => {
        return spinSqlite.Connection.open("default");
    }
};
export const valueInteger = (value) => {
    return { tag: "integer", val: value };
};
export const valueReal = (value) => {
    return { tag: "real", val: value };
};
export const valueText = (value) => {
    return { tag: "text", val: value };
};
export const valueBlob = (value) => {
    return { tag: "blob", val: value };
};
export const valueNull = () => {
    return { tag: "null" };
};
