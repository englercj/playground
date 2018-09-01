export type THttpCallback<T> = (err: Error, data?: T) => void;

function sendRequest(method: string, url: string, data: any, callback: THttpCallback<any>)
{
    const xhr = new XMLHttpRequest();

    xhr.open(method, url, true);

    xhr.addEventListener('error', () =>
    {
        callback(new Error(`Request failed. Status: ${xhr.status}, text: "${xhr.statusText}"`));
    }, false);

    xhr.addEventListener('load', () =>
    {
        let res;

        try
        {
            res = JSON.parse(xhr.responseText);
        }
        catch (e)
        {
            res = xhr.responseText;
        }

        callback(null, res);
    }, false);

    xhr.responseType = 'text';

    if (method !== 'GET' && data)
    {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    }
    else
    {
        xhr.send();
    }

    return xhr;
}

export function get(url: string, callback: THttpCallback<any>)
{
    return sendRequest('GET', url, null, callback);
}

export function post(url: string, data: any, callback: THttpCallback<any>)
{
    return sendRequest('POST', url, data, callback);
}

export function put(url: string, data: any, callback: THttpCallback<any>)
{
    return sendRequest('PUT', url, data, callback);
}

export function del(url: string, callback: THttpCallback<any>)
{
    return sendRequest('DELETE', url, null, callback);
}
