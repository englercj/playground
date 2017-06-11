import { h, Component } from 'preact';
import { bind } from 'decko';

function noop() { /* empty */ }

interface IProps {
    context?: any;
    width?: string;
    height?: string;
    value?: string;
    defaultValue?: string,
    language?: string,
    theme?: string,
    options?: monaco.editor.IEditorConstructionOptions,
    editorDidMount?: (editor: monaco.editor.IStandaloneCodeEditor, monacoRef: typeof monaco) => void,
    editorWillMount?: (monacoRef: typeof monaco) => void,
    onChange?: (value: string, event: any) => void,
    requireConfig?: any,
}

class MonacoEditor extends Component<IProps, {}> {
    editor: monaco.editor.IStandaloneCodeEditor;

    private _currentValue: string;
    private _preventTriggerChangeEvent: boolean;
    private _containerElement: HTMLDivElement;

    constructor(props: IProps, context: any) {
        super(props, context);

        this.editor = null;

        this._currentValue = props.value;
        this._preventTriggerChangeEvent = false;
        this._containerElement = null;
    }

    componentDidMount() {
        this.afterViewInit();
    }

    componentWillUnmount() {
        this.destroyMonaco();
    }

    componentDidUpdate(prevProps: IProps) {
        const context = this.props.context || window;

        if (this.props.value !== this._currentValue) {
            // Always refer to the latest value
            this._currentValue = this.props.value;

            // Consider the situation of rendering 1+ times before the editor mounted
            if (this.editor) {
                this._preventTriggerChangeEvent = true;
                this.editor.setValue(this._currentValue);
                this._preventTriggerChangeEvent = false;
            }
        }

        if (prevProps.language !== this.props.language) {
            context.monaco.editor.setModelLanguage(this.editor.getModel(), this.props.language);
        }
    }

    editorWillMount(monacoRef: typeof monaco) {
        const { editorWillMount } = this.props;

        editorWillMount(monacoRef);
    }

    editorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monacoRef: typeof monaco) {
        const { editorDidMount, onChange } = this.props;

        editorDidMount(editor, monacoRef);

        editor.onDidChangeModelContent((event) => {
            const value = editor.getValue();

            // Always refer to the latest value
            this._currentValue = value;

            // Only invoking when user input changed
            if (!this._preventTriggerChangeEvent) {
                onChange(value, event);
            }
        });
    }

    @bind
    containerDidMount(containerElement: HTMLDivElement) {
        this._containerElement = containerElement;
    }

    afterViewInit() {
        const { requireConfig } = this.props;
        const loaderUrl = requireConfig.url || 'vs/loader.js';
        const context = this.props.context || window;
        const onGotAmdLoader = () => {
            if (context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
                // Do not use webpack
                if (requireConfig.paths && requireConfig.paths.vs) {
                    context.require.config(requireConfig);
                }
            }

            // Load monaco
            context.require(['vs/editor/editor.main'], () => {
                this.initMonaco();
            });

            // Call the delayed callbacks when AMD loader has been loaded
            if (context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
                context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__ = false;

                const loaderCallbacks = context.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__;

                if (loaderCallbacks && loaderCallbacks.length) {
                    let currentCallback = loaderCallbacks.shift();

                    while (currentCallback) {
                        currentCallback.fn.call(currentCallback.context);
                        currentCallback = loaderCallbacks.shift();
                    }
                }
            }
        };

        // Load AMD loader if necessary
        if (context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
            // We need to avoid loading multiple loader.js when there are multiple editors loading concurrently
            //  delay to call callbacks except the first one
            context.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__ = context.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__ || [];
            context.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__.push({
                context: this,
                fn: onGotAmdLoader,
            });
        }
        else if (typeof context.require === 'undefined') {
            const loaderScript = context.document.createElement('script');

            loaderScript.type = 'text/javascript';
            loaderScript.src = loaderUrl;
            loaderScript.addEventListener('load', onGotAmdLoader);
            context.document.body.appendChild(loaderScript);
            context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__ = true;
        }
        else {
            onGotAmdLoader();
        }
    }

    initMonaco() {
        const value = this.props.value !== null ? this.props.value : this.props.defaultValue;
        const { language, theme, options } = this.props;
        const containerElement = this._containerElement;
        const context = this.props.context || window;

        if (typeof context.monaco !== 'undefined') {
            // Before initializing monaco editor
            this.editorWillMount(context.monaco);

            this.editor = context.monaco.editor.create(containerElement, {
                value,
                language,
                theme,
                ...options,
            });

            // After initializing monaco editor
            this.editorDidMount(this.editor, context.monaco);
        }
    }

    destroyMonaco() {
        if (typeof this.editor !== 'undefined') {
            this.editor.dispose();
        }
    }

    render() {
        const { width, height } = this.props;
        const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`;
        const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`;
        const style = {
            width: fixedWidth,
            height: fixedHeight,
        };

        return <div ref={this.containerDidMount} style={style} className="react-monaco-editor-container"/>;
    }
}

// MonacoEditor.propTypes = {
//     width: PropTypes.oneOfType([
//         React.PropTypes.string,
//         React.PropTypes.number,
//     ]),
//     height: PropTypes.oneOfType([
//         React.PropTypes.string,
//         React.PropTypes.number,
//     ]),
//     value: PropTypes.string,
//     defaultValue: PropTypes.string,
//     language: PropTypes.string,
//     theme: PropTypes.string,
//     options: PropTypes.object,
//     editorDidMount: PropTypes.func,
//     editorWillMount: PropTypes.func,
//     onChange: PropTypes.func,
//     requireConfig: PropTypes.object,
// };

MonacoEditor.defaultProps = {
    width: '100%',
    height: '100%',
    value: null,
    defaultValue: '',
    language: 'javascript',
    theme: 'vs',
    options: {},
    editorDidMount: noop,
    editorWillMount: noop,
    onChange: noop,
    requireConfig: {},
};

export default MonacoEditor;
