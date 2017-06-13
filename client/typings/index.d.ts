/// <reference path="../../typings/app.d.ts" />
/// <reference path="../node_modules/monaco-editor/monaco.d.ts" />

declare const __BASE_ORIGIN__: string;

type TErrCallback = TCallback1<Error>;
type TErrCallback1<T1> = TCallback2<Error, T1>;
type TErrCallback2<T1, T2> = TCallback3<Error, T1, T2>;

interface IPublicPlaygroundData extends IPlaygroundData {
    version: number;
    contents: string;
}

declare module 'preact-router' {
    export function route(url: string, replace?: boolean): boolean;

    export interface CustomHistory {
        getCurrentLocation?: () => string;
        location?: any;
        listen(callback: (url: any) => void): Function;
        push?: (url: string) => void;
        replace?: (url: string) => void;
    }

    export interface RouterProps extends preact.ComponentProps<any> {
        history?: CustomHistory;
        path?: string;
        static?: boolean;
        url?: string;
    }

    export class Router extends preact.Component<RouterProps, {}> {
        canRoute(url: string): boolean;
        getMatchingChildren(children: preact.VNode[], url: string, invoke: boolean): preact.VNode[];
        routeTo(url: string): boolean;
        render(props: RouterProps, {}): preact.VNode;
    }

    export interface RouteArgs<PropsType, StateType> {
        component: preact.Component<PropsType, StateType>;
        path: string;
        matches?: boolean;
        url?: string;
    }

    export function Route<PropsType, StateType>({component, url, matches}: RouteArgs<PropsType, StateType>): preact.VNode;

    export function Link(props: any): preact.VNode;

    export namespace Router {
        var route: ((url: string, replace?: boolean) => boolean);
        var Route: (({component, url, matches} : RouteArgs<any, any>) => preact.VNode);
        var Link: ((props: any) => preact.VNode);
    }

    export default Router;
}
