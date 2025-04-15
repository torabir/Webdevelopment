import * as React from 'react';
import { shallow } from 'enzyme';
import { Login } from '../src/pages/Login';
import { Form, Button } from '../src/components/widgets';
import wikiService from '../src/services/wiki-service';

// Mocker viktige API-funksjoner for å simulere serverkall for å teste komponentlogikk uten faktiske serverkall.
jest.mock('../src/services/wiki-service', () => ({
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  getAuthenticatedUser: jest.fn(),
}));

  // ***** TESTS ***** ///

describe('Login component', () => {
  // 1. Test for visning av innloggingsskjema
  // Sjekker at innloggingsskjemaet rendres riktig når brukeren ikke er autentisert, inkludert inputfelter, knapp og lenker.
  test('Renders login form when user is not logged in', async () => {
    (wikiService.getAuthenticatedUser as jest.Mock).mockResolvedValue({ username: '' });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = shallow(<Login />);

    await Promise.resolve();
    wrapper.update();

    expect(wrapper.find('h3').text()).toBe('LOGIN');
    expect(wrapper.find(Form.Input)).toHaveLength(2); 

    const buttonWrapper = wrapper.find(Button.Success).dive();
    expect(buttonWrapper.text()).toBe('Login'); 

    expect(wrapper.find('NavLink').prop('to')).toBe('/create-user'); 

    consoleSpy.mockRestore();
  });

//2. Test for visning av utloggingsvisning når brukeren  er logget inn
// Sjekker at en melding som informerer om at brukeren er logget inn vises, samt en logout-knapp.
  test('Renders logout view when user is already logged in', async () => {
    (wikiService.getAuthenticatedUser as jest.Mock).mockResolvedValue({ username: 'TestUser' });

    const wrapper = shallow(<Login />);

    await Promise.resolve();
    wrapper.update();

    const cardWrapper = wrapper.find('Card').dive();
    expect(cardWrapper.text()).toContain('YOU ARE ALREADY LOGGED IN AS TestUser');

    const logoutButtonWrapper = wrapper.find(Button.Danger).dive();
    expect(logoutButtonWrapper.text()).toBe('Log Out'); // Sjekk teksten på knappen
  });

//3. Test for funksjon av logout-knapp
// Sjekker at logoutUser-funksjonen kalles korrekt når logout-knappen klikkes, og at komponenten håndterer dette riktig.
  test('Calls logout function when logout button is clicked', async () => {
    const mockLogoutUser = jest.spyOn(wikiService, 'logoutUser').mockResolvedValueOnce();

    (wikiService.getAuthenticatedUser as jest.Mock).mockResolvedValueOnce({
      username: 'TestUser',
    });

    const wrapper = shallow(<Login />);

    await Promise.resolve();
    wrapper.update();

    wrapper.find(Button.Danger).simulate('click');

    expect(mockLogoutUser).toHaveBeenCalledTimes(1);

    mockLogoutUser.mockRestore();
  });

//4. Test for navigasjon til registreringssiden
// Sjekker at lenken til registreringssiden ("Register now!") vises og har korrekt path.
  test('Navigates to register page when "Register now!" is clicked', () => {
    const wrapper = shallow(<Login />);

    const navLink = wrapper.find('NavLink[to="/create-user"]');

    expect(navLink.exists()).toBe(true);
    expect(navLink.text()).toBe('Register now!');
  });
});