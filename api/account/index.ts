import * as express from 'express';
import { Controller, Get, Post, Requires, Request } from "../controller";
import { ErrorResponse } from '../typings';
import { AccountModel } from '../models/account';
import { generateToken } from '../crypto';


export default class AccountController extends Controller {
    /**
     * Регистрирует нового пользователя в базе.
     * @returns User ID, API token
     */
    @Post('/account/signUp')
    @Requires('name')
    public static async signUp(request: Request) {
        if (request.data.name > 64 || !request.data.name) {
            request.error({
                code: 'validation.stringLength',
                message: 'Bad length for name. (3-64 symbols)'
            });
        }
        let instance = await AccountModel.create({
            name: request.data.name,
            api_token: generateToken()
        }) as any;
        request.response({
            id: instance.id,
            api_token: instance.api_token
        });
    }

    /**
     * Генерирует ключ авторизации для синхронизации клиентов.
     * @returns Auth key
     */
    @Get('/account/authKey')
    @Requires('api_token')
    public static async authToken(request: Request) {}

    @Get('/account/data')
    @Requires('api_token')
    public static async data(request: Request) {}

    @Post('/account/name')
    @Requires('name', 'api_token')
    public static async setName(request: Request) {}

    @Post('/account/pay')
    @Requires('amount', 'api_token')
    public static async pay(request: Request) {}
}