import * as express from 'express';
import { Controller, Get, Post, Requires, Request } from "../controller";
import { ErrorResponse } from '../typings';


export default class AccountController extends Controller {
    @Post('/account/signUp')
    @Requires('name', 'key')
    public static async signUp(request: Request) {}

    @Post('/account/auth')
    @Requires('auth_token')
    public static async auth(request: Request) {}

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