import linkState from 'linkstate';
import { h, Component, AnyComponent } from 'preact';
import { bind } from 'decko';

interface IRadioProps extends JSX.HTMLAttributes
{
}

export class Radio extends Component<IRadioProps, {}>
{
    render(props: IRadioProps)
    {
        const { name, selectedValue, onChange } = this.context.radioGroup;
        const optional: any = {};

        if (selectedValue !== undefined)
        {
            optional.checked = (props.value === selectedValue);
        }

        if (typeof onChange === 'function')
        {
            optional.onChange = onChange.bind(null, props.value);
        }

        if (props.className)
        {
            props.className += " radio-btn";
        }
        else
        {
            props.className = "radio-btn";
        }

        return <input
            {...props}
            role="radio"
            aria-checked={optional.checked}
            type="radio"
            name={name}
            {...optional} />
    }
}

interface IRadioGroupProps
{
    name?: string;
    selectedValue?: string|number|boolean;
    onChange?: (value: string) => void;
    Component?: (typeof Component)|string;
}

export class RadioGroup extends Component<IRadioGroupProps, {}>
{
    static defaultProps: IRadioGroupProps = {
        Component: 'div',
    };

    getChildContext()
    {
        const { name, selectedValue, onChange } = this.props;
        return {
            radioGroup: {
                name, selectedValue, onChange,
            },
        };
    }

    render()
    {
        const { Component, name, selectedValue, onChange, children, ...rest } = this.props;
        return <Component className="radio-group" role="radiogroup" {...rest}>{children}</Component>;
    }
}
