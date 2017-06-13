interface IPlaygroundData {
    slug?: string;
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
