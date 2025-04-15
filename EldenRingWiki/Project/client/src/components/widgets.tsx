import * as React from 'react';
import { ReactNode, ChangeEvent } from 'react';
import { Component } from 'react-simplified';
import { NavLink } from 'react-router-dom';

/**
 * Renders an information card using Bootstrap classes.
 *
 * Properties: title
 */
export class Card extends Component<{ title: ReactNode; className?: string }> {
  render() {
    return (
      <div className={`card ${this.props.className || ''}`}>
        <div className="card-body">
          <h5 className="card-title">{this.props.title}</h5>
          <div className="card-text">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

/**
 * Renders a row using Bootstrap classes.
 */
export class Row extends Component {
  render() {
    return <div className="row">{this.props.children}</div>;
  }
}

/**
 * Renders a column with specified width using Bootstrap classes.
 *
 * Properties: width, right
 */
export class Column extends Component<{ width?: number; right?: boolean }> {
  render() {
    return (
      <div className={'col' + (this.props.width ? '-' + this.props.width : '')}>
        <div className={'float-' + (this.props.right ? 'end' : 'start')}>{this.props.children}</div>
      </div>
    );
  }
}

/**
 * Renders a success button using Bootstrap styles.
 *
 * Properties: small, onClick
 */
class ButtonSuccess extends Component<{
  small?: boolean;
  onClick: () => void;
}> {
  render() {
    return (
      <button
        type="button"
        className="btn btn-success buttonTurquoise"
        style={
          this.props.small
            ? {
                padding: '5px 5px',
                fontSize: '16px',
                lineHeight: '0.7',
              }
            : {}
        }
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

/**
 * Renders a danger button using Bootstrap styles.
 *
 * Properties: small, onClick
 */
class ButtonDanger extends Component<{
  small?: boolean;
  onClick: () => void;
}> {
  render() {
    return (
      <button
        type="button"
        className="btn btn-danger buttonRed"
        style={
          this.props.small
            ? {
                padding: '5px 5px',
                fontSize: '16px',
                lineHeight: '0.7',
              }
            : {}
        }
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

/**
 * Renders a light button using Bootstrap styles.
 *
 * Properties: small, onClick
 */
class ButtonLight extends Component<{
  small?: boolean;
  onClick: () => void;
}> {
  render() {
    return (
      <button
        type="button"
        className="btn btn-light TransparentSearch"
        style={
          this.props.small
            ? {
                padding: '5px 5px',
                fontSize: '16px',
                lineHeight: '0.7',
              }
            : {}
        }
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

class ButtonBlack extends Component<{
  small?: boolean;
  onClick: () => void;
}> {
  render() {
    return (
      <button
        type="button"
        className="btn btn-light buttonBlack"
        style={
          this.props.small
            ? {
                padding: '5px 5px',
                fontSize: '16px',
                lineHeight: '0.7',
              }
            : {}
        }
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

/**
 * Renders a button using Bootstrap styles.
 *
 * Properties: onClick
 */
export class Button {
  static Success = ButtonSuccess;
  static Danger = ButtonDanger;
  static Light = ButtonLight;
  static Black = ButtonBlack;
}

/**
 * Renders a NavBar link using Bootstrap styles.
 *
 * Properties: to
 */
class NavBarLink extends Component<{ to: string; className?: string }> {
  render() {
    return (
      <div className={this.props.className || ''}>
        <NavLink
          className={`nav-link ${this.props.className || ''}`}
          activeClassName="active"
          to={this.props.to}
        >
          {this.props.children}
        </NavLink>
      </div>
    );
  }
}

/**
 * Renders a NavBar using Bootstrap classes.
 *
 * Properties: brand
 */
export class NavBar extends Component<{ brand: ReactNode; className?: string }> {
  static Link = NavBarLink;

  render() {
    return (
      <nav className="navbar navbar-expand-sm navbar-light bg-light navbar-background">
        <div className="container-fluid justify-content-start">
          <NavLink className="navbar-brand" activeClassName="active" exact to="/">
            {this.props.brand}
          </NavLink>
          <div className="navbar-nav">{this.props.children}</div>
        </div>
      </nav>
    );
  }
}

/**
 * Renders a form label using Bootstrap styles.
 */
class FormLabel extends Component {
  render() {
    return <label className="col-form-label ">{this.props.children}</label>;
  }
}

/**
 * Renders a form input using Bootstrap styles.
 */
class FormInput extends Component<{
  type: string;
  value?: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  [prop: string]: any;
}> {
  render() {
    // ...rest will contain extra passed attributes such as disabled, required, width, height, pattern
    // For further information, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    const { type, value, onChange, ...rest } = this.props;
    return (
      <input
        {...rest}
        className="form-control TransparentSearch"
        type={this.props.type}
        {...(type !== 'file' ? { value } : {})} // Set value only if type is not 'file' // This line is from chatGPT
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}

/**
 * Renders a form textarea using Bootstrap styles.
 */
class FormTextarea extends React.Component<{
  value: string | number;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  [prop: string]: any;
}> {
  render() {
    // ...rest will contain extra passed attributes such as disabled, required, rows, cols
    // For further information, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    const { value, onChange, ...rest } = this.props;
    return <textarea {...rest} className="form-control" value={value} onChange={onChange} />;
  }
}

/**
 * Renders a form checkbox using Bootstrap styles.
 */
class FormCheckbox extends Component<{
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  [prop: string]: any;
}> {
  render() {
    // ...rest will contain extra passed attributes such as disabled, required, width, height, pattern
    // For further information, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    const { checked, onChange, ...rest } = this.props;
    return (
      <input
        {...rest}
        className="form-check-input"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
    );
  }
}

/**
 * Renders a form select using Bootstrap styles.
 */
class FormSelect extends Component<{
  value: string | number;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  [prop: string]: any;
}> {
  render() {
    // ...rest will contain extra passed attributes such as disabled, required, size.
    // For further information, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    const { value, onChange, children, ...rest } = this.props;
    return (
      <select {...rest} className="TransparentSearch" value={value} onChange={onChange}>
        {children}
      </select>
    );
  }
}

/**
 * Renders form components using Bootstrap styles.
 */
export class Form {
  static Label = FormLabel;
  static Input = FormInput;
  static Textarea = FormTextarea;
  static Checkbox = FormCheckbox;
  static Select = FormSelect;
}

/**
 * Renders alert messages using Bootstrap classes.
 *
 * Students: this slightly more complex component is not part of curriculum.
 */

//The Alert class is slightly modified so that each method has a 3 second timeout after which the alert dissapears
export class Alert extends Component {
  alerts: { id: number; text: ReactNode; type: string }[] = [];
  nextId: number = 0;

  render() {
    return (
      <div>
        {this.alerts.map((alert, i) => (
          <div
            key={alert.id}
            className={`alert alert-dismissible alert-${alert.type} alertStyle`}
            role="alert"
          >
            {alert.text}
            <button
              type="button"
              className="btn-close btn-sm"
              onClick={() => this.alerts.splice(i, 1)}
            />
          </div>
        ))}
      </div>
    );
  }

  /**
   * Show success alert.
   */
  static success(text: ReactNode) {
    setTimeout(() => {
      let instance = Alert.instance(); // Get rendered Alert component instance
      if (instance) {
        const id = instance.nextId++;
        instance.alerts.push({ id: id, text: text, type: 'success' });
        instance.forceUpdate();

        // Set timeout to remove alert after 3 seconds
        setTimeout(() => {
          instance.removeAlert(id);
        }, 1500);
      }
    });
  }

  /**
   * Show info alert.
   */
  static info(text: ReactNode) {
    setTimeout(() => {
      let instance = Alert.instance();
      if (instance) {
        const id = instance.nextId++;
        instance.alerts.push({ id: id, text: text, type: 'info' });
        instance.forceUpdate();

        setTimeout(() => {
          instance.removeAlert(id);
        }, 1500);
      }
    });
  }

  /**
   * Show warning alert.
   */
  static warning(text: ReactNode) {
    setTimeout(() => {
      let instance = Alert.instance();
      if (instance) {
        const id = instance.nextId++;
        instance.alerts.push({ id: id, text: text, type: 'warning' });
        instance.forceUpdate();

        setTimeout(() => {
          instance.removeAlert(id);
        }, 3000);
      }
    });
  }

  /**
   * Show danger alert.
   */
  static danger(text: ReactNode) {
    setTimeout(() => {
      let instance = Alert.instance();
      if (instance) {
        const id = instance.nextId++;
        instance.alerts.push({ id: id, text: text, type: 'danger' });
        instance.forceUpdate();

        setTimeout(() => {
          instance.removeAlert(id);
        }, 3000);
      }
    });
  }

  /**
   * Remove alert by id.
   */
  removeAlert(id: number) {
    const index = this.alerts.findIndex((alert) => alert.id === id);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      this.forceUpdate();
    }
  }
}
