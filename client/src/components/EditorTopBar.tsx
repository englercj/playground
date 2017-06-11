import { h, Component } from 'preact';

interface IProps {
    id: string;
    version: number;
}

export default class EditorTopBar extends Component<IProps, {}> {
    render() {
        return (
            <div id="editor-topbar">
                <img id="logo" />
                <a id="save">
                    <span className="spinner hidden" />
                    Save
                </a>
            </div>
        );
    }
}
