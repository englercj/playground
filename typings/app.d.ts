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

type TErrCallback = (err: NodeJS.ErrnoException) => void;
type TErrCallback1<T1> = (err: NodeJS.ErrnoException, arg1?: T1) => void;
type TErrCallback2<T1, T2> = (err: NodeJS.ErrnoException, arg1?: T1, arg2?: T2) => void;

declare module 'bunyan-cloudwatch' {
    export default function (config: any): void;
}
