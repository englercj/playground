import linkState from 'linkstate';
import { h, Component } from 'preact';
import { bind } from 'decko';
import { IPlayground } from '../../../shared/types';

interface IProps
{
    data: IPlayground;
    visible: boolean;
    onSaveClick?: (data: IPlayground) => void;
    onCloseClick?: () => void;
}

interface IState extends IPlayground
{

}

export class EditorSettingsDialog extends Component<IProps, IState>
{
    constructor(props: IProps, context: any)
    {
        super(props, context);
        this.state = props.data;
    }

    updatePlaygroundData(data: IPlayground)
    {
        this.setState(data);
    }

    render(props: IProps, state: IState)
    {
        return (
            <div id="settings-dialog" className="modal" style={props.visible ? "display: block" : "display: none"}>
                <div className="modal-content">
                    <span className="fa fa-times close" onClick={this._onCloseClick} />
                    <form>
                        <label for="slug">Slug:</label>
                        <input type="text" name="slug" value={state.slug} readOnly />
                        <br/>

                        <label for="name">Name:</label>
                        <input type="text" name="name" value={state.name} onChange={linkState(this, 'name')}/>
                        <br/>

                        <label for="desc">Description:</label>
                        <input type="text" name="desc" value={state.description} onChange={linkState(this, 'description')}/>
                        <br/>

                        <label for="author">Author:</label>
                        <input type="text" name="author" value={state.author} onChange={linkState(this, 'author')}/>
                        <br/>

                        <label for="version">PixiJS Version:</label>
                        <input type="text" name="version" value={state.pixiVersion} onChange={linkState(this, 'pixiVersion')}/>
                        <br/>

                        <label for="public">Public:</label>
                        <input type="checkbox" name="public" checked={state.isPublic} onClick={this._onToggle}/>
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

    @bind _onToggle(evt: MouseEvent)
    {
        switch ((evt.target as HTMLInputElement).name)
        {
            case 'public':
                this.setState({ isPublic: !this.state.isPublic });
                break;
        }
    }

    @bind
    private _onSaveClick()
    {
        console.log(this.state);
        if (this.props.onSaveClick)
            this.props.onSaveClick(this.state);
    }

    @bind
    private _onCloseClick()
    {
        if (this.props.onCloseClick)
            this.props.onCloseClick();
    }
}
