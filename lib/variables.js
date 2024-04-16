//@ts-ignore
import { get } from "fermyon:spin/variables@2.0.0";
export const Variables = {
    get: (key) => {
        try {
            return get(key);
        }
        catch (e) {
            return null;
        }
    }
};
