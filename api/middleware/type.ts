import { Request } from "../controller";


export default class Type {
    public static number(field: string) {
        return function(request: Request) {
            let value = request.data[field];
            if (!Number(value)) {
                return request.error({
                    code: `${field}.notANumber`,
                    message: `Field "${field}" must be a number.`
                });
            }
            return true;
        }
    }

    public static integer(field: string) {
        return function(request: Request) {
            let value = parseInt(request.data[field]);
            if (!value || value < -2147483648 || value > 2147483647) {
                return request.error({
                    code: `${field}.notAnInteger`,
                    message: `Field "${field}" must be an integer.`
                });
            }
        }
    }

    public static bigint(field: string) {
        return function(request: Request) {
            let value = parseInt(request.data[field]);
            if (!value || value < -9223372036854775808  || value > 9223372036854775807) {
                return request.error({
                    code: `${field}.notABigInteger`,
                    message: `Field "${field}" must be a big integer.`
                });
            }
        }
    }

    public static stringLetters(field: string) {
        return function(request: Request) {
            let value = request.data[field] + '';
            let regexp = new RegExp('^[a-zA-Zа-яА-Я]+$');
            if (!regexp.test(value)) {
                return request.error({
                    code: `${field}.forbiddenSymbols`,
                    message: `Field "${field}" must contain only letters.`
                });
            }
        }
    }

    public static stringLettersAndNumbers(field: string) {
        return function(request: Request) {
            let value = request.data[field] + '';
            let regexp = new RegExp('^[a-zA-Zа-яА-Я0-9]+$');
            if (!regexp.test(value)) {
                return request.error({
                    code: `${field}.forbiddenSymbols`,
                    message: `Field "${field}" must contain only letters and numbers.`
                });
            }
        }
    }

    public static stringLength(field: string, minLength: number, maxLength: number) {
        return function(request: Request) {
            let value = request.data[field] + '';
            minLength ||= 0;
            maxLength ||= 0;
            if (value.length < minLength || value.length > (maxLength || value.length)) {
                return request.error({
                    code: `${field}.invalidLength`,
                    message: `Length of "${field}" field must be from${minLength}${maxLength ? ` to ${maxLength}` : ''} symbols.`
                });
            }
        }
    }
}