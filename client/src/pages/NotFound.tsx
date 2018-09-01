import { h, Component } from 'preact';
import { IPageProps } from './IPageProps';

export class NotFound extends Component<IPageProps, {}>
{
    render()
    {
        return <div>404: Not Found</div>;
    }
}
