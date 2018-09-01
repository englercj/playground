export function getQueryParam(name: string, search: string = window.location.href)
{
    if (!search)
        return null;

    name = name.replace(/[\[\]]/g, '\\$&');

    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(search);

    if (!results)
        return null;

    if (!results[2])
        return '';

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
