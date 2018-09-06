import { h, Component } from 'preact';
import { bind } from 'decko';

interface IProps
{
    name: string;
    saving: boolean;
    dirty: boolean;
    onSaveClick?: () => void;
    onSettingsClick?: () => void;
}

export class EditorTopBar extends Component<IProps, {}>
{
    render({ name, saving, dirty }: IProps)
    {
        return (
            <nav id="editor-topbar">
                <div className="brand">
                    <img src="/favicon-32x32.png" className="logo" />
                    <span>Pixi Playground</span>
                </div>
                <div className="title">
                    <span>{name}</span>
                </div>
                <div className="btn-group">
                    <button id="settings" className="btn" onClick={this._onSettingsClick}>
                        <span className="fa fa-cogs" aria-hidden="true" />
                        <span className="label">Settings</span>
                    </button>
                    <button id="save" className={"btn" + (dirty ? " glow" : "")} onClick={this._onSaveClick}>
                        <span className="fa fa-bookmark" aria-hidden="true" />
                        <span className="label">Save</span>
                        <span className={saving ? "loading" : " hidden"} />
                    </button>
                </div>
            </nav>
        );
    }

    @bind
    private _onSaveClick()
    {
        if (this.props.onSaveClick)
            this.props.onSaveClick();
    }

    @bind
    private _onSettingsClick()
    {
        if (this.props.onSettingsClick)
            this.props.onSettingsClick();
    }
}
