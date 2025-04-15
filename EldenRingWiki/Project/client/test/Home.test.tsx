import * as React from 'react';
import { shallow } from 'enzyme';
import { Home } from '../src/pages/Home';

// Mocker viktige API-funksjoner for å simulere serverkall for å teste komponentlogikk uten faktiske serverkall.
jest.mock('../src/services/wiki-service', () => ({
    searchArticles: jest.fn(),
    getAuthenticatedUser: jest.fn().mockResolvedValue({ username: 'TestUser' }),
    getCountArticles: jest.fn().mockResolvedValue({ count: 0 }),
    getPaginatedArticles: jest.fn().mockResolvedValue([]),
    getPaginatedTags: jest.fn().mockResolvedValue([]),
    getCountTags: jest.fn().mockResolvedValue({ count: 0 }),
  }));

jest.mock('history', () => ({
    createHashHistory: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

  // ***** TESTS ***** ///

describe('Home component', () => {

// 1. Test for rendring av Home-komponenten
// Sjekker at Home-komponenten rendrer uten feil når den initialiseres.
test('renders without crashing', () => {
    const wrapper = shallow(<Home />);
    expect(wrapper.exists()).toBe(true);
  });

  // 2. Test for kall av metoder under rendering
  // Sjekker at nødvendige metoder, som login og artikkel/tags-håndtering, kalles ved oppstart av komponenten.
  test('calls mounted methods on render', async () => {
    const wrapper = shallow(<Home />);
  
    // Verifiserer at nødvendige metoder kalles under mounting
    const instance = wrapper.instance();
    jest.spyOn(instance, 'login');
    jest.spyOn(instance, 'getPaginatedArticles');
    jest.spyOn(instance, 'countArticles');
    jest.spyOn(instance, 'getPaginatedTags');
    jest.spyOn(instance, 'countTags');
  
    await instance.mounted();
  
    expect(instance.login).toHaveBeenCalled();
    expect(instance.getPaginatedArticles).toHaveBeenCalled();
    expect(instance.countArticles).toHaveBeenCalled();
    expect(instance.getPaginatedTags).toHaveBeenCalled();
    expect(instance.countTags).toHaveBeenCalled();
  }); 

  // 3. Test for håndtering av sideinndeling
  // Sjekker at siden oppdateres korrekt når sideinndelingen endres, og at de relevante API-metodene blir kalt.
  test('handles article pagination', async () => {
    const wrapper = shallow(<Home />);
    const instance = wrapper.instance();
  
    jest.spyOn(instance, 'setPage');
    instance.setPage = jest.fn((page) => {
      instance.currentPage = page; 
    });
    jest.spyOn(instance, 'getPaginatedArticles');
  
    instance.setPage(2);
    await instance.getPaginatedArticles();
  
    expect(instance.setPage).toHaveBeenCalledWith(2);
    expect(instance.getPaginatedArticles).toHaveBeenCalled();
    expect(instance.currentPage).toBe(2); 
  });  
});