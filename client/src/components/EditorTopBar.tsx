import { h, Component } from 'preact';
import { bind } from 'decko';

interface IProps
{
    slug: string;
    saving: boolean;
    onSaveClick?: () => void;
}

export class EditorTopBar extends Component<IProps, {}>
{
    render({ saving }: IProps)
    {
        return (
            <nav id="editor-topbar">
                <div className="brand">
                    <img src="/favicon-32x32.png" className="logo" />
                    <span className="title">Pixi Playground</span>
                </div>
                <div className="btn-group">
                    <button id="save" className="btn" onClick={this._onSaveClick}>
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
}
