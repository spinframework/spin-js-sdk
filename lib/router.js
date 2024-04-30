import { Router as _router } from 'itty-router';
/** @internal */
function Router() {
    let _spinRouter = _router();
    return {
        all: function (path, ...handlers) { return _spinRouter.all(path, ...wrapRouteHandler(handlers)); },
        delete: function (path, ...handlers) { return _spinRouter.delete(path, ...wrapRouteHandler(handlers)); },
        get: function (path, ...handlers) { return _spinRouter.get(path, ...wrapRouteHandler(handlers)); },
        handle: function (request, ...extra) { return _spinRouter.handle(request, ...extra); },
        handleRequest: function (request, response, ...a) {
            return _spinRouter.handle({
                method: request.method,
                url: request.headers.get("spin-full-url") || ""
            }, request, response, ...a);
        },
        options: function (path, ...handlers) { return _spinRouter.options(path, ...wrapRouteHandler(handlers)); },
        patch: function (path, ...handlers) { return _spinRouter.patch(path, ...wrapRouteHandler(handlers)); },
        post: function (path, ...handlers) { return _spinRouter.post(path, ...wrapRouteHandler(handlers)); },
        put: function (path, ...handlers) { return _spinRouter.put(path, ...wrapRouteHandler(handlers)); },
        routes: _spinRouter.routes
    };
}
function wrapRouteHandler(handlers) {
    let h = [];
    for (let handler of handlers) {
        let fn = async (metadata, req, res, ...args) => {
            return handler(metadata, req, res, args);
        };
        h.push(fn);
    }
    return h;
}
export { Router };
