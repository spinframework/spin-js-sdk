import { router } from "./router";
import { utils } from "./utils";
/**
 * Sdk module that provides access to spin features
 */
const spinSdk = __internal__.spin_sdk;
spinSdk.utils = utils;
spinSdk.Router = () => {
    return router();
};
export { spinSdk };
