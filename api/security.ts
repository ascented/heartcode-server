import { Request } from "./controller";


export default class Security {
    public static developer(request: Request) {
        if (request.data.developer_key != 'ascent') {
            request.error({
                code: 'security.restricted',
                message: 'Restricted.'
            })
        }
    };
}