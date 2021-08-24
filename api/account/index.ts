import { Controller, Get, Post, Requires, Request, Use } from '../controller';
import { AccountModel } from '../models/account';
import { generateToken, hashFrom } from '../crypto';
import Security from '../security';
import { FindOptions } from 'sequelize';
import Session from '../session';


export default class AccountController extends Controller {
    public static signUpSessions = new Map<string, Session>();
    public static authorized = new Map<string, number>(); // <api_token, name>

    /**
     * Проверка на существование сессии.
     */
    private static verifySignUpSession(request: Request) {
        let data = request.data;
        let sessions = AccountController.signUpSessions;
        if (!sessions.has(data.session_key)) {
            return request.error({
                code: 'session.invalid',
                message: 'Invalid session.'
            });
        }
    }
    
    /**
     * Проверка авторизации токена API.
     */
    private static verifyToken(request: Request) {
        if (!AccountController.authorized.get(request.data.api_token)) {
            request.error({
                code: 'token.notAuthorized',
                message: 'Not authorized.'
            });
        }
    }

    /**
     * Поиск по учетным записям.
     */
    private static async select(options: FindOptions<any>): Promise<any | any[]> {
        let query = await AccountModel.findAll(options);
        if (!query.length) {
            return null;
        } else {
            if (query.length > 1) {
                return query;
            } else {
                return query[0];
            }
        }
    }

    /**
     * Работает только с авторизованными пользователями.
     */
    private static async getOwn(request: Request) {
        let account = await AccountController.select({
            where: {
                name: AccountController.authorized.get(request.data.api_token)
            } 
        });
        return account;
    }

    /**
     * Открывает регистрационную сессию.
     */
    @Post('/account/signUp/openSession')
    @Use(Security.developer)
    public static async openSignUpSession(request: Request) {
        let sessionKey = generateToken();
        AccountController.signUpSessions.set(sessionKey, new Session());
        request.response({
            session_key: sessionKey
        });
    }

    /**
     * Вебхук сессии для внешних приложений.
     */
    @Get('/account/signUp/listenSession')
    @Use(AccountController.verifySignUpSession)
    public static async listenSignUpSession(request: Request) {
        let data = request.data;
        let sessions = AccountController.signUpSessions;
        let session = sessions.get(data.session_key)
        session.addListener(request);
        console.log(sessions.get(data.session_key));
    }

    /**
     * Регистрирует нового пользователя в базе.
     */
    @Post('/account/signUp')
    @Use(AccountController.verifySignUpSession)
    @Requires('name', 'password')
    public static async signUp(request: Request) {
        let data = request.data;
        let sessions = AccountController.signUpSessions;
        let session = sessions.get(data.session_key);
        /**
         * Проверка на существования сессии и закрытость потока.
         */
        session.close(); // Закрытие потока
        if (data.name > 64 || !data.name) {
            return request.error({
                code: 'name.badLength',
                message: 'Bad length for name. (3-64 symbols)'
            });
        }
        if (await AccountModel.count({ where: { name: data.name } })) {
            return request.error({
                code: 'name.busy',
                message: 'This name is busy.'
            });
        }
        if (data.password.length < 6 || data.password.length > 512) {
            return request.error({
                code: 'password.badLength',
                message: 'Bad length for password. (6-512 symbols)'
            });
        }
        let token = generateToken();
        await AccountModel.create({
            name: data.name,
            password_hash: hashFrom(data.password),
            api_token: token
        }) as any;
        await session.post({ api_token: token });
        delete sessions[data.session_key];
        return request.response({ success: true });
    }

    /**
     * Возвращает токен API методом формы.
     */
    @Post('/account/login')
    @Requires('name', 'password')
    public static async login(request: Request) {
        let data = request.data;
        let passwordHash = hashFrom(data.password);
        let account = await AccountController.select({ where: { name: data.name } });
        console.log(JSON.stringify(account));
        if (!account) {
            return request.error({
                code: 'name.notExists',
                message: 'This account does not exists.'
            });
        }
        if (account.password_hash != passwordHash) {
            return request.error({
                code: 'password.invalid',
                message: 'Invalid password.'
            });
        }
        AccountController.authorized.set(account.api_token, account.name);
        return request.response({
            api_token: account.api_token
        });
    }

    /**
     * Возвращает информацию об аккаунте.
     */
    @Get('/account')
    @Use(AccountController.verifyToken)
    @Requires('name')
    public static async get(request: Request) {
        let data = request.data;
        let account = await AccountController.select({ where: { name: data.name } });
        if (!account) {
            return request.error({
                code: 'name.notExists',
                message: 'This account does not exists.'
            });
        }
        let { name, balance, rank_points, createdAt } = account;
        return request.response({
            name: name,
            balance: balance,
            rank_points: rank_points,
            created_at: createdAt
        });
    }

    /**
     * Редактирует имя аккаунта.
     */
    @Post('/account/setName')
    @Use(AccountController.verifyToken)
    @Requires('name')
    public static async setName(request: Request) {
        let data = request.data;
        if (data.name > 64 || !data.name) {
            return request.error({
                code: 'name.badLength',
                message: 'Bad length for name. (3-64 symbols)'
            });
        }
        let account = await AccountController.select({ where: { api_token: data.api_token } });
        await account.update({
            name: data.name
        });
        return request.response({ success: true });
    }

    /**
     * Осуществляет перевод валюты.
     */
    @Post('/account/pay')
    @Use(AccountController.verifyToken)
    @Requires('amount', 'name')
    public static async pay(request: Request) {
        let data = request.data;
        let amount = parseInt(data.amount);
        let account = await AccountController.getOwn(request);
        if (!amount || amount < 0 || amount > 2147483647) {
            return request.error({
                code: 'amount.invalid',
                message: 'Bad amount. (only unsigned integers up to 2147483647)'
            });
        }
        if (amount > account.balance) {
            return request.error({
                code: 'amount.outOfBalance',
                message: 'Out of balance.'
            });
        }
        let targetAccount = await AccountController.select({ where: { name: data.name } });
        if (!targetAccount) {
            return request.error({
                code: 'name.notExists',
                message: 'This account does not exists.'
            });
        }
        account.update({
            balance: account.balance - amount
        });
        targetAccount.update({
            balance: targetAccount.balance + amount
        });
        return request.response({ success: true });
    }
}