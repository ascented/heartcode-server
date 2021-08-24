import { Request } from "../controller";
import dotenv from 'dotenv';


dotenv.config();


export default class Security {
    public static developer(request: Request) {
        if (request.data.developer_key != process.env.DEVELOPER_KEY) {
            request.error({
                code: 'security.restricted',
                message: 'Restricted.'
            })
        }
    };
}