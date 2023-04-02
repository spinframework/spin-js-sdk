import { router } from "./router";
import { utils } from "./utils";
const spinSdk = __internal__.spin_sdk;
spinSdk.utils = utils;
spinSdk.Router = () => {
    return router();
};
export { spinSdk };
