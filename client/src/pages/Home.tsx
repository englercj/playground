import { h, Component } from 'preact';
import { IPageProps } from './IPageProps';
import { TopBar } from '../components/TopBar';

export class Home extends Component<IPageProps, {}>
{
    render()
    {
        return (
            <div>
                <TopBar/>
                Home
            </div>
        );
    }
}
