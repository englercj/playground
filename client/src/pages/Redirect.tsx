import { h, Component, ComponentChild } from 'preact';
import { route } from 'preact-router';

interface IProps
{
    to: string;
}

export class Redirect extends Component<IProps, {}>
{
    componentWillMount()
    {
        route(this.props.to, true);
    }

    render(): ComponentChild
    {
        return null;
    }
}
