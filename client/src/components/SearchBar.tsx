import { h, Component } from 'preact';
import { route } from 'preact-router';
import { bind } from 'decko';

interface IProps {
    text?: string;
    useHistoryReplace?: boolean;
}

export default class SearchBar extends Component<IProps, {}> {
    private _searchInput: HTMLInputElement;

    @bind
    onSearchButtonMount(input: HTMLInputElement) {
        this._searchInput = input;
    }

    @bind
    performSearch() {
        route(`/search?q=${encodeURIComponent(this._searchInput.value)}`, !!this.props.useHistoryReplace);
    }

    render() {
        return (
            <div>
                <input type="search" ref={this.onSearchButtonMount} value={this.props.text || ''}/>
                <button onClick={this.performSearch}>Search</button>
            </div>
        );
    }
}
