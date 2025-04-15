import * as React from 'react';
import { shallow } from 'enzyme';
import { NewArticle } from '../src/pages/NewArticle';
import { Alert, Form, Button } from '../src/components/widgets';
import wikiService from '../src/services/wiki-service';

beforeEach(() => {
  (wikiService.getAuthenticatedUser as jest.Mock).mockResolvedValue({
    username: 'TestUser',
    bio: 'Test bio',
    profilePicture: 'mockProfilePic.jpg',
  });
});

jest.mock('../src/services/wiki-service', () => ({
  getAuthenticatedUser: jest.fn().mockResolvedValue({ username: 'TestUser' }),
  getArticleByTitle: jest.fn().mockResolvedValue(null),
  getTagByName: jest.fn(),
  createTag: jest.fn(),
  createArticle: jest.fn().mockResolvedValue({ articleId: 1, versionId: 1 }),
  createTagRelation: jest.fn(),
  createVersionAuthor: jest.fn(),
}));

jest.mock('quill', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    getContents: jest.fn().mockReturnValue(''),
  }));
});

  // ***** TESTS ***** ///

describe('NewArticle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

//1. Test for korrekt rendring av NewArticle-komponenten
  test('renders NewArticle component correctly', () => {
    const wrapper = shallow(<NewArticle />);

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('Card').exists()).toBe(true);

    expect(wrapper.find(Form.Label).length).toBeGreaterThan(0);

    const saveButton = wrapper.find(Button.Success);
    expect(saveButton.exists()).toBe(true);
    expect(saveButton.dive().text()).toBe('Save');
  });

  //2. Test for håndtering av filinput
  // Denne testen sjekker at filopplastning i komponenten fungerer som forventet. Det opprettes en mock av FileReader 
  // for å simulere leseprosessen for filer uten å bruke nettleserens implementasjon. Testen finner filinputfeltet i 
  // komponenten, simulerer en filendring ved å sende inn en blob (representasjon av filinnhold), og verifiserer at 
  // FileReader sin `readAsDataURL`-metode blir kalt for å starte opplastingsprosessen.
  test('handles file input correctly', () => {
    const wrapper = shallow(<NewArticle />);
    const instance = wrapper.instance() as NewArticle;

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: jest.fn(),
      result: null,
    };
    global.FileReader = jest.fn(() => ({
      ...mockFileReader,
      EMPTY: 0,
      LOADING: 1,
      DONE: 2,
    })) as unknown as typeof FileReader;

    const fileInput = wrapper.find(Form.Input).filterWhere((node) => node.prop('type') === 'file');
    expect(fileInput.exists()).toBe(true); 

    fileInput.simulate('change', {
      currentTarget: {
        files: [new Blob(['file content'], { type: 'image/png' })],
      },
    });

    expect(mockFileReader.readAsDataURL).toHaveBeenCalled();
  });


//3. Test for håndtering av eksisterende artikkeltittel
// Sjekker at komponenten oppdager en allerede eksisterende artikkeltittel, kaller riktig API-metode og viser en advarsel via Alert.warning.
  test('handles existing article title correctly', async () => {
    const wrapper = shallow(<NewArticle />);
    const instance = wrapper.instance() as NewArticle;

    (wikiService.getArticleByTitle as jest.Mock).mockResolvedValue({ title: 'Existing Title' });

    instance.article.title = 'Existing Title';

    const alertSpy = jest.spyOn(Alert, 'warning').mockImplementation(() => {});

    await instance.createArticle();

    expect(wikiService.getArticleByTitle).toHaveBeenCalledWith('Existing Title');

    expect(alertSpy).toHaveBeenCalledWith('An article with this title already exists');

    alertSpy.mockRestore();
  });


//4. Test for håndtering av duplikattitler
// Sjekker at komponenten håndterer tilfeller der en tittel allerede eksisterer, 
// ved å kalle API-et og vise en advarsel for å informere brukeren om duplikatet.
  test('handles duplicate article titles correctly', async () => {
    const wrapper = shallow(<NewArticle />);
    const instance = wrapper.instance() as NewArticle;

    const alertSpy = jest.spyOn(Alert, 'warning').mockImplementation(() => {});

    (wikiService.getArticleByTitle as jest.Mock).mockResolvedValue({
      title: 'Existing Title',
    });

    instance.article.title = 'Existing Title';

    await instance.createArticle();

    expect(alertSpy).toHaveBeenCalledWith('An article with this title already exists');

    expect(wikiService.getArticleByTitle).toHaveBeenCalledWith('Existing Title');

    alertSpy.mockRestore();
  });
});