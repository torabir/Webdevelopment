import * as React from 'react';
import { Alert, Card, Row, Column, Button, Form, NavBar } from '../src/components/widgets';
import { shallow } from 'enzyme';

  // ***** TESTS ***** ///

describe('Alert component tests', () => {
  // Sjekker at ingen alarmer vises initialt
  test('No alerts initially', () => {
    const wrapper = shallow(<Alert />);
    expect(wrapper.matchesElement(<div></div>)).toEqual(true);
  });

  // Sjekker at en farealarm vises korrekt med riktig melding
  test('Show alert message', (done) => {
    const wrapper = shallow(<Alert />);
    Alert.danger('test');

    setTimeout(() => {
      expect(
        wrapper.matchesElement(
          <div>
            <div>
              test
              <button />
            </div>
          </div>,
        ),
      ).toEqual(true);
      done();
    });
  });

  // Sjekker at en alarm kan lukkes via klikk på knappen
  test('Close alert message', (done) => {
    const wrapper = shallow(<Alert />);
    Alert.danger('test');

    setTimeout(() => {
      wrapper.find('button.btn-close').simulate('click');
      expect(wrapper.matchesElement(<div></div>)).toEqual(true);
      done();
    });
  });

  // Sjekker at tre alarmer åpnes og den andre lukkes
  test('Open 3 alerts and close the second one', (done) => {
    const wrapper = shallow(<Alert />);
    Alert.danger('Message 1');
    Alert.danger('Message 2');
    Alert.danger('Message 3');

    setTimeout(() => {
      wrapper.find('button').at(1).simulate('click');

      setTimeout(() => {
        expect(
          wrapper.matchesElement(
            <div>
              <div>
                Message 1<button />
              </div>
              <div>
                Message 3<button />
              </div>
            </div>,
          ),
        ).toEqual(true);
        done();
      });
    });
  });
});

describe('Alert type-specific tests', () => {
  // Tester Alert.success funksjonen
  test('Alert.success displays correct message and type', (done) => {
    const wrapper = shallow(<Alert />);
    Alert.success('Success message');

    setTimeout(() => {
      expect(
        wrapper.matchesElement(
          <div>
            <div className="alert alert-dismissible alert-success alertStyle" role="alert">
              Success message
              <button type="button" className="btn-close btn-sm" />
            </div>
          </div>,
        ),
      ).toEqual(true);
      done();
    });
  });

  // Tester Alert.info funksjonen
  test('Alert.info displays correct message and type', (done) => {
    const wrapper = shallow(<Alert />);
    Alert.info('Info message');

    setTimeout(() => {
      expect(
        wrapper.matchesElement(
          <div>
            <div className="alert alert-dismissible alert-info alertStyle" role="alert">
              Info message
              <button type="button" className="btn-close btn-sm" />
            </div>
          </div>,
        ),
      ).toEqual(true);
      done();
    });
  });

  // Tester Alert.warning funksjonen
  test('Alert.warning displays correct message and type', (done) => {
    const wrapper = shallow(<Alert />);
    Alert.warning('Warning message');

    setTimeout(() => {
      expect(
        wrapper.matchesElement(
          <div>
            <div className="alert alert-dismissible alert-warning alertStyle" role="alert">
              Warning message
              <button type="button" className="btn-close btn-sm" />
            </div>
          </div>,
        ),
      ).toEqual(true);
      done();
    });
  });

  // Tester Alert.danger funksjonen
  test('Alert.danger displays correct message and type', (done) => {
    const wrapper = shallow(<Alert />);
    Alert.danger('Danger message');

    setTimeout(() => {
      expect(
        wrapper.matchesElement(
          <div>
            <div className="alert alert-dismissible alert-danger alertStyle" role="alert">
              Danger message
              <button type="button" className="btn-close btn-sm" />
            </div>
          </div>,
        ),
      ).toEqual(true);
      done();
    });
  });
});

describe('Card component tests', () => {
  // Tester at Card rendrer riktig med tittel og innhold
  test('Card renders correctly', async () => {
    const wrapper = shallow(
      <Card title="Test Card">
        <p>Card content</p>
      </Card>,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.containsMatchingElement(<h5 className="card-title">Test Card</h5>)).toEqual(
      true,
    );
    expect(wrapper.containsMatchingElement(<p>Card content</p>)).toEqual(true);
  });
});

describe('Row and Column components', () => {
  // Tester at Row rendrer med barn
  test('Row renders children', async () => {
    const wrapper = shallow(
      <Row>
        <div>Row content</div>
      </Row>,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.contains(<div>Row content</div>)).toEqual(true);
  });

  // Tester at Column rendrer riktig bredde og innhold
  test('Column renders with width', async () => {
    const wrapper = shallow(
      <Column width={3}>
        <p>Column content</p>
      </Column>,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.hasClass('col-3')).toEqual(true);
    expect(wrapper.contains(<p>Column content</p>)).toEqual(true);
  });
});

describe('Button components', () => {
  // Tester Button.Success funksjonalitet
  test('Button.Success renders and handles click', async () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button.Success onClick={onClick}>Click Me</Button.Success>);

    wrapper.simulate('click');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onClick).toHaveBeenCalled();
    expect(wrapper.text()).toEqual('Click Me');
  });

  // Tester Button.Danger funksjonalitet
  test('Button.Danger renders and handles click', async () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button.Danger onClick={onClick}>Delete</Button.Danger>);

    wrapper.simulate('click');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onClick).toHaveBeenCalled();
    expect(wrapper.text()).toEqual('Delete');
  });

  // Tester Button.Light funksjonalitet
  test('Button.Light renders and handles click', async () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button.Light onClick={onClick}>Cancel</Button.Light>);

    wrapper.simulate('click');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onClick).toHaveBeenCalled();
    expect(wrapper.text()).toEqual('Cancel');
  });

  // Tester Button.Black funksjonalitet
  test('Button.Black renders and handles click', async () => {
    const onClick = jest.fn();
    const wrapper = shallow(<Button.Black onClick={onClick}>Cancel</Button.Black>);

    wrapper.simulate('click');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onClick).toHaveBeenCalled();
    expect(wrapper.text()).toEqual('Cancel');
  });
});

describe('Form components', () => {
  // Tester Form.Input funksjonalitet
  test('Form.Input renders and handles change', async () => {
    const onChange = jest.fn();
    const wrapper = shallow(<Form.Input type="text" value="Test" onChange={onChange} />);

    wrapper.simulate('change', { currentTarget: { value: 'New Value' } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onChange).toHaveBeenCalled();
    expect(wrapper.prop('value')).toEqual('Test');
  });

  // Tester Form.Checkbox funksjonalitet
  test('Form.Checkbox renders and handles change', async () => {
    const onChange = jest.fn();
    const wrapper = shallow(<Form.Checkbox checked={false} onChange={onChange} />);

    wrapper.simulate('change', { currentTarget: { checked: true } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onChange).toHaveBeenCalled();
    expect(wrapper.prop('checked')).toEqual(false);
  });

  // Tester Form.Select funksjonalitet
  test('Form.Select renders and handles change', async () => {
    const onChange = jest.fn();
    const wrapper = shallow(
      <Form.Select value="1" onChange={onChange}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Form.Select>,
    );

    wrapper.simulate('change', { currentTarget: { value: '2' } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onChange).toHaveBeenCalled();
    expect(wrapper.prop('value')).toEqual('1');
  });

  // Tester Form.Textarea funksjonalitet
  test('Form.Textarea renders and handles change', async () => {
    const onChange = jest.fn();
    const wrapper = shallow(<Form.Textarea value="Test" onChange={onChange} />);

    wrapper.simulate('change', { currentTarget: { value: 'New text' } });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onChange).toHaveBeenCalled();
    expect(wrapper.prop('value')).toEqual('Test');
  });

  // Tester Form.Label funksjonalitet
  test('Form.Label renders correctly', () => {
    const wrapper = shallow(<Form.Label>Label Text</Form.Label>);
    expect(wrapper.text()).toBe('Label Text');
  });
});

describe('NavBar component', () => {
  // Tester NavBar.Link funksjonalitet
  test('NavBar.Link renders correctly', () => {
    const wrapper = shallow(<NavBar.Link to="/home">Home</NavBar.Link>);
    expect(wrapper.find('NavLink').prop('to')).toBe('/home');
    expect(wrapper.text()).toBe('Home');
  });
});

// Testene her er basert på øving om client-tester. Chat-gpt er brukt til å genere flere tester basert på kode fra denne øvingen.

// https://www.freecodecamp.org/news/how-to-write-unit-tests-in-react/
// https://www.freecodecamp.org/news/how-to-write-unit-tests-in-react/