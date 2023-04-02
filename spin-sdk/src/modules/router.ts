/** @internal */
import { Router as _router } from 'itty-router'
import { HttpRequest } from './handlerFunction'

declare type GenericTraps = {
    [key: string]: any;
};

export declare type RequestLike = {
    method: string;
    url: string;
} & GenericTraps;

declare type IRequest = {
    method: string;
    url: string;
    params: {
        [key: string]: string;
    };
    query: {
        [key: string]: string | string[] | undefined;
    };
    proxy?: any;
} & GenericTraps;

interface RouteHandler {
    (request: IRequest, ...args: any): any;
}

declare type RouteEntry = [string, RegExp, RouteHandler[]];
declare type Route = <T extends RouterType>(path: string, ...handlers: RouteHandler[]) => T;
declare type RouterHints = {
    all: Route;
    delete: Route;
    get: Route;
    options: Route;
    patch: Route;
    post: Route;
    put: Route;
};
declare type RouterType = {
    __proto__: RouterType;
    routes: RouteEntry[];
    handle: (request: RequestLike, ...extra: any) => Promise<any>;
} & RouterHints;

interface routerType {
    all(path: string, ...handlers: RouteHandler[]): RouterType 
    delete(path: string, ...handlers: RouteHandler[]): RouterType 
    get(path: string, ...handlers: RouteHandler[]): RouterType 
    handle(request: RequestLike, ...extras: any): Promise<any>
    handleRequest(request: HttpRequest, ...extras: any): Promise<any>
    options(path: string, ...handlers: RouteHandler[]): RouterType 
    patch(path: string, ...handlers: RouteHandler[]): RouterType 
    post(path: string, ...handlers: RouteHandler[]): RouterType 
    put(path: string, ...handlers: RouteHandler[]): RouterType 
    routes: RouteEntry[]
}

/** @internal */
function router(): routerType {
    let _spinRouter = _router()

    return {
        all: function (path: string, ...handlers: RouteHandler[]): RouterType { return _spinRouter.all(path, ...handlers) },
        delete: function (path: string, ...handlers: RouteHandler[]): RouterType { return _spinRouter.delete(path, ...handlers) },
        get: function (path: string, ...handlers: RouteHandler[]): RouterType { return _spinRouter.get(path, ...handlers) },
        handle:function (request: RequestLike, ...extra: any): Promise<any> { return _spinRouter.handle(request, ...extra) },
        handleRequest: function (request: HttpRequest, ...a: any): Promise<any> {
            return _spinRouter.handle({
                method: request.method,
                url: request.headers["spin-full-url"]
            }, ...a)
        },
        options: function (path: string, ...handlers: RouteHandler[]): RouterType { return _spinRouter.options(path, ...handlers) },
        patch: function (path: string, ...handlers: RouteHandler[]): RouterType { return _spinRouter.patch(path, ...handlers) },
        post: function (path: string, ...handlers: RouteHandler[]): RouterType { return _spinRouter.post(path, ...handlers) },
        put: function (path: string, ...handlers: RouteHandler[]): RouterType { return _spinRouter.put(path, ...handlers) },
        routes: _spinRouter.routes
    }
}

export { router, routerType }