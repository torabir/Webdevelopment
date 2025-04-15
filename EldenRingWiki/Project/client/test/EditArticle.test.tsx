import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EditArticle } from '../src/pages/EditArticle';
import websocketService from '../src/services/websocket-service';
import '@testing-library/jest-dom';

// Først mocker vi eksterne tjenester og biblioteker som brukes i EditArticle-komponenten. 
// Dette inkluderer API-kall til wiki-service for å hente artikkeldata, tags og versjoner, osv. 
// Vi mocker også Quill-editoren for å simulere tekstredigering.
// Dette gir oss full kontroll over testdata og eliminerer behovet for eksterne avhengigheter som databaser eller sanntidsforbindelser.

jest.mock('../src/services/wiki-service', () => ({
  getAuthenticatedUser: jest.fn().mockResolvedValue({ username: 'testUser' }),
  getArticle: jest.fn().mockResolvedValue({
    title: 'Sample Article',
    articleId: 1,
    currentVersion: 2,
  }),
  getArticleTags: jest.fn().mockResolvedValue([{ tagName: 'TestTag' }]),
  getArticleVersions: jest.fn().mockResolvedValue([
    { version: 2, title: 'Sample Article', content: '{"ops":[{"insert":"Test content"}]}', image: '' },
  ]),
  createVersion: jest.fn().mockResolvedValue({ id: 123 }),
  getArticleByTitle: jest.fn(),
  deleteTagRelationsByArticleId: jest.fn(),
  createTag: jest.fn(),
  createTagRelation: jest.fn(),
}));

jest.mock('../src/services/websocket-service', () => ({
  subscribe: jest.fn().mockReturnValue({
    onopen: jest.fn(),
    onmessage: jest.fn(),
    onclose: jest.fn(),
  }),
  send: jest.fn(),
  unsubscribe: jest.fn(),
}));

jest.mock('quill', () => {
  return jest.fn().mockImplementation(() => ({
    setContents: jest.fn(),
    getContents: jest.fn(() => ({ ops: [{ insert: 'Mock content' }] })),
    on: jest.fn(),
  }));
});

describe('EditArticle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ***** TESTS ***** ///

  // 1. Test for at komponenten rendrer med korrekt data
  // Sjekker at editoren vises når komponenten lastes inn, og dataen fra tjenestene hentes korrekt.
  test('renders component with fetched data', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <EditArticle match={{ params: { id: 1 } }} />
        </MemoryRouter>,
      );
    });
  
    const editor = await screen.findByTestId('editor');
    expect(editor).toBeInTheDocument();
  });
  
  //2. Test for oppdatering av tittel og sending av websocket-melding
  // Sjekker at endring av tittel oppdaterer inputfeltet og sender en korrekt websocket-melding med oppdatert tittel.
  test('updates the title and sends a websocket message', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <EditArticle match={{ params: { id: 1 } }} />
        </MemoryRouter>,
      );
    });
  
    const titleInput = await screen.getByTestId('title-input');
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    });
  
    await waitFor(() => {
      expect(websocketService.send).toHaveBeenCalledWith({
        type: 'title-update',
        id: 1,
        title: 'Updated Title',
      });
    });
  });

  //3. Test for oppdatering av tags og sending av websocket-melding
  // Sjekker at oppdatering av tag-feltet oppdaterer tag-verdi og sender en korrekt websocket-melding med oppdaterte tags.
  test('updates the tags and sends a websocket message', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <EditArticle match={{ params: { id: 1 } }} />
        </MemoryRouter>,
      );
    });

    const tagsInput = await screen.findByPlaceholderText('This article does not have any tags yet');
    fireEvent.change(tagsInput, { target: { value: 'Tag1, Tag2' } });

    await waitFor(() => {
      expect(websocketService.send).toHaveBeenCalledWith({
        type: 'tags-update',
        id: 1,
        tags: 'Tag1, Tag2',
      });
    });
  });

  //4. Test for at tittelinput rendrer med riktig verdi
  // Sjekker at tittelinput vises med verdien fra tjenesten og oppdateres korrekt når brukeren skriver inn en ny tittel.
  test('renders title input with the correct value', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); 
    await act(async () => {
      render(
        <MemoryRouter>
          <EditArticle match={{ params: { id: 1 } }} />
        </MemoryRouter>
      );
    });
  
    const titleInput = await screen.findByTestId('title-input');
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue('Sample Article');
  
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    expect(titleInput).toHaveValue('Updated Title');
  });
});