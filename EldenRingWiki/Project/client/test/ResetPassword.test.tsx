import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResetPassword } from '../src/pages/ResetPassword';
import wikiService from '../src/services/wiki-service';
import { Alert } from '../src/components/widgets';
import '@testing-library/jest-dom';

jest.mock('../src/services/wiki-service', () => ({
  resetUserPassword: jest.fn().mockResolvedValue({}),
}));

jest.mock('../src/components/widgets', () => ({
  Alert: {
    danger: jest.fn(),
    info: jest.fn(),
  },
  Form: {
    Label: jest.fn((props) => <label {...props} />),
    Input: jest.fn((props) => <input {...props} />),
  },
  Card: jest.fn((props) => <div {...props}>{props.children}</div>),
  Row: jest.fn((props) => <div {...props}>{props.children}</div>),
  Column: jest.fn((props) => <div {...props}>{props.children}</div>),
  Button: {
    Success: jest.fn((props) => <button {...props}>{props.children}</button>),
    Danger: jest.fn((props) => <button {...props}>{props.children}</button>),
  },
}));

  // ***** TESTS ***** ///

describe('ResetPassword Component', () => {
  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ResetPassword match={{ params: { username: 'testuser' } }} />
      </MemoryRouter>,
    );

    const card = screen.getByTitle('Reset the Password');
    expect(card).toBeInTheDocument();
  });

  test('shows alert when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <ResetPassword match={{ params: { username: 'testuser' } }} />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByPlaceholderText('new password');
    const passwordInput = inputs[0];
    const repeatPasswordInput = inputs[1];
    const resetButton = screen.getByText('Reset Password');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(repeatPasswordInput, { target: { value: 'password321' } });

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(Alert.danger).toHaveBeenCalledWith('Passwords do not match, please try again');
    });

    expect(passwordInput).toHaveValue('');
    expect(repeatPasswordInput).toHaveValue('');
  });

  test('shows alert for invalid password', async () => {
    render(
      <MemoryRouter>
        <ResetPassword match={{ params: { username: 'testuser' } }} />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByPlaceholderText('new password');
    const passwordInput = inputs[0];
    const repeatPasswordInput = inputs[1];
    const resetButton = screen.getByText('Reset Password');

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(repeatPasswordInput, { target: { value: 'short' } });

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(Alert.danger).toHaveBeenCalledWith(
        'Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character, try again.',
      );
    });

    expect(passwordInput).toHaveValue('');
    expect(repeatPasswordInput).toHaveValue('');
  });

  test('calls resetUserPassword and shows success alert when valid passwords are provided', async () => {
    render(
      <MemoryRouter>
        <ResetPassword match={{ params: { username: 'testuser' } }} />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByPlaceholderText('new password');
    const passwordInput = inputs[0];
    const repeatPasswordInput = inputs[1];
    const resetButton = screen.getByText('Reset Password');

    fireEvent.change(passwordInput, { target: { value: 'Valid1@Password' } });
    fireEvent.change(repeatPasswordInput, { target: { value: 'Valid1@Password' } });

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(wikiService.resetUserPassword).toHaveBeenCalledWith('testuser', 'Valid1@Password');
      expect(Alert.info).toHaveBeenCalledWith('Password updated!');
    });
  });
});
