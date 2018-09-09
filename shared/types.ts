export interface IPlayground
{
    id?: number;
    slug?: string;
    name?: string;
    description?: string;
    contents?: string;
    author?: string;
    versionsCount?: number;
    starCount?: number;
    pixiVersion?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    isOfficial?: boolean;

    tags?: ITag[];
    externaljs?: string[];
}

export interface ITag
{
    id?: number;
    name?: string;
}
