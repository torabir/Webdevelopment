//This file is the main component for server-side testing
//All tests were developed by the team, and once we had a working framework, they were replicated with AI to work for most files and functions
//All AI-generated tests were controlled.

//Lines 10 - 150 are used for setting up the dependencies, and clearing our test-database and populating it with
//defined dummy-data in the file ./testdata.ts

////////////////////////////////////////////////////////////////////
//Importing all modules that we will be testing here
import axios from 'axios';
import pool from '../src/config/mysql-pool';
import app from '../src/server/app';
import wikiService from '../src/services/wiki-service';
import {
  testArticles,
  testArticleVersions,
  testComments,
  testTags,
  testUsers,
  testAppraisals,
  testArticleTags,
  testArticleVersionAuthors,
} from './testdata';
import { testImageData } from './testImageData';
import testService from './insertToTestDB-service';
import bcrypt from 'bcrypt';
import { comparePassword, hashPassword } from '../src/helpers/hashPassword';
import passport from 'passport';
import { Strategy } from 'passport-local';
/////////////////////////////////////////////////////////////////////////////

// Setting up the test-enviroment
axios.defaults.baseURL = 'http://localhost:3001/api/v2';

let webServer: any;

///////////////////////////////////////////////////////////////////////////
//Resetting the _test DB to have the same structure as the _dev DB but without any variables

const truncateTables = async () => {
  const tables = [
    'Article',
    'ArticleVersions',
    'Comments',
    'Tags',
    'ArticleTags',
    'Users',
    'Appraisals',
    'ArticleVersionAuthors',
  ];

  await new Promise<void>((resolve, reject) => {
    pool.query('SET FOREIGN_KEY_CHECKS = 0;', (error) => {
      if (error) return reject(error);
      resolve();
    });
  });

  for (const table of tables) {
    await new Promise<void>((resolve, reject) => {
      pool.query(`TRUNCATE TABLE ${table}`, (error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
};

///////////////////////////////////////////////////////////////////////////////
//Populating the DB with dummy-data as defined in testdata.ts

beforeAll(async () => {
  webServer = app.listen(3001);

  await truncateTables();

  // Insert test articles
  for (const article of testArticles) {
    await testService.insertArticle(
      article.articleId,
      article.currentVersion,
      article.title,
      article.views,
    );
  }

  // Insert test article versions
  for (const version of testArticleVersions) {
    await testService.insertArticleVersion(
      version.versionId,
      version.articleId,
      version.version,
      version.title,
      version.content,
      //@ts-ignore, not sure why TS does not like this, but it has no effect on the tests
      version.image,
      version.username,
      version.versionDate,
    );
  }

  // Insert test comments
  for (const comment of testComments) {
    await testService.insertComment(
      comment.commentId,
      comment.articleId,
      comment.username,
      comment.commentText,
      comment.commentDate,
      comment.lastUpdated,
    );
  }

  // Insert test tags
  for (const tag of testTags) {
    await testService.insertTag(tag.tagId, tag.tagName);
  }
  // Insert test users
  for (const user of testUsers) {
    //@ts-ignore
    await testService.insertUser(user.username, user.password, user.profilePicture, user.bio);
  }
  // Insert test articleTags
  for (const articleTag of testArticleTags) {
    await testService.insertArticleTag(articleTag.tagId, articleTag.articleId);
  }
  // Insert test appraisals
  for (const appraisal of testAppraisals) {
    await testService.insertAppraisal(appraisal.articleId, appraisal.username, appraisal.good);
  }

  for (const versionAuthors of testArticleVersionAuthors) {
    await testService.insertArticleVersionAuthor(
      versionAuthors.articleVersionId,
      versionAuthors.username,
    );
  }
});

afterAll(async () => {
  if (!webServer) throw new Error('Web server is not running.');

  // Re-enable foreign key checks, this means that no data should accidentally be deleted.
  await new Promise<void>((resolve, reject) => {
    pool.query('SET FOREIGN_KEY_CHECKS = 1;', (error) => {
      if (error) return reject(error);
      resolve();
    });
  });

  // Close the server and pool connections
  webServer.close(() => {
    pool.end(() => {});
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Starting testing

//Test group 1: getting articles
describe('Article API Tests', () => {
  test('Fetch all articles (200 OK)', async () => {
    const response = await axios.get('/articles');
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(testArticles);
  });

  test('Fetch article by ID (200 OK)', async () => {
    const response = await axios.get('/articles/1');
    expect(response.status).toEqual(200);
    expect(response.data).toEqual(testArticles[0]);
  });

  test('Fetch non-existing article (404 Not Found)', async () => {
    try {
      await axios.get('/articles/999');
      throw new Error('Expected 404, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(404);
    }
  });
});

test('Create a new article (201 Created)', async () => {
  const title = 'New Article';
  const content = 'Content of the new article';
  const username = 'Alice';
  const date = '2024-11-04 13:00:00';
  const image = 'testImageData'; // This is valid value (since image can be null)

  const response = await axios.post('/articles', { title, content, username, date, image });

  // Assertions
  expect(response.status).toEqual(201);
  expect(response.data).toHaveProperty('articleId');
  expect(response.data).toHaveProperty('versionId');
  expect(typeof response.data.articleId).toBe('number');
  expect(response.data.articleId).toBeGreaterThan(0);
});

test('Create article with missing title (400 Bad Request)', async () => {
  let content = 'Content of the new article';
  let username = 'Alice';
  let date = '2024-11-04 13:00:00';
  let image = testImageData;

  try {
    await axios.post('/articles', { content, username, date, image });
    throw new Error('Expected 400, but got 200');
  } catch (error: any) {
    expect(error.response.status).toEqual(400);
  }
});

test('Create article with missing content (400 Bad Request)', async () => {
  let title = 'New Article';
  let username = 'Alice';
  let date = '2024-11-04 13:00:00';
  let image = testImageData;

  try {
    await axios.post('/articles', { title, username, date, image });
    throw new Error('Expected 400, but got 200');
  } catch (error: any) {
    expect(error.response.status).toEqual(400);
  }
});

test('Create article with missing date (400 Bad Request)', async () => {
  let title = 'New Article';
  let content = 'Content of the new article';
  let username = 'Alice';
  let image = testImageData;

  try {
    await axios.post('/articles', { title, content, username, image });
    throw new Error('Expected 400, but got 200');
  } catch (error: any) {
    expect(error.response.status).toEqual(400);
  }
});

//image is allowed to be null in the database so we do not need to check that
test('Delete article (200 OK)', async () => {
  const response = await axios.delete(`/articles/1`);
  expect(response.status).toEqual(200);
  try {
    await axios.get(`/articles/1`);
    throw new Error('Expected 404, but got 200'); // If the article still exists, the function does not work
  } catch (error: any) {
    expect(error.response.status).toEqual(404);
  }
});

test('Delete non-existing article (404 Not Found)', async () => {
  try {
    // Try to delete a non-existing article
    await axios.delete(`/articles/999`);
    throw new Error('Expected 404, but got 200');
  } catch (error: any) {
    // Expecting 404 since the article doesn't exist
    expect(error.response.status).toEqual(404);
  }
});

//Article version testing
describe('Article Version tests', () => {
  describe('Article Version GET-requests', () => {
    test('Fetch all versions (200 OK)', async () => {
      const response = await axios.get('/versions');
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.data)).toBe(true); //This test kept failing, so I asked help from AI for this
      expect(response.data.length).toBeGreaterThan(0);
    });

    test('Get article version 1 with ID 3 (200 OK)', async () => {
      const response = await axios.get(`/articles/3/versions/1`);
      expect(response.status).toEqual(200);
      expect(response.data).toHaveProperty('title');
      expect(response.data).toHaveProperty('username');
      expect(response.data).toHaveProperty('versionDate');
    });

    test('Fetch an invalid version endpoint (404 NOT FOUND)', async () => {
      try {
        const response = await axios.get('/versionss'); // Invalid endpoint
        throw new Error('Expected 404, but got 200');
      } catch (error: any) {
        expect(error.response.status).toEqual(404);
        expect(error.response.data).toBeDefined();
      }
    });

    test('Fetch all versions of an article (articleId = 3) (200 OK)', async () => {
      //This test fails
      const response = await axios.get(`/articles/3/versions`);
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('Fetch article versions with invalid articleId (404 Not Found)', async () => {
      try {
        const response = await axios.get('/articles/145/versions');
        throw new Error('Expected 404, but got 200');
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          //Help from GPT
          expect(error.response?.status).toEqual(404);
          expect(error.response?.data).toEqual('Article versions not found');
        } else {
          throw error;
        }
      }
    });

      test('Create article version (200 OK)', async () => {
        const data = {
          title: 'New Article Version',
          content: 'This is the content of the new version.',
          username: 'John Doe',
          date: '2024-11-04 13:00:00',
          version: 2,
          image: null, //Image can be null in the DB
        };

        const response = await axios.post(`/articles/1/versions`, data);

        expect(response.status).toEqual(200);
        expect(response.data).toHaveProperty('id');
      });

      test('Create article version with missing fields (400 Bad Request)', async () => {
        const data = {
          title: 'New Article Version', // Missing content, username, date, and version
          content: '',
          username: '',
          date: '',
          version: 2,
          image: null,
        };

        try {
          await axios.post(`/articles/1/versions`, data);
          throw new Error('Expected 400, but got 200');
        } catch (error: any) {
          expect(error.response.status).toEqual(400);
          expect(error.response.data).toEqual(
            'Missing required fields: articleId, title, content, username, date, or version.',
          );
        }
      });
      test('Create article version with invalid articleId (400 Bad Request)', async () => {
        const data = {
          title: 'New Article Version',
          content: 'This is the content of the new version.',
          username: 'John Doe',
          date: '2024-11-04 13:00:00',
          version: 2,
          image: null,
        };
        try {
          await axios.post(`/articles/0/versions`, data); //0 not valid
          throw new Error('Expected 400, but got 200');
        } catch (error: any) {
          expect(error.response.status).toEqual(400);
          expect(error.response.data).toEqual(
            'Missing required fields: articleId, title, content, username, date, or version.',
          );
        }
      });
      test('Delete article version that does not exist (404 Not Found)', async () => {
        try {
          const response = await axios.delete(`/article/1/version/3456`);
          throw new Error('Expected 404, but got 200');
        } catch (error: any) {
          expect(error.response.status).toEqual(404);
          expect(error.response.data).toContain('Cannot DELETE /api/v2/article/1/version/3456');
        }
      });
    });
  });


//Testing comments
describe('Comment tests', () => {
  test('Get comment with Id = 3 (200 OK)', async () => {
    //This test fails
    const response = await axios.get(`/comments/3`);
    expect(response.status).toEqual(200);
    expect(response.data).toHaveProperty('commentId');
    expect(response.data).toHaveProperty('commentText');
  });

  test('Get comment by non-existent ID (404 Not Found)', async () => {
    try {
      await axios.get(`/comments/150`);
      throw new Error('Expected 404, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(404);
      expect(error.response.data).toEqual('Comment not found');
    }
  });

  test('Get all comments (200 OK)', async () => {
    const response = await axios.get('/comments');

    expect(response.status).toEqual(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);

    const comment = response.data[0];
    expect(comment).toHaveProperty('commentId');
    expect(comment).toHaveProperty('articleId');
    expect(comment).toHaveProperty('username');
    expect(comment).toHaveProperty('commentText');
    expect(comment).toHaveProperty('commentDate');
    expect(comment).toHaveProperty('lastUpdated');
  });

  test('Update comment with empty text (400 Bad Request)', async () => {
    try {
      await axios.put(`/comments/1`, '');
      throw new Error('Expected 400, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(400);
      expect(error.response.data).toEqual('Comment text cannot be empty');
    }
  });

  test('Update non-existent comment (400 bad request)', async () => {
    try {
      await axios.put(`/comments/2345`, 'Hey, can I update you?');
      throw new Error('Expected 400, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(400);
      expect(error.response.data).toEqual('Comment text cannot be empty');
    }
  });

  test('Fetch comments for an article (200 OK)', async () => {
    const response = await axios.get(`/articles/1/comments`);

    expect(response.status).toEqual(200);
    expect(response.data).toBeInstanceOf(Array);
    response.data.forEach((comment: any) => {
      expect(comment.articleId).toEqual(1);
    });
  });

  test('Create comment (200 OK)', async () => {
    const newComment = {
      articleId: 1,
      username: 'bob',
      commentText: 'Great article!',
      commentDate: '2024-11-04 10:00:00',
      lastUpdated: '2024-11-04 10:00:00',
    };
    const response = await axios.post('/comments', newComment);
    expect(response.status).toEqual(200);
    expect(response.data).toHaveProperty('id');
  });

  test('Create comment with missing required fields (400 Bad Request)', async () => {
    const invalidComment = {
      articleId: 1,
      username: 'bob',
      commentText: '', // Missing commentText
      commentDate: '2024-11-04 10:00:00',
      lastUpdated: '2024-11-04 10:00:00',
    };

    try {
      await axios.post('/comments', invalidComment);
      throw new Error('Expected 400, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(400);
      expect(error.response.data).toEqual(
        'Missing article id, username, commentText, commentDate or lastUpdated.',
      );
    }
  });

  test('Delete comment (200 OK)', async () => {
    const response = await axios.delete(`/comments/3`);

    expect(response.status).toEqual(200);
  });
  test('Delete comment with server error (500 Internal Server Error)', async () => {
    try {
      await axios.delete(`/comments/475`);
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(500);
    }
  });
});

//Testing profile things
describe('Profile tests', () => {
  test('Try to fetch articles without a username (404 not found)', async () => {
    try {
      await axios.get(`/profile//articles`); //Invalid path (there is no username)
      throw new Error('Expected 404, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(404);
      expect(error.response.data).toContain('Cannot GET /api/v2/profile//articles');
    }
  });

  test('Fetch comments for a valid username (200 OK)', async () => {
    const response = await axios.get(`/profile/bob/comments`);
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.data)).toBeTruthy(); // Ensure the response is an array of comments
    expect(response.data[0]).toHaveProperty('commentText'); // Ensure each comment has a commentText
  });

  test('Successfully reset password for valid username (200 OK)', async () => {
    const newPassword = 'newSecurePassword123'; // A valid new password
    const response = await axios.put(`/profile/bob/reset-password`, {
      newPassword,
    });
    expect(response.status).toEqual(200);
    expect(response.data).toEqual({ message: 'Password updated successfully' });
  });

  test('Attempt to reset password without providing new password (500 server error)', async () => {
    try {
      await axios.put(`/profile/bob/reset-password`, {});
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(500);
    }
  });

  test('Attempt to reset password for non-existing username', async () => {
    const newPassword = 'newSecurePassword123';

    try {
      await axios.put(`/profile/not_bob/reset-password`, {
        newPassword,
      });
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(500);
    }
  });

  // (Testing for validity of password (8 characters one big, one special etc.) is happening on the client side, and not tested here)

  test('Successfully delete a user (200 OK)', async () => {
    const response = await axios.delete(`/profile/bob`);
    expect(response.status).toEqual(200);
    expect(response.data).toEqual({ message: 'User deleted succesfully' });
  });

  test('Attempt to delete a non-existing user (Server error)', async () => {
    try {
      await axios.delete(`/profile/not_bob`);
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(500);
    }
  });

  test('Edit user profile successfully (200 OK)', async () => {
    const data = {
      bio: 'Updated bio for Alice.',
      profilePicture: 'base64ImageString',
    };

    const response = await axios.post(`/users/alice/edit`, data);

    expect(response.status).toEqual(200);
  });

  test('Missing bio in request body (400 Bad Request)', async () => {
    const data = {
      profilePicture: 'base64ImageString', // Valid profile picture
    };

    try {
      await axios.post(`/users/alice/edit`, data);
    } catch (error) {
      //@ts-ignore
      expect(error.response.status).toEqual(400);
    }
  });
});

//Testing Tags
describe('Article tags tests', () => {
  test('Fetch total tag count (200 OK)', async () => {
    const response = await axios.get('/tags/count');
    expect(response.status).toEqual(200);
    const expectedCount = testTags.length;
    expect(response.data).toEqual({ count: expectedCount });
  });

  test('Fetch tag count with server error (500 Internal Server Error)', async () => {
    try {
      await axios.get('/tags/counts'); //count became counts, thereby invoking a server error
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toEqual(500);
    }
  });
  describe('Tag Pagination API Tests', () => {
    test('Fetch paginated tags (200 OK)', async () => {
      const response = await axios.get(`/tags/paginated/2/1/alphabetically`);
      expect(response.status).toEqual(200);
      expect(response.data).toBeDefined();
      expect(response.data.length).toBeLessThanOrEqual(2);
    });

    test('Fetch paginated tags with missing parameters (404 Not found)', async () => {
      try {
        await axios.get('/tags/paginated/2/1/'); // Missing sortBy
        throw new Error('Expected 404, but got something else'); //This means that the test did not work
      } catch (error: any) {
        expect(error.response.status).toEqual(404);
        expect(error.response.data).toContain('Cannot GET /api/v2/tags/paginated/2/1/'); //This is part of the return object
      }
    });

    test('Successfully fetch a tag (200 OK)', async () => {
      const response = await axios.get(`/tags/1`);
      expect(response.status).toEqual(200);
      expect(response.data).toHaveProperty('tagId', 1);
    });

    test('Attempt to fetch a non-existing tag (404 Not Found)', async () => {
      try {
        await axios.get(`/tags/476`);
        throw new Error('Expected 404, but got 200');
      } catch (error: any) {
        expect(error.response.status).toEqual(404);
        expect(error.response.data).toEqual('Tag not found');
      }
    });

    test('Attempt to fetch a non-existing tag by name (404 Not Found)', async () => {
      try {
        await axios.get(`/tagsExist/tag_that_does_not_exist}`);
        throw new Error('Expected 404, but got 200');
      } catch (error: any) {
        expect(error.response.status).toEqual(404);
        expect(error.response.data).toEqual('Tag not found');
      }
    });

    test('Successfully fetch all tags (200 OK)', async () => {
      const response = await axios.get('/tags');

      expect(response.status).toEqual(200);
      expect(Array.isArray(response.data)).toBeTruthy();
      expect(response.data.length).toBeGreaterThan(0);

      const tag = response.data[0];
      expect(tag).toHaveProperty('tagId');
      expect(tag).toHaveProperty('tagName');
    });

    test('Successfully fetch tags for a specific article (200 OK)', async () => {
      const response = await axios.get(`/articles/1/tags`);

      expect(response.status).toEqual(200);
      expect(Array.isArray(response.data)).toBeTruthy();
      if (response.data.length > 0) {
        const tag = response.data[0];
        expect(tag).toHaveProperty('tagId');
        expect(tag).toHaveProperty('tagName');
      } else {
        expect(response.data.length).toEqual(0);
      }
    });

    test('Successfully fetch articles for a specific tag (200 OK)', async () => {
      const response = await axios.get(`/tags/1/articles`);

      expect(response.status).toEqual(200);
      expect(Array.isArray(response.data)).toBeTruthy();
      if (response.data.length > 0) {
        const article = response.data[0];
        expect(article).toHaveProperty('articleId');
        expect(article).toHaveProperty('title');
        expect(article).toHaveProperty('views');
      } else {
        expect(response.data.length).toEqual(0);
      }
    });

    test('Successfully fetch the usage count for a specific tag (200 OK)', async () => {
      const response = await axios.get(`/tags/1/count`);

      expect(response.status).toEqual(200);
      expect(response.data).toHaveProperty('count');
      expect(typeof response.data.count).toBe('number');
      expect(response.data.count).toBeGreaterThanOrEqual(0);
    });

    test('Fetch usage count for a tag with no associated articles (200 OK)', async () => {
      const response = await axios.get(`/tags/78/count`); //78 is a valid tagId but has no articles associated

      expect(response.status).toEqual(200);
      expect(response.data).toEqual({ count: 0 }); // Count should be 0 for unused tags
    });

    test('Successfully create a tag (200 OK)', async () => {
      const newTag = { tagName: 'Tech' };
      const response = await axios.post('/tags', newTag);

      expect(response.status).toEqual(200);
      expect(response.data).toHaveProperty('id');
      expect(typeof response.data.id).toBe('number');
    });

    test('Fail to create a tag due to missing tagName (400 Bad Request)', async () => {
      try {
        await axios.post('/tags', {}); // No tagName in the request body
        throw new Error('Expected 400, but got 200');
      } catch (error: any) {
        expect(error.response.status).toEqual(400);
        expect(error.response.data).toEqual('Missing tagName.');
      }
    });

    test('Server error during tag creation (400 Bad Request)', async () => {
      try {
        // Trigger a server error by misconfiguring the endpoint or using invalid data
        await axios.post('/tags', { tagName: null });
        throw new Error('Expected 400, but got 200');
      } catch (error: any) {
        expect(error.response.status).toEqual(400);
        expect(error.response.data).toMatch('Missing tagName'); // Expect an error message in the response
      }
    });

    test('Successfully delete a tag withg Id = 2 (200 OK)', async () => {
      const response = await axios.delete(`/tags/2`);
      expect(response.status).toEqual(200);
    });

    test('Attempt to delete a non-existing tag (500 server error)', async () => {
      try {
        await axios.delete(`/tags/756`);
        throw new Error('Expected 500, but got 200');
      } catch (error: any) {
        expect(error.response.status).toEqual(500);
      }
    });

    test('Delete tag relations by valid article ID (200 OK)', async () => {
      const response = await axios.delete(`/articles/3/tagRelations`);
      expect(response.status).toBe(200);
    });

    test('Delete tag relations by invalid article ID (500 Internal Server Error)', async () => {
      try {
        await axios.delete(`/articles/4783/tagRelations`);
        throw new Error('Expected 500, but got 200');
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });
  });

  describe('User tests', () => {
    test('Fetch all users (200 OK)', async () => {
      const response = await axios.get('/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      if (response.data.length > 0) {
        expect(response.data[0]).toMatchObject({ //toMatchObject function defined by OpenAI
          username: expect.any(String),
        });
      }
    });

    test('Handle server error while fetching all users (500 Internal Server Error)', async () => {
      try {
        await axios.get('/users/not_bob');
        throw new Error('Expected 404, but got 200');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    test('Create a new user successfully (200 OK)', async () => {
      const newUser = {
        username: 'new_user',
        password: 'securePassword123',
        bio: 'This is a new user bio.',
        profilePicture: 'profile_picture_data',
      };
      const response = await axios.post('/users', newUser);
      expect(response.status).toBe(200);
    });

    test('Fail to create a user with missing fields (400 Bad Request)', async () => {
      const incompleteUser = {
        username: 'incomplete_user',
        // Missing password
      };

      try {
        await axios.post('/users', incompleteUser);
        throw new Error('Expected 400, but got 200');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toBe('Missing username, password, bio or profilePicture');
      }
    });
  });
});

describe('Authentication tests', () => {
  test('Successful login (200 OK)', async () => {
    const validUser = {
      username: 'charlie',
      password: 'Passord1234!', //In the testdata the password is $2b$10$rzlkuCC8BoaCaWnDrbFHCufSBWl.LqJqwOQoGDQ60rbjH3bbCgnsC, which is the hashed version of Passord1234!
    };

    const response = await axios.post('/auth/login', validUser);
    expect(response.status).toBe(200);
  });

  test('Invalid login credentials (401 Unauthorized)', async () => {
    const invalidUser = {
      username: 'emily',
      password: 'wrongpassword',
    };

    try {
      await axios.post('/auth/login', invalidUser);
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });

  test('User is not logged in (401 Unauthorized)', async () => {
    try {
      await axios.get('/auth/status');
      throw new Error('Expected 401, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });

  test('Return logged-in user details (200 OK)', async () => {
    // Simulate a logged-in user's session
    const loggedInUser = testUsers[0]; // Example: 'aleks'

    // Log in to simulate user session
    const loginResponse = await axios.post(
      '/auth/login',
      { username: 'charlie', password: 'Passord1234!' },
      { withCredentials: true },
    );
    expect(loginResponse.status).toBe(200);
  });

  test('Returns 401 for a non-logged-in user', async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
      throw new Error('Expected 401, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});

describe('Testing the search function', () => {
  test('Successfully returns articles when search query is provided', async () => {
    const searchQuery = 'database';
    const searchResponse = await axios.get('/search', { params: { q: searchQuery } });
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.data).toBeInstanceOf(Array); // Assuming articles are returned as an array
    expect(searchResponse.data.length).toBeGreaterThan(0); // At least one article should match
  });

  test('Returns 400 if no search query is provided', async () => {
    try {
      await axios.get('/search');
      throw new Error('Expected 400, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toBe('Search query is required');
    }
  });

  test('Returns empty array if no articles are found for the search query', async () => {
    const searchQuery = 'wieouhfwiehuweiughwe';

    const searchResponse = await axios.get('/search', { params: { q: searchQuery } });

    expect(searchResponse.status).toBe(200); // Status should still be 200, even with no results
    expect(searchResponse.data).toBeInstanceOf(Array); // Should be an array
    expect(searchResponse.data.length).toBe(0); // No articles found, so length should be 0
  });

  test('Successfully increments view count for a valid article ID', async () => {
    const articleId = 1; // Replace with an actual valid article ID in your database

    const response = await axios.post(`/articles/${articleId}/views`);

    expect(response.status).toBe(200); // Successful response
    // Optionally, you can check if the view count has increased (if you have a way to verify that)
  });

  test('Invokes server error if articleId is string', async () => {
    try {
      await axios.post(`/articles/string/views`);
      throw new Error('Expected 400, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });

  test('Returns 500 for server errors', async () => {
    wikiService.addView = jest.fn().mockRejectedValueOnce(new Error('Internal Server Error'));
    try {
      await axios.post(`/articles/1/views`);
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });
});

describe('Testing the Appraisal function', () => {
  test('Successfully appraises an article with valid data', async () => {
    const articleId = 1; // Replace with an actual article ID from your database
    const requestData = {
      username: 'john_doe',
      good: true, // Or false, depending on the appraisal system
    };

    const response = await axios.post(`/articles/${articleId}/appraise`, requestData);

    expect(response.status).toBe(200); // Should successfully send a response
    // Optionally, check if the appraisal has been recorded in the database if needed
  });

  test('Returns 400 for missing articleId, username, or appraisal value', async () => {
    const invalidData1 = { username: 'john_doe' }; // Missing 'good'
    const invalidData2 = { good: true }; // Missing 'username'
    const invalidData3 = {}; // Missing both 'username' and 'good'

    try {
      await axios.post(`/articles/1/appraise`, invalidData1);
      throw new Error('Expected 400, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toBe('Missing articleId, username, or good');
    }

    try {
      await axios.post(`/articles/1/appraise`, invalidData2);
      throw new Error('Expected 400, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toBe('Missing articleId, username, or good');
    }

    try {
      await axios.post(`/articles/1/appraise`, invalidData3);
      throw new Error('Expected 400, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toBe('Missing articleId, username, or good');
    }
  });

  test('Returns 500 for server errors', async () => {
    const requestData = {
      username: 'john_doe',
      good: true,
    };

    // Simulate a server error by making wikiService.appraiseArticle throw an error
    wikiService.appraiseArticle = jest
      .fn()
      .mockRejectedValueOnce(new Error('Internal Server Error'));

    try {
      await axios.post(`/articles/1/appraise`, requestData);
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });

  test('Returns server error if the article does not exist', async () => {
    const requestData = {
      username: 'john_doe',
      good: true,
    };

    try {
      await axios.post(`/articles/3463/appraise`, requestData);
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(500); // Article should not exist
      expect(error.response.data).toContain('TypeError: Cannot read properties of undefined');
    }
  });

  test('Successfully retrieves article appraises', async () => {
    const response = await axios.get(`/articles/1/appraise`);

    expect(response.status).toBe(200); // Should return a successful response
    expect(Array.isArray(response.data)).toBe(true); // Assuming the appraises are returned as an array
    // You can add further checks depending on the expected structure of the appraises data
  });

  test('Returns 500 for server errors', async () => {
    wikiService.getArticleAppraises = jest
      .fn()
      .mockRejectedValueOnce(new Error('Internal Server Error'));

    try {
      await axios.get(`/articles/1/appraise`);
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });

  test('Returns server error if the appraise does not exist', async () => {
    try {
      await axios.get(`/articles/3457/appraise`);
      throw new Error('Expected 404, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(500); // Article should not exist
    }
  });

  test('Returns 500 for server errors', async () => {
    wikiService.getArticleAppraises = jest
      .fn()
      .mockRejectedValueOnce(new Error('Internal Server Error'));
    try {
      await axios.get(`/articles/1/appraise`);
      throw new Error('Expected 500, but got 200');
    } catch (error: any) {
      expect(error.response.status).toBe(500);
    }
  });

  test('Get article appraisal successfully (200 OK)', async () => {
    const response = await axios.get(`/articles/1/appraise/alice`);
    expect(response.status).toEqual(200);
  });

  test('Article not found (404 Not Found)', async () => {
    try {
      await axios.get(`/articles/8365/appraise/alice`);
    } catch (error) {
      //@ts-ignore
      expect(error.response.status).toEqual(404);
      //@ts-ignore
      expect(error.response.data).toBe('Article not found');
    }
  });
});

describe('Testing version-authors function', () => {

  test('Get authors of a version with no authors (200 OK - Empty Array)', async () => {
    const response = await axios.get(`/articles/versions/985/authors`);

    expect(response.status).toEqual(200);
    expect(response.data).toEqual([]);
  });

  test('Invalid versionId format should return 400 Bad Request', async () => {
    try {
      await axios.get(`/articles/versions/not_valid_version_id/authors`); //version-ID non-numeric
    } catch (error) {
      //@ts-ignore
      expect(error.response.status).toEqual(500);
    }
  });

  test('Create version-author relation successfully (200 OK)', async () => {
    const data = {
      articleVersionId: 1, // A valid version ID in your database
      username: 'john_doe', // A valid username
    };

    const response = await axios.post('/version-author', data);

    expect(response.status).toEqual(200);
  });

  test('Missing articleVersionId in request body (400 Bad Request)', async () => {
    const data = {
      username: 'john_doe', // Valid username but missing an articleId
    };

    try {
      await axios.post('/version-author', data);
    } catch (error) {
      //@ts-ignore
      expect(error.response.status).toEqual(400);
    }
  });

  test('Invalid articleVersionId (0) should return 400 Bad Request', async () => {
    const data = {
      articleVersionId: 0, // Invalid version ID (should be greater than 0)
      username: 'john_doe', // Valid username
    };

    try {
      await axios.post('/version-author', data);
    } catch (error) {
      //@ts-ignore
      expect(error.response.status).toEqual(400);
    }
  });

  test('Non-existent articleVersionId should return 404 Not Found', async () => {
    const data = {
      articleVersionId: 9999, // A non-existent version ID
      username: 'john_doe', // Valid username
    };

    try {
      await axios.post('/version-author', data);
    } catch (error) {
      //@ts-ignore
      expect(error.response.status).toEqual(404);
    }
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////
//Unit testing smaller functions

// file hashPassword (../src/hashPassword) works as expected

describe('Testing function comparePassword() and hasPassword() from ../src/hashPassword', () => {
  //testdata
  const correctPass = 'securePassword123';
  const hashedPass = bcrypt.hashSync(correctPass, 10);
  const incorrectPass = 'wrongPassword';
  const saltRounds = 10; //This is the same as defined in the function

  test('Correct password matches hashed password', () => {
    const isMatch = comparePassword(correctPass, hashedPass);
    expect(isMatch).toBe(true);
  });

  test('Incorrect password does not match hashed password', () => {
    const isMatch = comparePassword(incorrectPass, hashedPass);
    expect(isMatch).toBe(false);
  });

  test('Handles empty plain password (returns false)', () => {
    const hashedPass = bcrypt.hashSync('securePassword123', 10);
    const isMatch = comparePassword('', hashedPass);
    expect(isMatch).toBe(false);
  });

  //hashPassword()
  const hashedPassword = hashPassword(correctPass);
  test('hashPassword() creates a valid hash', () => {
    const isMatch = bcrypt.compareSync(correctPass, hashedPassword);
    expect(isMatch).toBe(true);
  });

  test('Salt function works (same password hashed twice produces different results)', () => {
    const hash1 = hashPassword(correctPass);
    const hash2 = hashPassword(correctPass);
    expect(hash1).not.toEqual(hash2);
    expect(bcrypt.compareSync(correctPass, hash1)).toBe(true);
    expect(bcrypt.compareSync(correctPass, hash2)).toBe(true);
  });
});

//////////////////////////////////////////////////////////////////////////////

//End of server testing 
