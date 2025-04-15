import * as React from 'react';
import { shallow } from 'enzyme';
import { TagArticles } from '../src/pages/TagArticles';
import wikiService from '../src/services/wiki-service';

jest.mock('../src/services/wiki-service', () => ({
  getAuthenticatedUser: jest.fn(),
  getArticlesByTag: jest.fn(),
  getTag: jest.fn(),
  getTagUsageCount: jest.fn(),
}));

beforeEach(() => {
  (wikiService.getAuthenticatedUser as jest.Mock).mockResolvedValue({
    username: 'TestUser',
    bio: 'Test bio',
    profilePicture: 'mockProfilePic.jpg',
  });
  (wikiService.getArticlesByTag as jest.Mock).mockResolvedValue([]);
  (wikiService.getTag as jest.Mock).mockResolvedValue({ tagName: 'MockTag' });
  (wikiService.getTagUsageCount as jest.Mock).mockResolvedValue({ count: 5 });
});

  // ***** TESTS ***** ///

describe('TagArticles Component', () => {
  test('renders correctly with no articles', async () => {
    const wrapper = shallow(<TagArticles match={{ params: { tagId: 1 } }} />);

    await Promise.resolve();
    await Promise.resolve();
    wrapper.update();

    expect(wrapper.find('Card').dive().text()).toContain('Articles with tag "MockTag"');
    expect(wrapper.find('p').text()).toBe('No articles found with this tag.');
  });

  test('fetches data with correct tagId', async () => {
    const mockTagId = 42;
    shallow(<TagArticles match={{ params: { tagId: mockTagId } }} />);

    await Promise.resolve();
    await Promise.resolve();

    expect(wikiService.getArticlesByTag).toHaveBeenCalledWith(mockTagId);
    expect(wikiService.getTag).toHaveBeenCalledWith(mockTagId);
    expect(wikiService.getTagUsageCount).toHaveBeenCalledWith(mockTagId);
  });

  test('renders articles correctly', async () => {
    const mockArticles = [
      { articleId: 1, title: 'Article 1', views: 100 },
      { articleId: 2, title: 'Article 2', views: 200 },
    ];
    (wikiService.getArticlesByTag as jest.Mock).mockResolvedValue(mockArticles);

    const wrapper = shallow(<TagArticles match={{ params: { tagId: 2 } }} />);

    await Promise.resolve();
    await Promise.resolve();
    wrapper.update();

    const articles = wrapper.find('NavLink');
    expect(articles).toHaveLength(mockArticles.length);
    expect(articles.at(0).prop('to')).toBe('/articles/1');
  });
});