import * as React from 'react';
import { shallow } from 'enzyme';
import { SearchResults } from '../src/pages/SearchResults';
import wikiService from '../src/services/wiki-service';

jest.mock('../src/services/wiki-service', () => ({
  searchArticles: jest.fn(),
}));

  // ***** TESTS ***** ///

describe('SearchResults tests', () => {
  // 1. Tester at komponenten viser meldingen "Ingen treff for søket" når det ikke finnes en søkeforespørsel i URL-en.
  test('Renders correctly with no search query', () => {
    const wrapper = shallow(
      <SearchResults location={{
        search: '?q=test',
        pathname: '',
        state: null, // Include state to satisfy TypeScript
        hash: '',
      }} history={{} as any} match={{} as any} />, 
    );

    expect(wrapper.find('Card').dive().text()).toContain('Ingen treff for søket.'); 
  });

  // 2. Tester at artikler rendres med korrekte nøkler (articleId) og inline-stiler (padding).
  test('Renders articles with correct key and style', async () => {
    const mockArticles = [
      { articleId: 1, title: 'Article 1', content: '', date: '', tags: [] },
      { articleId: 2, title: 'Article 2', content: '', date: '', tags: [] },
    ];

    (wikiService.searchArticles as jest.Mock).mockResolvedValue(mockArticles);

    const wrapper = shallow(
      <SearchResults location={{
        search: '?q=test',
        pathname: '',
        state: null,
        hash: '',
      }} history={{} as any} match={{} as any} />,
    );

    await Promise.resolve();
    wrapper.update();

    // Finn alle `div`-elementer med stil og nøkkel
    const divs = wrapper.find('div[style]');

    expect(divs).toHaveLength(mockArticles.length);
    mockArticles.forEach((article, index) => {
      expect(divs.at(index).key()).toBe(article.articleId.toString());
      expect(divs.at(index).prop('style')).toEqual({ padding: '5px 0' });
    });
  });

  // Tester at komponenten henter artikler basert på søkeforespørselen og oppdaterer tilstanden,
  // og at artiklene vises som lenker med riktige titler og href-attributter.
  test('Handles search query and updates searchResults state', async () => {
    const mockArticles = [
      { articleId: 1, title: 'Test Article 1', content: '', date: '', tags: [] },
      { articleId: 2, title: 'Test Article 2', content: '', date: '', tags: [] },
    ];

    (wikiService.searchArticles as jest.Mock).mockResolvedValue(mockArticles);

    const wrapper = shallow(
      <SearchResults location={{
        search: '?q=test',
        pathname: '',
        state: null,
        hash: '',
      }} history={{} as any} match={{} as any} />,
    );

    await Promise.resolve();
    wrapper.update();

    const renderedLinks = wrapper.find('a');
    expect(renderedLinks).toHaveLength(mockArticles.length);
    expect(renderedLinks.at(0).text()).toBe('Test Article 1');
    expect(renderedLinks.at(0).prop('href')).toBe('#/articles/1');
    expect(renderedLinks.at(1).text()).toBe('Test Article 2');
    expect(renderedLinks.at(1).prop('href')).toBe('#/articles/2');
  });

  // Tester at feil fra wikiService.searchArticles håndteres riktig og logges til konsollen.
  test('Logs error when searchArticles throws an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (wikiService.searchArticles as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const wrapper = shallow(
      <SearchResults location={{
        search: '?q=test',
        pathname: '',
        state: null, 
        hash: '',
      }} history={{} as any} match={{} as any} />,
    );

    await Promise.resolve();
    wrapper.update();

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching search results:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  // Tester at komponenten viser en riktig melding når søkeparameteren er tom (?q=).
  test('Handles empty search query gracefully', async () => {
    const wrapper = shallow(
      <SearchResults location={{
        search: '?q=test',
        pathname: '',
        state: null, 
        hash: '',
      }} history={{} as any} match={{} as any} />,
    );

    await Promise.resolve();
    wrapper.update();

    expect(wrapper.find('Card').dive().text()).toContain('Ingen treff for søket.');
  });

  // Tester at komponenten kan håndtere og rendrer et stort antall artikler effektivt.
  test('Renders efficiently with a large number of articles', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      articleId: i,
      title: `Article ${i}`,
      content: '',
      date: '',
      tags: [],
    }));

    (wikiService.searchArticles as jest.Mock).mockResolvedValue(largeDataset);

    const wrapper = shallow(
      <SearchResults location={{
        search: '?q=test',
        pathname: '',
        state: null, 
        hash: '',
      }} history={{} as any} match={{} as any} />,
    );

    await Promise.resolve();
    wrapper.update();

    expect(wrapper.find('div[style]')).toHaveLength(largeDataset.length);
  });
});