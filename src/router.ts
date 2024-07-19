import { Router as _router } from 'itty-router';
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
declare type Route = <T extends RouterType>(
  path: string,
  ...handlers: RouteHandler[]
) => T;
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
  handleRequest(
    request: Request,
    response: ResponseBuilder,
    ...extras: any
  ): Promise<any>;
  options(path: string, ...handlers: SpinRouteHandler[]): RouterType;
  patch(path: string, ...handlers: SpinRouteHandler[]): RouterType;
  post(path: string, ...handlers: SpinRouteHandler[]): RouterType;
  put(path: string, ...handlers: SpinRouteHandler[]): RouterType;
  routes: RouteEntry[];
}

/**
 * Creates a new router instance.
 * @returns {routerType} The router instance.
 */
function Router(): routerType {
  let _spinRouter = _router();

  return {
    all: function (path: string, ...handlers: SpinRouteHandler[]): RouterType {
      return _spinRouter.all(path, ...wrapRouteHandler(handlers));
    },
    delete: function (
      path: string,
      ...handlers: SpinRouteHandler[]
    ): RouterType {
      return _spinRouter.delete(path, ...wrapRouteHandler(handlers));
    },
    get: function (path: string, ...handlers: SpinRouteHandler[]): RouterType {
      return _spinRouter.get(path, ...wrapRouteHandler(handlers));
    },
    handle: function (request: RequestLike, ...extra: any): Promise<any> {
      return _spinRouter.handle(request, ...extra);
    },
    handleRequest: function (
      request: Request,
      response: ResponseBuilder,
      ...a: any
    ): Promise<any> {
      return _spinRouter.handle(
        {
          method: request.method,
          url: request.headers.get('spin-full-url') || '',
        },
        request,
        response,
        ...a,
      );
    },
    options: function (
      path: string,
      ...handlers: SpinRouteHandler[]
    ): RouterType {
      return _spinRouter.options(path, ...wrapRouteHandler(handlers));
    },
    patch: function (
      path: string,
      ...handlers: SpinRouteHandler[]
    ): RouterType {
      return _spinRouter.patch(path, ...wrapRouteHandler(handlers));
    },
    post: function (path: string, ...handlers: SpinRouteHandler[]): RouterType {
      return _spinRouter.post(path, ...wrapRouteHandler(handlers));
    },
    put: function (path: string, ...handlers: SpinRouteHandler[]): RouterType {
      return _spinRouter.put(path, ...wrapRouteHandler(handlers));
    },
    routes: _spinRouter.routes,
  };
}

function wrapRouteHandler(handlers: SpinRouteHandler[]): RouteHandler[] {
  let h: RouteHandler[] = [];
  for (let handler of handlers) {
    let fn = async (
      metadata: IRequest,
      req: Request,
      res: ResponseBuilder,
      ...args: any
    ) => {
      return handler(metadata, req, res, args);
    };
    h.push(fn);
  }
  return h;
}

export { Router, routerType };
