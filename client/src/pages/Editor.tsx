// TODO: When on mobile, hide the editor (don't even load it). Just show the result demo.
// Monaco Editor is not supported on mobile, but I still want people to be able to see the demos.

import { h, Component } from 'preact';
import { bind } from 'decko';
import { getPlayground, getTypings } from '../service';
import IPageProps from './IPageProps';
import globalState from '../util/globalState';
import MonacoEditor from '../components/MonacoEditor';
import EditorTopBar from '../components/EditorTopBar';

interface IProps extends IPageProps {
    slug?: string;
    version?: number;
}

const allowedTypingsVersionKeys = ['v4', 'v3', 'v2'];

const pixiTypingsCache: { [key: string]: string } = {
    v4: '',
    v3: '',
    v2: '',
};
let activePixiTypingsKey = '';
let activePixiTypings: monaco.IDisposable = null;

interface IState {
    playgroundLoading: boolean;
    editorLoading: boolean;
    typingsLoading: boolean;
    loading: boolean;
    err?: Error;
    data?: IPublicPlaygroundData;
}

export default class Editor extends Component<IProps, IState> {
    private _editorInstance: monaco.editor.IStandaloneCodeEditor;
    private _monacoRef: typeof monaco;
    private _resultIFrame: HTMLIFrameElement;
    private _onChangeDelay: number;
    private _onChangeTimer: number;

    constructor(props: IProps, context: any) {
        super(props, context);

        this._editorInstance = null;
        this._monacoRef = null;
        this._resultIFrame = null;
        this._onChangeDelay = 1000;
        this._onChangeTimer = 0;

        if (typeof this.props.version === 'string') {
            this.props.version = parseInt(this.props.version, 10) || 0;
        }

        this.state = {
            playgroundLoading: true,
            editorLoading: true,
            typingsLoading: true,
            err: null,
            data: {} as any,
            get loading() {
                return this.playgroundLoading || this.editorLoading || this.typingsLoading;
            },
        };

        this.loadPlayground();
    }

    loadPlayground() {
        if (!this.props.slug) {
            this.setState({ playgroundLoading: false });
            this.onEditorValueChange(this._editorInstance ? this._editorInstance.getValue() : '');
        }
        else {
            this.setState({ playgroundLoading: true });
            getPlayground(this.props.slug, this.props.version, (err, data) => {
                if (err) {
                    this.setState({ playgroundLoading: false, err });
                }
                else {
                    this.setState({ playgroundLoading: false, data });
                }

                this.onEditorValueChange(
                    data.contents || (this._editorInstance ? this._editorInstance.getValue() : '')
                );
            });
        }
    }

    loadTypings() {
        const version = this.state.data.pixiVersion || globalState.selectedPixiVersion || 'v4';
        const key = version.substr(0, 2);

        if (allowedTypingsVersionKeys.indexOf(key) === -1 || pixiTypingsCache.activeTypingsKey === key) {
            return;
        }

        if (pixiTypingsCache[key]) {
            this.enableTypings(key);

            if (this.state.typingsLoading) {
                this.setState({ typingsLoading: false });
                this.onEditorValueChange(this._editorInstance.getValue());
            }
        }
        else {
            this.setState({ typingsLoading: true });
            getTypings(key, (err, str) => {
                if (!err) {
                    pixiTypingsCache[key] = str;
                    this.enableTypings(key);
                }

                this.setState({ typingsLoading: false });
                this.onEditorValueChange(this._editorInstance.getValue());
            });
        }
    }

    enableTypings(key: string) {
        if (activePixiTypings) {
            activePixiTypings.dispose();
        }

        const jsDefaults = this._monacoRef.languages.typescript.javascriptDefaults;

        activePixiTypingsKey = key;
        activePixiTypings = jsDefaults.addExtraLib(pixiTypingsCache[key], 'pixi.d.ts');
    }

    @bind
    updateDemo() {
        if (this.state.loading || !this._resultIFrame || !this._resultIFrame.contentWindow) {
            return;
        }

        this._resultIFrame.contentWindow.location.reload();
    }

    @bind
    onEditorMount(editor: monaco.editor.IStandaloneCodeEditor, monacoRef: typeof monaco) {
        this._editorInstance = editor;
        this._monacoRef = monaco;

        this.loadTypings();

        this.setState({ editorLoading: false });
        this.onEditorValueChange(editor.getValue());
    }

    @bind
    onResultIFrameMount(iframe: HTMLIFrameElement) {
        this._resultIFrame = iframe;

        iframe.addEventListener('load', () => {
            iframe.contentWindow.postMessage(this.state.data, location.origin);
        }, false);
    }

    @bind
    onEditorValueChange(newValue: string) {
        if (this.state.loading) return;

        this.state.data.contents = newValue;

        clearTimeout(this._onChangeTimer);
        this._onChangeTimer = setTimeout(() => {
            this.updateDemo();
        }, this._onChangeDelay);
    }

    render({ slug, version }: IProps, { loading, err, data }: IState) {
        if (err) {
            return <div id="fullscreen error">Unable to load! {err.message}</div>;
        }

        return (
            <div id="editor-full-wrapper">
                <div className="fullscreen spinner large centered" style={{ display: loading ? 'block' : 'none' }} />
                <EditorTopBar slug={slug} version={version} />
                <div id="editor-wrapper">
                    <MonacoEditor
                        value={data && data.contents ? data.contents : getDefaultPlayground() }
                        options={{
                            theme: 'vs-dark',
                            automaticLayout: true,
                        }}
                        onChange={this.onEditorValueChange}
                        editorDidMount={this.onEditorMount}
                    />
                </div>
                <div id="results-wrapper">
                    <iframe id="results-frame" src="results.html" ref={this.onResultIFrameMount} />
                </div>
            </div>
        );
    }
}

function getDefaultPlayground() {
    return `var app = new PIXI.Application(window.innerWidth, window.innerHeight, { backgroundColor: 0x2c3e50 });
document.body.appendChild(app.view);

// create a new Sprite from an image path
var bunny = PIXI.Sprite.fromImage('https://pixijs.github.io/examples/required/assets/basics/bunny.png')

// center the sprite's anchor point
bunny.anchor.set(0.5);

// move the sprite to the center of the screen
bunny.x = app.renderer.width / 2;
bunny.y = app.renderer.height / 2;

app.stage.addChild(bunny);

// Listen for animate update
app.ticker.add(function(delta) {
    // just for fun, let's rotate mr rabbit a little
    // delta is 1 if running at 100% performance
    // creates frame-independent tranformation
    bunny.rotation += 0.1 * delta;
});
`;
}
