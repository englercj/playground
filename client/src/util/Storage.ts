export namespace Storage
{
    const localStorageExists = (() => typeof localStorage !== 'undefined')();

    export function get(key: string): string | null
    {
        if (!localStorageExists)
            return null;

        return localStorage.getItem(key);
    }

    export function set(key: string, value: string): void
    {
        if (!localStorageExists)
            return null;

        localStorage.setItem(key, value);
    }

    export function remove(key: string): void
    {
        if (!localStorageExists)
            return null;

        localStorage.removeItem(key);
    }
}
