import * as express from 'express';
import { ErrorResponse } from './typings';


const routeCallback = (target: any, method: string) => {
    return async ({ query }, res) => {
        let methodData = target[`@${method}`] as Route;
        let queryKeys = Object.keys(query);
        let missingParameters = methodData.requires.filter(e => !queryKeys.includes(e));
        if (missingParameters.length) {
            res.send({
                error: {
                    code: 'query.missingParameters',
                    message: `Missing required parameters. (${missingParameters.join(', ')})`
                }
            });
        } else {
            let request = {
                closed: false,
                data: query,
                response: response => {
                    if (request.closed) return;
                    res.send(JSON.stringify({ response: response }));
                    request.closed = true;
                    return response;
                },
                error: error => {
                    if (request.closed) return;
                    res.send(JSON.stringify({ error: error }));
                    request.closed = true;
                    return error;
                }
            };
            for (let method of methodData.use) {
                if (request.closed) return;
                await method(request);
            }
            target[method](request);
        }
    };
}

type Route = {
    type: string,
    path: string,
    requires: string[],
    use: Function[],
    callback: (target, method) => null
};

export type Request = {
    data: any,
    response: (response: any) => null,
    error: (error: ErrorResponse) => null
};

export class Controller {
    static get bind() {
        let router = express.Router() as any;
        let descriptors = Object.getOwnPropertyDescriptors(this);
        let routes = Object.entries(descriptors).map(e => e[0].startsWith('@') ? e[1].value : null).filter(e => e);
        for (let route of routes) {
            router[route.type](route.path, route.callback);
        }
        return router;
    }
}

const initRoute = (target: any, method: string) => {
    target[`@${method}`] = {
        type: null,
        path: null,
        requires: [],
        use: [],
        callback: routeCallback(target, method)
    };
}

export const Get = (path: string) => {
    return function (target: any, method: string) {
        let key = `@${method}`;
        if (!target[key]) initRoute(target, method);
        target[key] = Object.assign(target[key], {
            type: 'get',
            path: path
        });
    };
}

export const Post = (path: string) => {
    return function (target: any, method: string) {
        let key = `@${method}`;
        if (!target[key]) initRoute(target, method);
        target[key] = Object.assign(target[key], {
            type: 'post',
            path: path
        });
    };
}

export const Requires = (...keys: string[]) => {
    return function (target: any, method: string) {
        let key = `@${method}`;
        if (!target[key]) initRoute(target, method);
        target[key] = Object.assign(target[key], {
            requires: keys
        });
    };
}

export const Use = (...externalMethods: Function[]) => {
    return function (target: any, method: string) {
        let key = `@${method}`;
        if (!target[key]) initRoute(target, method);
        target[key] = Object.assign(target[key], {
            use: target[key].use.concat(externalMethods)
        });
    };
}