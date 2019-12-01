import { h, Component, ComponentChild } from 'preact';
import { getQueryParam } from '../util/queryUtils';
import { searchPlaygrounds } from '../service';
import { TopBar } from '../components/TopBar';
import { IPageProps } from './IPageProps';
import { IPlayground } from '../../../shared/types';

interface IState
{
    loading: boolean;
    results: IPlayground[];
    error: Error;
}

export class Search extends Component<IPageProps, IState>
{
    constructor(props: IPageProps, context: any)
    {
        super(props, context);

        this.state = {
            loading: true,
            results: null,
            error: null,
        };
    }

    componentWillMount()
    {
        const searchStr = getQueryParam('q');

        if (searchStr)
        {
            searchPlaygrounds(searchStr, (err, data) =>
            {
                if (err)
                {
                    this.setState({ loading: false, results: null, error: err });
                }
                else
                {
                    this.setState({ loading: false, results: data, error: null });
                }
            });
        }
        else
        {
            this.setState({ loading: false, error: new Error('No search query!') });
        }
    }

    render()
    {
        let view: ComponentChild;

        if (this.state.loading)
        {
            view = <span>Loading...</span>;
        }
        else if (this.state.error)
        {
            view = <pre><code>{this.state.error.stack}</code></pre>;
        }
        else
        {
            view = <pre><code>{JSON.stringify(this.state.results, null, 4)}</code></pre>;
        }

        return (
            <div>
                <TopBar useHistoryReplace={true} />
                <br/>
                {view}
            </div>
        );
    }
}
