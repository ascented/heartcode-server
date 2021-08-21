import * as express from 'express';
import { ErrorResponse } from './typings';


const routeCallback = (target: any, method: string) => {
    return async ({ query }, res) => {
        let methodData = target[`@${method}`];
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
            let request = target[method]({
                data: query,
                response: response => {
                    res.send(JSON.stringify({ response: response }));
                    return response;
                },
                error: error => {
                    res.send(JSON.stringify({ error: error}));
                    return error;
                }
            });
        }
    };
}

export type Request = {
    data: any,
    response: (response: any) => null,
    error: (error: ErrorResponse) => null
};

export class Controller {
    static get router() {
        let router = express.Router();
        let descriptors = Object.getOwnPropertyDescriptors(this);
        let methods = Object.entries(descriptors).map(e => e[0].startsWith('@') ? e[1].value : null).filter(e => e);
        for (let method of methods) {
            router[method.type](method.path, method.callback);
        }
        return router;
    }
}

const initRoute = (target: any, method: string) => {
    target[`@${method}`] = {
        type: null,
        path: null,
        requires: [],
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
        })
    };
}

export const Post = (path: string) => {
    return function (target: any, method: string) {
        let key = `@${method}`;
        if (!target[key]) initRoute(target, method);
        target[key] = Object.assign(target[key], {
            type: 'post',
            path: path
        })
    };
}

export const Requires = (...keys: string[]) => {
    return function (target: any, method: string) {
        let key = `@${method}`;
        if (!target[key]) initRoute(target, method);
        target[key] = Object.assign(target[key], {
            requires: keys
        })
    };
}