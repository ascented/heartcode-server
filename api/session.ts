import { Request } from "./controller";

export default class Session {
    public closed = false;
    public listeners = new Array<Request>();

    public close() {
        this.closed = true;
    }

    public addListener(listener: Request) {
        this.listeners.push(listener);
    }

    public async post(data) {
        for (let listener of this.listeners) {
            await listener.response(data);
        }
        return true;
    }
}