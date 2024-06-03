import { ResponseBuilder } from './inboundHttp';
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
interface SpinRouteHandler {
    (metadata: IRequest, req: Request, res: ResponseBuilder, ...args: any): any;
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
    all(path: string, ...handlers: SpinRouteHandler[]): RouterType;
    delete(path: string, ...handlers: SpinRouteHandler[]): RouterType;
    get(path: string, ...handlers: SpinRouteHandler[]): RouterType;
    handle(request: RequestLike, ...extras: any): Promise<any>;
    handleRequest(request: Request, response: ResponseBuilder, ...extras: any): Promise<any>;
    options(path: string, ...handlers: SpinRouteHandler[]): RouterType;
    patch(path: string, ...handlers: SpinRouteHandler[]): RouterType;
    post(path: string, ...handlers: SpinRouteHandler[]): RouterType;
    put(path: string, ...handlers: SpinRouteHandler[]): RouterType;
    routes: RouteEntry[];
}
/** @internal */
declare function Router(): routerType;
export { Router, routerType };
