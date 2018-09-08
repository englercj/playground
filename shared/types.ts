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

    externalJs?: string[];
}
