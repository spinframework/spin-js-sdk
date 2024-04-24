/** @internal */
import { Router as _router } from 'itty-router';
/** @internal */
function Router() {
    let _spinRouter = _router();
    return {
        all: function (path, ...handlers) { return _spinRouter.all(path, ...handlers); },
        delete: function (path, ...handlers) { return _spinRouter.delete(path, ...handlers); },
        get: function (path, ...handlers) { return _spinRouter.get(path, ...handlers); },
        handle: function (request, ...extra) { return _spinRouter.handle(request, ...extra); },
        handleRequest: function (request, ...a) {
            return _spinRouter.handle({
                method: request.method,
                url: request.headers.get("spin-full-url") || ""
            }, ...a);
        },
        options: function (path, ...handlers) { return _spinRouter.options(path, ...handlers); },
        patch: function (path, ...handlers) { return _spinRouter.patch(path, ...handlers); },
        post: function (path, ...handlers) { return _spinRouter.post(path, ...handlers); },
        put: function (path, ...handlers) { return _spinRouter.put(path, ...handlers); },
        routes: _spinRouter.routes
    };
}
export { Router };
