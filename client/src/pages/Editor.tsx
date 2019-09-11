// TODO: When on mobile, hide the editor (don't even load it). Just show the result demo.
// Monaco Editor is not supported on mobile, but I still want people to be able to see the demos.

import { h, Component } from 'preact';
import { route } from 'preact-router';
import { bind } from 'decko';
import { getPlayground, getTypings, updatePlayground, createPlayground } from '../service';
import { IPageProps } from './IPageProps';
import { MonacoEditor } from '../components/MonacoEditor';
import { EditorTopBar } from '../components/EditorTopBar';
import { EditorSettingsDialog } from '../components/EditorSettingsDialog';
import { IPlayground } from '../../../shared/types';

interface IProps extends IPageProps
{
    slug?: string;
}

type TAlertType = 'success'|'info'|'warning'|'error';

const alertShowTime = 4000;
let activePixiTypings: monaco.IDisposable = null;

interface IEditorState {
    splitAmount: number;
}

interface IState
{
    playgroundLoading: boolean;
    editorLoading: boolean;
    typingsLoading: boolean;
    saving: boolean;
    showSettings: boolean;
    dirty: boolean;
    oldPixiVersion: string;
    data: IPlayground;
    alert: { type: TAlertType, msg: string, timeout: number, show: boolean };
    editorState : IEditorState;
    splitterIsDragged : boolean;
}


export class Editor extends Component<IProps, IState>
{
    private _splitter: Element;
    private _splitterOverlay: Element;
    private _editorInstance: monaco.editor.IStandaloneCodeEditor;
    private _monacoRef: typeof monaco;
    private _resultIFrame: HTMLIFrameElement;
    private _onChangeDelay: number;
    private _onChangeTimer: number;
    private _onSaveTimer: number;

    constructor(props: IProps, context: any)
    {
        super(props, context);

        this._splitter = null;
        this._editorInstance = null;
        this._monacoRef = null;
        this._resultIFrame = null;
        this._onChangeDelay = 1000;
        this._onChangeTimer = 0;

        this.state = {
            playgroundLoading: true,
            editorLoading: true,
            typingsLoading: true,
            saving: false,
            showSettings: false,
            dirty: true,
            oldPixiVersion: 'master',
            data: {
                pixiVersion: 'master',
                isPublic: true,
                autoUpdate: true,
            },
            alert: {
                type: 'info',
                msg: '',
                timeout: 0,
                show: false,
            },
            editorState: {
                splitAmount: 50
            },
            splitterIsDragged : false,
        };

        this.loadEditorConfig();

        this.loadPlayground();
    }

    componentDidUpdate(props : IProps, state : IState) {

        clearTimeout(this._onSaveTimer);
        this._onSaveTimer = setTimeout( ()=> this.saveEditorConfig() , 300);
    }

    componentWillMount()
    {
        window.addEventListener('keydown', this._onKeydown);
        window.onbeforeunload = this._onBeforeUnload;
    }

    componentWillUnmount()
    {
        window.removeEventListener('keydown', this._onKeydown);
        if(this._splitter) {
            this._splitter.removeEventListener('pointerdown', this._onSplitterDown);
        }
        window.onbeforeunload = null;
    }

    loadPlayground()
    {
        if (!this.props.slug)
        {
            this.setState({ playgroundLoading: false });
            this.onEditorValueChange(this._editorInstance ? this._editorInstance.getValue() : '');
        }
        else
        {
            this.setState({ playgroundLoading: true });
            getPlayground(this.props.slug, (err, data) =>
            {
                if (err)
                {
                    this.setState({ playgroundLoading: false });
                    route(`/edit`);
                    this._showAlert('error', err.message);
                }
                else
                {
                    this.setState({ playgroundLoading: false, data });
                }

                this.onEditorValueChange(
                    data.contents || (this._editorInstance ? this._editorInstance.getValue() : '')
                );
            });
        }
    }

    loadTypings()
    {
        const version = this.state.data.pixiVersion;

        this.setState({ typingsLoading: true });
        getTypings(version, (typings) =>
        {
            if (typings)
            {
                this.enableTypings(typings);
            }

            this.setState({ typingsLoading: false });
            this.onEditorValueChange(this._editorInstance.getValue());
        });
    }

    enableTypings(typings: string)
    {
        if (activePixiTypings)
        {
            activePixiTypings.dispose();
        }

        const jsDefaults = this._monacoRef.languages.typescript.javascriptDefaults;

        activePixiTypings = jsDefaults.addExtraLib(typings, 'pixi.js.d.ts');
    }

    loadEditorConfig() {
        const data = JSON.parse(localStorage.getItem("editorState")) as IEditorState;

        if(!data) {
            return;
        }

        this.state.editorState.splitAmount = data.splitAmount || 50;
    }

    saveEditorConfig() {
        const data = this.state.editorState;

        localStorage.setItem("editorState" , JSON.stringify(data))

    }

    @bind
    updateDemo()
    {
        if (this._isLoading() || !this._resultIFrame || !this._resultIFrame.contentWindow)
        {
            return;
        }

        this._resultIFrame.contentWindow.location.reload();
    }

    @bind
    onSplitterMounded(splitter: Element) {
        if(!this._splitter){
            this._splitter = splitter;
        }

        this._splitter.addEventListener("pointerdown",this._onSplitterDown);
    }

    @bind
    _onSplitterDown(event: PointerEvent) {
        this.setState({
            splitterIsDragged : true
        });

        this._splitterOverlay.addEventListener("pointermove", this._onSplitterMove);
        this._splitterOverlay.addEventListener("pointercancel", this._onSplitterReleased);
        this._splitterOverlay.addEventListener("pointerout", this._onSplitterReleased);
        this._splitterOverlay.addEventListener("pointerup", this._onSplitterReleased);
    }

    @bind
    _onSplitterReleased(event: PointerEvent) {
        this.setState({
            splitterIsDragged : false
        });

        this._splitterOverlay.removeEventListener("pointermove", this._onSplitterMove);
        this._splitterOverlay.removeEventListener("pointercancel", this._onSplitterReleased);
        this._splitterOverlay.removeEventListener("pointerout", this._onSplitterReleased);
        this._splitterOverlay.removeEventListener("pointerup", this._onSplitterReleased);
    }

    @bind
    _onSplitterMove(event: PointerEvent) {
        const width = this._splitterOverlay.clientWidth;
        const x = event.clientX;
        this.setState({ editorState : { splitAmount: 100 * x / width} });
    }

    @bind
    onSettingsMount(dialog: EditorSettingsDialog)
    {
        dialog.updatePlaygroundData(this.state.data);
    }

    @bind
    onEditorMount(editor: monaco.editor.IStandaloneCodeEditor, monacoRef: typeof monaco)
    {
        this._editorInstance = editor;
        this._monacoRef = monaco;

        this.loadTypings();

        this.setState({ editorLoading: false });
        this.onEditorValueChange(editor.getValue());
    }

    @bind
    onResultIFrameMount(iframe: HTMLIFrameElement)
    {
        if (this._resultIFrame)
        {
            this._resultIFrame.removeEventListener('load', this._onResultIFrameLoaded, false);
        }

        this._resultIFrame = iframe;

        iframe.addEventListener('load', this._onResultIFrameLoaded, false);
    }

    @bind
    onEditorValueChange(newValue: string)
    {
        if (this._isLoading())
            return;

        this.state.data.contents = newValue;

        this.setState({ dirty: true });

        clearTimeout(this._onChangeTimer);
        if (this.state.data.autoUpdate)
        {
            this._onChangeTimer = setTimeout(() =>
            {
                this.updateDemo();
            }, this._onChangeDelay);
        }
    }

    render(props: IProps, state: IState)
    {
        return (
            <div id="editor-full-wrapper">
                <div id="alert">
                    <span className={state.alert.type + (state.alert.show ? ' shown' : '')}>
                        {state.alert.msg}
                    </span>
                </div>
                <div id="editor-loading-info" className="fullscreen" style={{ display: this._isLoading() ? 'block' : 'none' }}>
                    <ul>
                        {this._renderLoadingInfoItem(state.playgroundLoading, 'Playground data')}
                        {this._renderLoadingInfoItem(state.editorLoading, 'Monaco editor')}
                        {this._renderLoadingInfoItem(state.typingsLoading, 'PixiJS types')}
                    </ul>
                </div>
                <EditorSettingsDialog
                    ref={this.onSettingsMount}
                    data={state.data}
                    visible={state.showSettings}
                    onSaveClick={this._saveSettings}
                    onCloseClick={this._hideSettings} />
                <EditorTopBar
                    name={state.data.name}
                    saving={state.saving}
                    dirty={state.dirty}
                    showClone={!!this.state.data.id}
                    onUpdateClick={this.updateDemo}
                    onSettingsClick={this._showSettings}
                    onCloneClick={this._clone}
                    onSaveClick={this._save} />

                <div className="wrap-container">
                    <div id="editor-wrapper" className="wrap-item" style={"width:" + state.editorState.splitAmount + "%"}>
                        <MonacoEditor
                            value={state.data && state.data.contents ? state.data.contents : getDefaultPlayground() }
                            options={{
                                theme: 'vs-dark',
                                automaticLayout: true,
                            }}
                            onChange={this.onEditorValueChange}
                            editorDidMount={this.onEditorMount}
                        />
                    </div>
                    <div id="results-wrapper" className="wrap-item" style={"width:" + (100 - state.editorState.splitAmount) + "%"}>
                        <iframe id="results-frame" src="results.html" ref={this.onResultIFrameMount} title="Playground Results" />
                    </div>
                    <div
                        className={"wrap-splitter " + (state.splitterIsDragged ? "active" : "") }
                        ref={this.onSplitterMounded} style={"left:" + state.editorState.splitAmount + "%"}>
                    </div>
                    <div
                        className={ "wrap-overlay " +  (state.splitterIsDragged ? "active" : "") }
                        ref={ ov => this._splitterOverlay = ov}>
                    </div>
                </div>
            </div>
        );
    }

    private _renderLoadingInfoItem(isLoading: boolean, name: string)
    {
        return (
            <li className={isLoading ? 'loading' : 'done'}>
                <span className="fa fa-check" />
                {isLoading ? 'Loading ' : ''}
                {name}
                {isLoading ? '...' : ' ready!'}
            </li>
        );
    }

    private _renderSettingsDialog(state: IState)
    {
        return
    }

    private _isLoading()
    {
        return this.state.playgroundLoading || this.state.editorLoading || this.state.typingsLoading;
    }

    private _showAlert(type: TAlertType, msg: string)
    {
        if (this.state.alert)
            clearTimeout(this.state.alert.timeout);

        const timeout = setTimeout(() =>
        {
            const a = this.state.alert;
            this.setState({ alert: { type: a.type, msg: a.msg, timeout: a.timeout, show: false } });
        }, alertShowTime);
        this.setState({ alert: { type, msg, timeout, show: true } });
    }

    @bind
    private _showSettings()
    {
        this.setState({ showSettings: true, oldPixiVersion: this.state.data.pixiVersion });
    }

    @bind
    private _hideSettings()
    {
        this.setState({ showSettings: false, dirty: true });

        if (this.state.data.pixiVersion != this.state.oldPixiVersion)
        {
            this.loadTypings();
        }
    }

    @bind
    private _saveSettings(data: IPlayground)
    {
        this.setState({ data, showSettings: false });
        this._save();

        if (this.state.data.pixiVersion != this.state.oldPixiVersion)
        {
            // this will cause an update of the demo after loading
            this.loadTypings();
        }
        else
        {
            this.updateDemo();
        }
    }

    @bind
    private _onResultIFrameLoaded()
    {
        this._resultIFrame.contentWindow.postMessage(this.state.data, location.origin);
    }

    @bind
    private _onKeydown(event: KeyboardEvent)
    {
        if (event.ctrlKey || event.metaKey)
        {
            if (String.fromCharCode(event.which).toLowerCase() == 's')
            {
                event.preventDefault();
                this._save();
            }
        }
    }

    @bind
    private _onBeforeUnload(event: Event)
    {
        if (this.state.dirty)
        {
            event.preventDefault();
            return '';
        }
    }

    @bind
    private _clone()
    {
        this.setState({ saving: true });

        createPlayground(this.state.data, (err, data: IPlayground) =>
        {
            if (!err && data)
            {
                this.setState({ data, saving: false, dirty: false });
                route(`/edit/${data.slug}`);
                this._showAlert('success', 'Playground Cloned!');
            }
            else
            {
                this.setState({ saving: false });
                this._showAlert('error', err.message);
            }
        });
    }

    @bind
    private _save()
    {
        this.setState({ saving: true, dirty: false });

        if (this.state.data.id)
        {
            updatePlayground(this.state.data, (err, data: IPlayground) =>
            {
                if (!err && data)
                {
                    this.setState({ data, saving: false });
                    this._showAlert('success', 'Playground Saved!');
                }
                else
                {
                    this.setState({ saving: false });
                    this._showAlert('error', err.message);
                }
            });
        }
        else
        {
            createPlayground(this.state.data, (err, data: IPlayground) =>
            {
                if (!err && data)
                {
                    this.setState({ data, saving: false });
                    route(`/edit/${data.slug}`);
                    this._showAlert('success', 'Playground Created!');
                }
                else
                {
                    this.setState({ saving: false });
                    this._showAlert('error', err.message);
                }
            });
        }
    }
}

function getDefaultPlayground()
{
    return `/**
* This is the default playground.
* You should see a bunny spinning in the right preview pane.
* Feel free to use this as a starting point for you own playground!
*/

// Create our application instance
var app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x2c3e50
});
document.body.appendChild(app.view);

// Load the bunny texture
app.loader.add('bunny', 'https://pixijs.io/examples/examples/assets/bunny.png')
    .load(startup);

function startup()
{
    var bunny = new PIXI.Sprite(app.loader.resources.bunny.texture);

    // Center the sprite's anchor point
    bunny.anchor.set(0.5);

    // Move the sprite to the center of the screen
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;

    app.stage.addChild(bunny);

    // Listen for animate update
    app.ticker.add(function(delta)
    {
        // Rotate mr rabbit clockwise
        bunny.rotation += 0.1 * delta;
    });
}
`;
}
