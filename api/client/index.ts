import * as express from 'express';
import { Controller, Request, Get, Post, Requires } from "../controller";


export default class ClientController extends Controller {
    @Post('/client/register')
    @Requires('type', 'uid', 'key')
    public static async register(request: Request) {}

    @Post('/client/auth')
    @Requires('uid', 'api_token', 'key')
    public static async auth(request: Request) {}

    @Get('/client/token')
    @Requires('uid', 'key')
    public static async token(request: Request) {}
}