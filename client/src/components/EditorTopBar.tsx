import { h, Component } from 'preact';
import { bind } from 'decko';

interface IProps
{
    name: string;
    saving: boolean;
    dirty: boolean;
    showClone: boolean;
    onSettingsClick?: () => void;
    onCloneClick?: () => void;
    onSaveClick?: () => void;
}

export class EditorTopBar extends Component<IProps, {}>
{
    render(props: IProps)
    {
        return (
            <nav id="editor-topbar">
                <div className="brand">
                    <img src="/favicon-32x32.png" className="logo" alt="JS Logo" />
                    <span>Pixi Playground</span>
                </div>
                <div className="title">
                    <span>{name}</span>
                </div>
                <div className="btn-group">
                    <button className="btn" onClick={this._onSettingsClick}>
                        <span className="fa fa-cogs" aria-hidden="true" />
                        <span className="label">Settings</span>
                    </button>
                    {
                        props.showClone ? (
                            <button className="btn" onClick={this._onCloneClick}>
                                <span className="far fa-clone" aria-hidden="true" />
                                <span className="label">Clone</span>
                            </button>
                        ) : ''
                    }
                    <button className={"btn" + (props.dirty ? " glow" : "")} onClick={this._onSaveClick}>
                        <span className="fa fa-bookmark" aria-hidden="true" />
                        <span className="label">Save</span>
                        <span className={props.saving ? "loading" : " hidden"} />
                    </button>
                </div>
            </nav>
        );
    }

    @bind
    private _onSettingsClick()
    {
        if (this.props.onSettingsClick)
            this.props.onSettingsClick();
    }

    @bind
    private _onCloneClick()
    {
        if (this.props.onCloneClick)
            this.props.onCloneClick();
    }

    @bind
    private _onSaveClick()
    {
        if (this.props.onSaveClick)
            this.props.onSaveClick();
    }
}
