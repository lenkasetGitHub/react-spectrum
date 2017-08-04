import classNames from 'classnames';
import React, {Component} from 'react';

export default class ShellHeaderActions extends Component {
  state = {
    openIndex: -1
  }

  handleMenuOpen = (e, index) => {
    this.setState({openIndex: index});
  }

  handleMenuClose = () => {
    this.setState({openIndex: -1});
  }

  render() {
    const {
      className,
      children,
      betaFeedback,
      ...otherProps
    } = this.props;

    const {openIndex} = this.state;

    let index = 0;

    return (
      <div
        className={
          classNames(
            'coral3-Shell-header-actions',
            className
          )
        }
        {...otherProps}
      >
        {betaFeedback}
        <div className="coral3-Shell-menubar">
          {
            children &&
            React.Children.map(children, child => {
              if (typeof child === 'object' && child && child.type) { // Is this a react element?
                let childProps = child.type.name === 'Button' ? {} : {
                  onOpen: this.handleMenuOpen,
                  onClose: this.handleMenuClose,
                  defaultOpen: index === openIndex,
                  index: index++
                };
                return React.cloneElement(child, childProps);
              }

              // Otherwise, the child is a string
              return child;
            })
          }
        </div>
      </div>
    );
  }
}

ShellHeaderActions.displayName = 'ShellHeaderActions';