interface IPlaygroundData {
    name?: string;
    file?: string;
    author?: string;
    starCount?: number;
    pixiVersion?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    isOfficial?: boolean;
}

type TCallback = () => void;
type TCallback1<T1> = (arg1: T1) => void;
type TCallback2<T1, T2> = (arg1: T1, arg2: T2) => void;
type TCallback3<T1, T2, T3> = (arg1: T1, arg2: T2, arg3: T3) => void;

type TErrCallback = TCallback1<NodeJS.ErrnoException>;
type TErrCallback1<T1> = TCallback2<NodeJS.ErrnoException, T1>;
type TErrCallback2<T1, T2> = TCallback3<NodeJS.ErrnoException, T1, T2>;

declare module 'bunyan-cloudwatch' {
    let fn: (config: any) => void;

    export = fn;
}
