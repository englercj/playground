import { rgxSemVer } from '../util/semver';

export enum PixiVersionType
{
    Release,
    Tag,
    Custom,
}

export function getPixiVersionType(version: string): PixiVersionType
{
    if (version === 'release')
        return PixiVersionType.Release;

    if (version.match(rgxSemVer) !== null)
        return PixiVersionType.Tag;

    return PixiVersionType.Custom;
}
