import { h, Component } from 'preact';
import SearchBar from './SearchBar';

interface IProps {
    searchText?: string;
    useHistoryReplace?: boolean;
}

export default class TopBar extends Component<IProps, {}> {
    render() {
        return (
            <div>
                <SearchBar text={this.props.searchText} useHistoryReplace={this.props.useHistoryReplace}/>
            </div>
        );
    }
}
