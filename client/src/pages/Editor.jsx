import { h, Component } from 'preact';
import AceEditor from '../components/AceEditor';

import 'brace/mode/javascript';
import 'brace/theme/github';

export default class Editor extends Component {
    constructor(props, context) {
        super(props, context);

        this.props.version = parseInt(this.props.version, 10) || 0;
    }

    render() {
        return (
            <div>
                Editor: {this.props.id}, {this.props.version}
                <AceEditor
                    mode="javascript"
                    theme="github"
                />
            </div>
        );
    }
}
