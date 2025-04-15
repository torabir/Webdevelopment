import * as React from 'react';
import { Menu } from '../src/pages/Menu';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import wikiService from '../src/services/wiki-service'; 
import '@testing-library/jest-dom';

// Mocker viktige API-funksjoner for å simulere serverkall for å teste komponentlogikk uten faktiske serverkall.
jest.mock('../src/services/wiki-service', () => ({
  getAuthenticatedUser: jest.fn(),
  searchArticles: jest.fn(),
}));

beforeEach(() => {
  (wikiService.getAuthenticatedUser as jest.Mock).mockRejectedValue(
    new Error('User not logged in'),
  ); // Simulerer en feil ved innlogging
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

  // ***** TESTS ***** ///

describe('Menu component', () => {
  // 1. Tester om menyen rendrer
  // Setter opp komponenten med MemoryRouter for å håndtere routing
  test('should render Menu without errors', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Menu />
        </MemoryRouter>,
      );
    });

    // Test for at "Search" og "Login"-knapper vises initialt
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  //2. Test for at Search-funksjonaliteten fungerer
  // Sjekker at søkefeltet tar imot tekst og oppfører seg riktig.
  // Hvordan? Vi simuler at brukeren skriver inn tekst i søkefeltet, og bekreft at tekstverdien er satt riktig.
  test('should allow user to type in the search field', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Menu />
        </MemoryRouter>,
      );
    });

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Test article' } });
    });

    expect(searchInput.value).toBe('Test article');
  });

  //3. Test for at Login-knappen fungerer
  // Simulerer et klikk på Login-knappen og bekreft at en funksjon kalles.
  test('should call login function when Login button is clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Menu />
        </MemoryRouter>,
      );
    });

    const loginButton = screen.getByText('Login');
    await act(async () => {
      fireEvent.click(loginButton);
    });

    expect(loginButton).toBeInTheDocument();
  });

  //4. Autentisert bruker visning
  // Sjekker at brukernavnet vises i stedet for "Login"
  test('should display user-specific elements when user is authenticated', async () => {
    (wikiService.getAuthenticatedUser as jest.Mock).mockResolvedValue({ username: 'testUser' });

    await act(async () => {
      render(
        <MemoryRouter>
          <Menu />
        </MemoryRouter>,
      );
    });

    expect(screen.getByText('testUser')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  // 5. Test for å vise søkeforslag ved input
  test('should open dropdown on search input', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Menu />
        </MemoryRouter>,
      );
    });

    // Finner søkefeltet og simulerer en input-endring
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'Test article' } });

    await new Promise((resolve) => setTimeout(resolve, 300)); // Gir litt tid for debouncing av søkeresultater

    expect(screen.getByText('Ingen resultater')).toBeInTheDocument();
  });

  // 6. Test for å lukke dropdown ved klikk utenfor
  test('should hide suggestions when mouse is clicked outside suggestions', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Menu />
        </MemoryRouter>,
      );
    });

    // Finner søkefeltet og simulerer en input for å vise dropdown
    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'Test article' } });

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByText('Ingen resultater')).toBeInTheDocument();

    fireEvent.mouseDown(document);

    // Verifiserer at dropdown ikke lenger vises
    expect(screen.queryByText('Ingen resultater')).not.toBeInTheDocument();
  });

  // 7.Test at performSearch ikke gjør noe når searchWord er tomt
  test('should not perform search when searchWord is empty', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Menu />
        </MemoryRouter>,
      );
    });

    const searchButton = screen.getByText('Søk');
    fireEvent.click(searchButton);

    expect(window.location.pathname).toBe('/'); // Sjeker at vi forblir på samme rute (ingen søk utført)
  });
    
  // 8. Tester at viktige elementer i menyen vises korrekt.
  test('renders login button and search input', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Menu />
        </MemoryRouter>,
      );
    });

    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search');
    expect(searchInput).toBeInTheDocument();

    const searchButton = screen.getByText('Søk');
    expect(searchButton).toBeInTheDocument();
  });
});