import * as React from 'react';
import { ViewProfile } from '../src/pages/ViewProfile';
import { shallow } from 'enzyme';
import { NavLink } from 'react-router-dom';
import { Card } from '../src/components/widgets';

jest.mock('../src/services/wiki-service', () => {
  return {
    getUser: jest.fn((username) =>
      Promise.resolve({
        username: username,
        profilePicture: 'profile-pic-url',
        bio: 'Sample bio',
      }),
    ),
    getUserArticles: jest.fn((username) =>
      Promise.resolve([
        { articleId: 1, title: 'First Article' },
        { articleId: 2, title: 'Second Article' },
      ]),
    ),
  };
});

  // ***** TESTS ***** ///

describe('ViewProfile component tests', () => {
  test('ViewProfile renders articles correctly in Card', (done) => {
    const wrapper = shallow(<ViewProfile match={{ params: { username: 'testuser' } }} />);

    setTimeout(() => {
      wrapper.update();
      expect(
        wrapper.containsMatchingElement(
          <Card title="Articles contributed in" className="basicCard">
            <ul>
              <li key={1}>
                <b>Article: </b>
                <NavLink to="/articles/1"> First Article</NavLink>
              </li>
              <li key={2}>
                <b>Article: </b>
                <NavLink to="/articles/2"> Second Article</NavLink>
              </li>
            </ul>
          </Card>,
        ),
      ).toEqual(true);
      done();
    }, 100);
  });

  test('ViewProfile renders user bio correctly', (done) => {
    const wrapper = shallow(<ViewProfile match={{ params: { username: 'testuser' } }} />);

    setTimeout(() => {
      wrapper.update();
      expect(
        wrapper.containsMatchingElement(
          <Card title="Biography" className="basicCard">
            <div
              style={{
                width: '300px',
                minHeight: '150px',
                fontStyle: 'italic',
              }}
            >
              Sample bio
            </div>
          </Card>,
        ),
      ).toBe(true);
      done();
    }, 100);
  });
});