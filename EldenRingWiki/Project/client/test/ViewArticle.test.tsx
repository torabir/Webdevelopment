import React from 'react';
import { shallow } from 'enzyme';
import { ViewArticle } from '../src/pages/ViewArticle';
import wikiService from '../src/services/wiki-service';

jest.mock('quill', () => jest.fn(() => ({
  setContents: jest.fn(),
  setText: jest.fn(),
})));

jest.mock('../src/services/wiki-service', () => ({
  getArticleVersions: jest.fn(),
  getArticle: jest.fn(),
  getArticleTags: jest.fn(),
  getArticleComments: jest.fn(),
  addView: jest.fn(),
  getAuthenticatedUser: jest.fn(),
  countAppraisals: jest.fn(),
  countGoodAppraisals: jest.fn(),
  getUserAppraisal: jest.fn(),
  getVersionAuthors: jest.fn().mockResolvedValue([]),
  getUserProfilePic: jest.fn().mockResolvedValue({ profilePicture: 'default-pic.jpg' }),
  appraiseArticle: jest.fn(), 
  deleteArticle: jest.fn(), 
}));

jest.mock('history', () => ({
  createHashHistory: jest.fn(() => ({
    push: jest.fn(), 
  })),
}));

  // ***** TESTS ***** ///

describe('ViewArticle Component', () => {
  beforeEach(() => {
    wikiService.getAuthenticatedUser.mockResolvedValue({ username: 'testuser' });
    wikiService.getArticle.mockResolvedValue({
      articleId: 1,
      title: 'Test Article',
      currentVersion: 1,
      views: 42,
    });
    wikiService.getArticleVersions.mockResolvedValue([
      { versionId: 1, version: 1, content: '{"ops":[{"insert":"Test content"}]}', versionDate: '2024-01-01T12:00:00' },
    ]);
    wikiService.getArticleTags.mockResolvedValue([{ tagId: 1, tagName: 'TestTag' }]);
    wikiService.getArticleComments.mockResolvedValue([]);
    wikiService.getUserAppraisal.mockResolvedValue('Positive');
  
    wikiService.countAppraisals.mockResolvedValue({ count: 5 }); 
    wikiService.countGoodAppraisals.mockResolvedValue({ count: 3 }); 
    wikiService.appraiseArticle.mockResolvedValue(undefined); 
    wikiService.deleteArticle.mockResolvedValue(undefined); 

  });

  test('renders without crashing', () => {
    const wrapper = shallow(<ViewArticle match={{ params: { id: 1 } }} />);
    expect(wrapper.exists()).toBe(true);
  });

  test('loads article data and sets the state correctly', async () => {
    const mockVersions = [
      { versionId: 1, version: 1, content: '{"ops":[{"insert":"Version 1"}]}', versionDate: '2024-01-01T12:00:00' },
      { versionId: 2, version: 2, content: '{"ops":[{"insert":"Version 2"}]}', versionDate: '2024-02-01T12:00:00' },
    ];
    const mockArticle = {
      articleId: 1,
      title: 'Test Article',
      currentVersion: 2,
      views: 42,
    };
    const mockTags = [{ tagId: 1, tagName: 'TestTag' }];
    const mockComments = [{ commentId: 1, username: 'user1', commentText: 'Test comment', commentDate: '2024-02-15T12:00:00' }];
    
    wikiService.getArticleVersions.mockResolvedValue(mockVersions);
    wikiService.getArticle.mockResolvedValue(mockArticle);
    wikiService.getArticleTags.mockResolvedValue(mockTags);
    wikiService.getArticleComments.mockResolvedValue(mockComments);
    wikiService.addView.mockResolvedValue();

    const wrapper = shallow(<ViewArticle match={{ params: { id: 1 } }} />);
    const instance = wrapper.instance() as ViewArticle;

    await instance.loadArticle();

    expect(wikiService.getArticleVersions).toHaveBeenCalledWith(1);
    expect(wikiService.getArticle).toHaveBeenCalledWith(1);
    expect(wikiService.getArticleTags).toHaveBeenCalledWith(1);
    expect(wikiService.getArticleComments).toHaveBeenCalledWith(1);
    expect(wikiService.addView).toHaveBeenCalledWith(1);

    expect(instance.article).toEqual(mockArticle);
    expect(instance.articleVersions).toEqual(mockVersions);
    expect(instance.currentVersion.version).toBe(2);
    expect(instance.displayedVersion.version).toBe(2);
    expect(instance.tags).toEqual(mockTags);
    expect(instance.comments).toEqual(mockComments);
  });

  test('calculates appraisal percentage correctly', async () => {
    const wrapper = shallow(<ViewArticle match={{ params: { id: 1 } }} />);
    const instance = wrapper.instance() as ViewArticle;
  
    wikiService.countAppraisals.mockResolvedValue({ count: 10 }); 
    wikiService.countGoodAppraisals.mockResolvedValue({ count: 7 }); 
  
    await instance.getAppraisalPercentage();
  
    expect(instance.appraisalCount).toBe(10); 
    expect(instance.appraisalPercentage).toBe(70); 
  });
  
  test('appraises article correctly', async () => {
    const wrapper = shallow(<ViewArticle match={{ params: { id: 1 } }} />);
    const instance = wrapper.instance() as ViewArticle;
  
    instance.setState({ authenticatedUsername: 'testuser' });
  
    const mockAppraiseArticle = jest.spyOn(wikiService, 'appraiseArticle').mockResolvedValue();
    const mockGetAppraisalPercentage = jest.spyOn(instance, 'getAppraisalPercentage');
    const mockFindUserAppraisal = jest.spyOn(instance, 'findUserAppraisal');
  
    await instance.appraiseArticle(true);
  
    expect(mockAppraiseArticle).toHaveBeenCalledWith(1, 'testuser', true);
    expect(mockGetAppraisalPercentage).toHaveBeenCalled();
    expect(mockFindUserAppraisal).toHaveBeenCalled();
  
    await instance.appraiseArticle(false);
  
    expect(mockAppraiseArticle).toHaveBeenCalledWith(1, 'testuser', false);
  });
});