import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EditProfile } from '../src/pages/EditProfile';
import wikiService from '../src/services/wiki-service';
import { Alert } from '../src/components/widgets';
import '@testing-library/jest-dom';

// Mocker services og komponenter som brukes i EditProfile-komponenten for å simulere API-kall for diverse data. 
// Widgets mockes for å kontrollere UI-komponenter som knapper og skjemaelementer, samt for å teste funksjoner som visning av varsler.
jest.mock('../src/services/wiki-service', () => ({
  getAuthenticatedUser: jest.fn().mockResolvedValue({
    username: 'testuser',
    profilePicture: 'profile-pic-url',
    bio: 'Sample bio',
  }),
  getUserArticles: jest.fn().mockResolvedValue([
    { articleId: 1, title: 'First Article' },
    { articleId: 2, title: 'Second Article' },
  ]),
  getUserComments: jest.fn().mockResolvedValue([
    {
      commentId: 1,
      articleId: 101,
      commentText: 'First comment',
      commentDate: '2023-11-19T10:30:00Z',
    },
    {
      commentId: 2,
      articleId: 102,
      commentText: 'Second comment',
      commentDate: '2023-11-18T12:15:00Z',
    },
  ]),
  editUser: jest.fn().mockResolvedValue({}),
  deleteComment: jest.fn().mockResolvedValue({}),
  logoutUser: jest.fn().mockResolvedValue({}),
}));

jest.mock('../src/components/widgets', () => ({
  Alert: {
    danger: jest.fn(),
    success: jest.fn(),
  },
  Form: {
    Label: jest.fn((props) => <label {...props} />),
    Input: jest.fn((props) => <input {...props} />),
    Textarea: jest.fn((props) => <textarea {...props} />),
  },
  Card: jest.fn((props) => <div {...props}>{props.children}</div>),
  Row: jest.fn((props) => <div {...props}>{props.children}</div>),
  Column: jest.fn((props) => <div {...props}>{props.children}</div>),
  Button: {
    Success: jest.fn((props) => <button {...props}>{props.children}</button>),
    Danger: jest.fn((props) => <button {...props}>{props.children}</button>),
    Light: jest.fn((props) => <button {...props}>{props.children}</button>),
  },
}));

  // ***** TESTS ***** ///

//1. Test for rendring av brukerdata og artikler
// Sjekker at brukerens informasjon, biografi og liste over artikler vises korrekt basert på mock-data.
describe('EditProfile Component', () => {
  test('renders user data and articles', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByTitle('Hello - testuser')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('write something about yourself')).toHaveValue('Sample bio');

    expect(await screen.findByText('First Article')).toBeInTheDocument();
    expect(screen.getByText('Second Article')).toBeInTheDocument();
  });

//2. Test for oppdatering av bio og profilbilde
// Sjekker at endringer i bio-feltet lagres ved å kalle API-et og viser en suksessmelding ved vellykket oppdatering.
  test('updates bio and profile picture', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>,
    );

    const bioTextarea = await screen.findByPlaceholderText('write something about yourself');
    const saveButton = screen.getByText('Save changes');

    fireEvent.change(bioTextarea, { target: { value: 'Updated bio' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(wikiService.editUser).toHaveBeenCalledWith('testuser', 'Updated bio', 'profile-pic-url');
      expect(Alert.success).toHaveBeenCalledWith('Updated bio and profile picture successfully');
    });
  });

//3. Test for sletting av kommentar
// Sjekker at sletting av en kommentar kaller riktig API-endepunkt og viser en suksessmelding etter sletting.
  test('deletes a comment', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>,
    );

    const deleteButton = await screen.findAllByText('Delete');
    fireEvent.click(deleteButton[0]);

    await waitFor(() => {
      expect(wikiService.deleteComment).toHaveBeenCalledWith(1);
      expect(Alert.success).toHaveBeenCalledWith('Comment deleted successfully.');
    });
  });

//4. Test for utlogging av bruker
// Sjekker at utlogging kaller logoutUser-funksjonen, og viser en melding som bekrefter vellykket utlogging.
  test('logs out user', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>,
    );

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(wikiService.logoutUser).toHaveBeenCalled();
      expect(Alert.success).toHaveBeenCalledWith('Successfull logout');
    });
  });
});