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
                    <header>
                        <h2 className="title">Playground Settings</h2>
                        <div className="btn-group">
                            <button id="save" className="btn" onClick={this._onSaveClick}>
                                <span className="fa fa-bookmark" aria-hidden="true" />
                                <span className="label">Save</span>
                            </button>
                        </div>
                        <span className="fa fa-times close-btn" onClick={this._onCloseClick} />
                    </header>
                    <div className="form-wrapper">
                        <form>
                            <fieldset>
                                <h4><label>PixiJS Version</label></h4>
                                <RadioGroup name="settings-version" selectedValue={state.versionType} onChange={this._onVersionChange}>
                                    <Radio value="release" id="settings-version-release" />
                                    <label for="settings-version-release">Latest Release</label>

                                    <Radio value="tag" id="settings-version-tag" />
                                    <label for="settings-version-tag">Specific Version</label>
                                </RadioGroup>
                                <br/>

                                {
                                    state.versionType === 'tag' ? this._renderTagSelector(state)
                                    // : state.versionType === 'sha' ? this._renderShaSelector(state)
                                    : ''
                                }
                            </fieldset>

                            <fieldset>
                                <h4><label for="settings-name">Name</label></h4>
                                <input
                                    type="text"
                                    className="fullwidth"
                                    id="settings-name"
                                    name="name"
                                    placeholder="e.g. My Cool Playground"
                                    value={state.data.name}
                                    onChange={linkState(this, 'data.name')} />
                            </fieldset>

                            <fieldset>
                                <h4><label for="settings-desc">Description</label></h4>
                                <input
                                    type="text"
                                    className="fullwidth"
                                    id="settings-desc"
                                    name="desc"
                                    placeholder="e.g. A demo of how cool PixiJS is!"
                                    value={state.data.description}
                                    onChange={linkState(this, 'data.description')} />
                            </fieldset>

                            <fieldset>
                                <h4><label for="settings-author">Author</label></h4>
                                <input
                                    type="text"
                                    className="fullwidth"
                                    id="settings-author"
                                    name="author"
                                    placeholder="e.g. Chester McDoodle"
                                    value={state.data.author}
                                    onChange={linkState(this, 'data.author')} />
                            </fieldset>

                            <fieldset>
                                <h4><label>Attributes</label></h4>

                                <input
                                    type="checkbox"
                                    name="public"
                                    id="settings-attr-public"
                                    checked={state.data.isPublic}
                                    onClick={this._onToggle}/>
                                <label for="settings-attr-public">Public</label>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    private _renderTagSelector(state: IState)
    {
        return (
            <select
                id="settings-version-tag"
                className="fullwidth"
                value={this.state.data.pixiVersion}
                onChange={linkState(this, 'data.pixiVersion')}>
                <option hidden disabled value="release">-- Select a version --</option>
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
