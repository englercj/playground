import { h, Component } from 'preact';

interface IProps
{
    slug: string;
}

export class EditorTopBar extends Component<IProps, {}>
{
    render()
    {
        return (
            <nav id="editor-topbar">
                <div className="brand">
                    <img src="/favicon-32x32.png" className="logo" />
                    <span className="title">Pixi Playground</span>
                </div>
                <div className="btn-group">
                    <button id="save" className="btn">
                        <span className="fa fa-bookmark" aria-hidden="true" />
                        <span className="label">Save</span>
                        <span className="spinner small hidden" />
                    </button>
                </div>
            </nav>
        );
    }
}
