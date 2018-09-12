import linkState from 'linkstate';
import { h, Component } from 'preact';
import { bind } from 'decko';
import { IPlayground, IExternalJs } from '../../../shared/types';
import { Radio, RadioGroup } from './Radio';
import { getReleases } from '../service';
import { assertNever } from '../util/assertNever';
import { PixiVersionType, getPixiVersionType } from '../util/pixiVersionType';

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
    versionType: PixiVersionType;
    versionOptions: string[];
}

export class EditorSettingsDialog extends Component<IProps, IState>
{
    constructor(props: IProps, context: any)
    {
        super(props, context);

        this.state = {
            data: props.data,
            versionType: PixiVersionType.Release,
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
        let versionType = getPixiVersionType(data.pixiVersion);

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
                            <button id="settings-save" className="btn" onClick={this._onSaveClick}>
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

                                    <Radio value="custom" id="settings-version-custom" />
                                    <label for="settings-version-custom">Custom Url</label>
                                </RadioGroup>
                                <br/>

                                {
                                    state.versionType === PixiVersionType.Tag ? this._renderTagVersionSelector(state)
                                    : state.versionType === PixiVersionType.Custom ? this._renderCustomVersionSelector(state)
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
                                <h4><label>External Scripts</label></h4>

                                { (state.data.externaljs || []).map(this._renderExternaljs) }

                                <button id="settings-add-externaljs" className="btn" onClick={this._onAddExternaljs}>
                                    <span className="fa fa-plus" aria-hidden="true" />
                                    <span className="label">Add Script</span>
                                </button>
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

    private _renderTagVersionSelector(state: IState)
    {
        return (
            <select
                id="settings-version-tag-input"
                className="fullwidth"
                value={state.data.pixiVersion}
                onChange={linkState(this, 'data.pixiVersion')}>
                <option hidden disabled value="release">-- Select a version --</option>
                {state.versionOptions.map(this._renderTagOption)}
            </select>
        );
    }

    private _renderCustomVersionSelector(state: IState)
    {
        return (
            <input
                type="text"
                id="settings-version-custom-input"
                className="fullwidth"
                placeholder="e.g. https://mydomain.com/pixi.js"
                value={state.data.pixiVersion}
                onChange={linkState(this, 'data.pixiVersion')} />
        );
    }

    @bind
    private _renderTagOption(tag: string, index: number)
    {
        return (
            <option key={`tag-option-${index}`} value={tag}>{tag}</option>
        );
    }

    @bind
    private _renderExternaljs(externaljs: IExternalJs, index: number)
    {
        return (
            <div className="externaljs-row">
                <input
                    key={`externaljs-input-${index}`}
                    data-index={index}
                    type="text"
                    placeholder="https://mydomain.com/file.js"
                    value={externaljs.url}
                    onChange={this._onExternaljsChanged} />
                <span
                    className="fa fa-times"
                    title="Remove Script"
                    data-index={index}
                    onClick={this._onRemoveExternaljs} />
            </div>
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
    private _onAddExternaljs(e: Event)
    {
        e.preventDefault();

        if (!this.state.data.externaljs)
            this.state.data.externaljs = [];

        this.state.data.externaljs.push({ url: '' });
        this.setState({ data: this.state.data });
    }

    @bind
    private _onRemoveExternaljs(e: Event)
    {
        const target = e.target as HTMLInputElement;
        const index = parseInt(target.dataset.index, 10);

        this.state.data.externaljs.splice(index, 1);
        this.setState({ data: this.state.data });
    }

    @bind
    private _onExternaljsChanged(e: Event)
    {
        const target = e.target as HTMLInputElement;
        const index = parseInt(target.dataset.index, 10);

        this.state.data.externaljs[index].url = target.value;
    }

    @bind
    private _onVersionChange(versionTypeStr: string)
    {
        const data = this.state.data;
        const versionType: PixiVersionType = parseInt(versionTypeStr, 10);

        // Shouldn't be possible, but here as an extra careful check
        if (!(versionType in PixiVersionType))
            return;

        switch (versionType)
        {
            case PixiVersionType.Release:
                data.pixiVersion = 'release';
                break;

            case PixiVersionType.Tag:
                data.pixiVersion = this.state.versionOptions[0] || 'release';
                break;

            case PixiVersionType.Custom:
                data.pixiVersion = '';
                break;

            default:
                assertNever(versionType);
        }

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
    private _onSaveClick(e: Event)
    {
        e.preventDefault();
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
