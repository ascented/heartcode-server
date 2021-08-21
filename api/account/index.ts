import * as express from 'express';
import { Controller, Get, Post, Requires, Request } from '../controller';
import { ErrorResponse } from '../typings';
import { AccountModel } from '../models/account';
import { generateToken, hashFrom } from '../crypto';


export default class AccountController extends Controller {
    public static signUpSessions = new Map<string, boolean>();
    public static logged = new Map<string, number>(); // <api_token, id>

    private static verifyToken(request: Request) {
        if (!AccountController.logged.get(request.data.api_token)) {
            request.error({
                code: 'auth.notAuthorized',
                message: 'Not authorized.'
            });
            return false;
        }
        return true;
    }

    @Post('/account/signUp/openSession')
    @Requires('developer_key')
    public static async openSignUpSession(request: Request) {
        let sessionKey = generateToken();
        AccountController.signUpSessions.set(sessionKey, false);
        request.response({
            session_key: sessionKey
        });
    }

    /**
     * Регистрирует нового пользователя в базе.
     */
    @Post('/account/signUp')
    @Requires('name', 'password', 'session_key')
    public static async signUp(request: Request) {
        let data = request.data;
        let sessions = AccountController.signUpSessions;
        /**
         * Проверка на существования сессии и закрытость потока.
         */
        if (!sessions.has(data.session_key) || sessions.get(data.session_key)) {
            return request.error({
                code: 'signUp.invalidSession',
                message: 'Invalid session.'
            });
        }
        sessions[data.session_key] = true; // Закрытие потока
        if (data.name > 64 || !data.name) {
            return request.error({
                code: 'validation.stringLength',
                message: 'Bad length for name. (3-64 symbols)'
            });
        }
        if (await AccountModel.count({ where: { name: data.name } })) {
            return request.error({
                code: 'signUp.busyName',
                message: 'This name is busy.'
            });
        }
        if (data.password.length < 6 || data.password.length > 512) {
            return request.error({
                code: 'validation.passwordLength',
                message: 'Bad length for password. (6-512 symbols)'
            });
        }
        delete sessions[data.session_key]; // Удаление сессии
        await AccountModel.create({
            name: data.name,
            password_hash: hashFrom(data.password),
            api_token: generateToken()
        }) as any;
        return request.response({ success: true });
    }

    @Post('/account/login')
    @Requires('name', 'password')
    public static async login(request: Request) {
        let data = request.data;
        let passwordHash = hashFrom(data.password);
        let accountQuery = await AccountModel.findAll({ where: { name: data.name } });
        let account = accountQuery[0] as any;
        if (!account) {
            return request.error({
                code: 'login.notExists',
                message: 'This account does not exists.'
            });
        }
        if (account.password_hash != passwordHash) {
            return request.error({
                code: 'login.badPassword',
                message: 'Bad password.'
            });
        }
        AccountController.logged.set(account.api_token, account.id);
        return request.response({
            api_token: account.api_token
        });
    }

    @Post('/account/setName')
    @Requires('name', 'api_token')
    public static async setName(request: Request) {
        let data = request.data;
        if (!AccountController.verifyToken(request)) return;
        if (data.name > 64 || !data.name) {
            return request.error({
                code: 'validation.stringLength',
                message: 'Bad length for name. (3-64 symbols)'
            });
        }
        let accountQuery = await AccountModel.findAll({ where: { api_token: data.api_token } });
        let account = accountQuery[0] as any;
        await account.update({
            name: data.name
        });
        return request.response({ success: true });
    }

    @Post('/account/pay')
    @Requires('amount', 'api_token')
    public static async pay(request: Request) {}
}