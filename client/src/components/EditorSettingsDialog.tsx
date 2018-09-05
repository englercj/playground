import linkState from 'linkstate';
import { h, Component } from 'preact';
import { bind } from 'decko';
import { IPlayground } from '../../../shared/types';
import { Radio, RadioGroup } from './Radio';
import { getReleases } from '../service';

const rgxSemVer = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

type VersionType = 'release'|'tag';//|'sha';

interface IProps
{
    data: IPlayground;
    visible: boolean;
    onSaveClick?: (data: IPlayground) => void;
    onCloseClick?: () => void;
}

interface IState
{
    data: IPlayground;
    versionType: VersionType;
    versionOptions: string[];
}

export class EditorSettingsDialog extends Component<IProps, IState>
{
    constructor(props: IProps, context: any)
    {
        super(props, context);

        this.state = {
            data: props.data,
            versionType: 'release',
            versionOptions: [],
        };

        getReleases((err, releases) =>
        {
            if (!err)
            {
                this.setState({ versionOptions: releases });
            }
        });
    }

    updatePlaygroundData(data: IPlayground)
    {
        let versionType: VersionType = 'release';

        if (data.pixiVersion === 'release')
            versionType = 'release';
        else if (data.pixiVersion.match(rgxSemVer) !== null)
            versionType = 'tag';
        // else
        //     versionType = 'sha';

        this.setState({ data, versionType });
    }

    render(props: IProps, state: IState)
    {
        return (
            <div id="settings-dialog" className="modal" style={props.visible ? "display: block" : "display: none"}>
                <div className="modal-content">
                    <span className="fa fa-times close" onClick={this._onCloseClick} />
                    <form>
                        <label for="settings-slug">Slug:</label>
                        <input type="text" id="settings-slug" name="slug" value={state.data.slug} readOnly />
                        <br/>

                        <label for="settings-name">Name:</label>
                        <input type="text" id="settings-name" name="name" value={state.data.name} onChange={linkState(this, 'data.name')}/>
                        <br/>

                        <label for="settings-desc">Description:</label>
                        <input type="text" id="settings-desc" name="desc" value={state.data.description} onChange={linkState(this, 'data.description')}/>
                        <br/>

                        <label for="settings-author">Author:</label>
                        <input type="text" id="settings-author" name="author" value={state.data.author} onChange={linkState(this, 'data.author')}/>
                        <br/>

                        <label>PixiJS Version:</label>
                        <RadioGroup name="settings-version" selectedValue={state.versionType} onChange={this._onVersionChange}>
                            <Radio value="release" />Latest Release
                            <Radio value="tag" />Specific Version
                            {/* <Radio value="sha" />Git Sha */}
                        </RadioGroup>

                        {
                            state.versionType === 'tag' ? this._renderTagSelector(state)
                            // : state.versionType === 'sha' ? this._renderShaSelector(state)
                            : ''
                        }
                        <br/>

                        {/*
                        <input type="radio" name="pixiVersion" id="settings-version-release" />
                        <label for="settings-version-release">Latest Release</label>

                        <input type="radio" name="pixiVersion" id="settings-version-tag" />
                        <label for="settings-version-tag">Specific Version</label>

                        <input type="radio" name="pixiVersion" id="settings-version-git" />
                        <label for="settings-version-git">Git Sha</label>

                        <input type="text" name="version" value={state.pixiVersion} onChange={linkState(this, 'data.pixiVersion')}/>
                        <br/>
                        */}

                        <label for="public">Public:</label>
                        <input type="checkbox" name="public" checked={state.data.isPublic} onClick={this._onToggle}/>
                        <br/>
                    </form>
                    <button id="save" className="btn" onClick={this._onSaveClick}>
                        <span className="fa fa-bookmark" aria-hidden="true" />
                        <span className="label">Save</span>
                    </button>
                </div>
            </div>
        );
    }

    private _renderTagSelector(state: IState)
    {
        return (
            <select id="settings-version-tag" value={this.state.data.pixiVersion} onChange={linkState(this, 'data.pixiVersion')}>
                {state.versionOptions.map(this._renderTagOption)}
            </select>
        );
    }

    private _renderTagOption(tag: string)
    {
        return (
            <option value={tag}>{tag}</option>
        );
    }

    // private _renderShaSelector(state: IState)
    // {
    //     return (
    //         <div>
    //             <input
    //                 type="text"
    //                 name="pixiVersion"
    //                 id="settings-version-git"
    //                 value={state.data.pixiVersion}
    //                 onChange={linkState(this, 'data.pixiVersion')} />
    //             <label for="settings-version-git">Git Sha</label>
    //         </div>
    //     );
    // }

    @bind
    private _onVersionChange(versionType: VersionType)
    {
        // TODO: After this gets saved the main view needs to be updated.
        // New typings need to be downloaded, the preview needs to reload, etc.
        const data = this.state.data;
        if (versionType === 'release')
            data.pixiVersion = 'release';
        this.setState({ data, versionType });
    }

    @bind
    private _onToggle(evt: MouseEvent)
    {
        switch ((evt.target as HTMLInputElement).name)
        {
            case 'public':
                const data = this.state.data;
                data.isPublic = !data.isPublic;
                this.setState({ data });
                break;
        }
    }

    @bind
    private _onSaveClick()
    {
        if (this.props.onSaveClick)
            this.props.onSaveClick(this.state.data);
    }

    @bind
    private _onCloseClick()
    {
        if (this.props.onCloseClick)
            this.props.onCloseClick();
    }
}
