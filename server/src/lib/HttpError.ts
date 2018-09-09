export class HttpError extends Error
{
    httpCode: number;

    constructor(httpCode: number, msg: string)
    {
        super(msg);

        this.httpCode = httpCode;
    }
}
