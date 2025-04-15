import express, { request } from 'express';
import wikiService from '../services/wiki-service';
import { hashPassword } from '../helpers/hashPassword';
import passport from '../helpers/local-strategy';
import { User } from '../classes';

/**
 * Express router containing wiki methods.
 */
const router = express.Router();

// ARTICLE

// NEED TO STAY ON TOP TO AVOID PROBLEMS
router.get('/articles/count', (_request, response) => {
  wikiService
    .countArticles()
    .then((count) => response.json({ count }))
    .catch((error) => response.status(500).json({ error: error.message }));
});

// NEED TO STAY ON TOP TO AVOID PROBLEMS
router.get('/tags/count', (_request, response) => {
  wikiService
    .countTags()
    .then((count) => response.json({ count }))
    .catch((error) => response.status(500).json({ error: error.message }));
});

// APPRAISALS

// NEED TO STAY ON TOP TO AVOID PROBLEMS (i think)
router.get('/articles/:id/appraise/count', (request, response) => {
  const id = Number(request.params.id);

  wikiService
    .countAppraisals(id)
    .then((count) => response.json({ count }))
    .catch((error) => response.status(500).json({ error: error.message }));
});

// NEED TO STAY ON TOP TO AVOID PROBLEMS (i think)
router.get('/articles/:id/appraise/good/count', (request, response) => {
  const id = Number(request.params.id);

  wikiService
    .countGoodAppraisals(id)
    .then((count) => response.json({ count }))
    .catch((error) => response.status(500).json({ error: error.message }));
});

router.get('/articles', (_request, response) => {
  wikiService
    .getAllArticles()
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

router.get('/articles/:id', (request, response) => {
  const id = Number(request.params.id);
  wikiService
    .getArticle(id)
    .then((article) =>
      article ? response.send(article) : response.status(404).send('Article not found'),
    )
    .catch((error) => response.status(500).send(error));
});

router.get('/articlesExist/:title', (request, response) => {
  const title = String(request.params.title);
  wikiService
    .getArticleByTitle(title)
    .then((article) =>
      article ? response.send(article) : response.status(404).send('Article not found'),
    )
    .catch((error) => response.status(500).send(error));
});

router.get('/articles/paginated/:pageSize/:page/:sortBy', (request, response) => {
  const pageSize = Number(request.params.pageSize);
  const page = Number(request.params.page);
  const sortBy = String(request.params.sortBy);

  if (page && pageSize && sortBy && sortBy.length != 0) {
    const offset = (Number(page) - 1) * Number(pageSize); // formel hentet fra chatGPT, tips om å bruke Number() er også fra chatGPT fordi man får error hvis ikke
    let orderBy = 'views DESC';
    if (sortBy === 'alphabetically') {
      orderBy = 'title ASC';
    }

    wikiService
      .getPaginatedArticles(Number(pageSize), offset, orderBy)
      .then((article) =>
        article ? response.send(article) : response.status(404).send('Articles not found'),
      )
      .catch((error) => response.status(500).send(error));
  } else {
    response.status(400).send('Missing pagesize, page or sortBy');
  }
});

router.get('/tags/paginated/:pageSize/:page/:sortBy', (request, response) => {
  const pageSize = Number(request.params.pageSize);
  const page = Number(request.params.page);
  const sortBy = String(request.params.sortBy);

  if (page && pageSize && sortBy && sortBy.length != 0) {
    const offset = (Number(page) - 1) * Number(pageSize); // formel hentet fra chatGPT, tips om å bruke Number() er også fra chatGPT fordi man får error hvis ikke
    let orderBy = 'tagName ASC';
    if (sortBy === 'alphabetically') {
      orderBy = 'tagName ASC';
    }

    wikiService
      .getPaginatedTags(Number(pageSize), offset, orderBy)
      .then((tags) => (tags ? response.send(tags) : response.status(404).send('Tags not found')))
      .catch((error) => response.status(500).send(error));
  } else {
    response.status(400).send('Missing pagesize, page or sortBy');
  }
});

router.post('/articles', (request, response) => {
  const data = request.body;
  if (
    data &&
    data.title &&
    data.title.length != 0 &&
    data.content &&
    data.content.length != 0 &&
    data.date &&
    data.date.length != 0
  )
    wikiService
      .createArticle(data.title, data.content, data.date, data.image)
      .then(({ articleId, versionId }) => {
        response.status(201).send({ articleId, versionId });
      })
      .catch((error) => response.status(500).send(error));
  else response.status(400).send('Missing article title, content or date');
});

router.post('/articles/:id/edit/title', (request, response) => {
  const id = Number(request.params.id);
  const data = request.body;
  if (data && data.title && data.title.length != 0 && id && id != 0)
    wikiService
      .updateArticleTitle(id, data.title)
      .then(() => response.send())
      .catch((error) => response.status(500).send(error));
  else response.status(400).send('Missing articleId or title');
});

router.delete('/articles/:id', (request, response) => {
  wikiService
    .deleteArticle(Number(request.params.id))
    .then((_result) => response.send())
    .catch((error) => response.status(404).send(error));
});

// VERSIONS

router.get('/articles/:id/versions/:versionId', (request, response) => {
  const id = Number(request.params.id);
  wikiService
    .getVersion(id)
    .then((row) => {
      if (row && row.image) {
        const bufferString = row.image.toString(); // got this line with help from chatGPT
        row.image = bufferString;
        response.send(row);
      } else {
        response.status(404).send('Version not found');
      }
    })
    .catch((error) => response.status(500).send(error));
});

router.get('/versions', (_request, response) => {
  wikiService
    .getAllVersions()
    .then((rows) => {
      rows.map((r) => {
        if (r.image != null) {
          const bufferString = r.image.toString(); // got this line with help from chatGPT
          r.image = bufferString;
        }
      });
      response.send(rows);
    })
    .catch((error) => response.status(500).send(error));
});

router.get('/articles/:articleId/versions', (request, response) => {
  const id = Number(request.params.articleId);
  wikiService
    .getArticleVersions(id)
    .then((rows) => {
      if (!rows || rows.length === 0) {
        //This line was added while writing tests because it did not handle 404 errors
        return response.status(404).send('Article versions not found');
      }

      rows.map((r) => {
        if (r.image != null) {
          const bufferString = r.image.toString(); // got this line with help from chatGPT
          r.image = bufferString;
        }
      });
      response.send(rows);
    })
    .catch((error) => response.status(500).send(error));
});

router.post('/articles/:articleId/versions', (request, response) => {
  const data = request.body;
  const articleId = Number(request.params.articleId);

  if (
    articleId &&
    articleId != 0 &&
    data.title &&
    data.title.length != 0 &&
    data.content &&
    data.content.length != 0 &&
    data.date &&
    data.date.length != 0 &&
    data.version
  ) {
    wikiService
      .createVersion(articleId, data.version, data.content, data.title, data.date, data.image)
      .then((id) => response.send({ id: id }))
      .catch((error) => response.status(500).send(error));
  } else {
    response
      .status(400)
      .send('Missing required fields: articleId, title, content, username, date, or version.');
  }
});

router.delete('/article/:id/version/versionId', (request, response) => {
  wikiService
    .deleteVersion(Number(request.params.id))
    .then((_result) => response.send())
    .catch((error) => response.status(500).send(error));
});

// COMMENTS

router.get('/comments/:id', (request, response) => {
  const id = Number(request.params.id);
  wikiService
    .getComment(id)
    .then((comment) =>
      comment ? response.send(comment) : response.status(404).send('Comment not found'),
    )
    .catch((error) => response.status(500).send(error));
});

router.get('/comments', (_request, response) => {
  wikiService
    .getAllComments()
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

router.put('/comments/:id', (request, response) => {
  const commentId = Number(request.params.id);
  const { commentText } = request.body;

  if (!commentText || commentText.trim() === '') {
    return response.status(400).send('Comment text cannot be empty');
  }

  wikiService
    .updateComment(commentId, commentText)
    .then(() => response.send({ message: 'Comment updated successfully' }))
    .catch((error) => response.status(500).send(error));
});

router.get('/articles/:id/comments', (request, response) => {
  const id = Number(request.params.id);
  wikiService
    .getArticleComments(id)
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

router.post('/comments', (request, response) => {
  const data = request.body;
  if (
    data &&
    data.articleId &&
    data.articleId != 0 &&
    data.username &&
    data.username.length != 0 &&
    data.commentText &&
    data.commentText.length != 0 &&
    data.commentDate &&
    data.lastUpdated
  )
    wikiService
      .createComment(
        data.articleId,
        data.username,
        data.commentText,
        data.commentDate,
        data.lastUpdated,
      )
      .then((id) => response.send({ id: id }))
      .catch((error) => response.status(500).send(error));
  else
    response
      .status(400)
      .send('Missing article id, username, commentText, commentDate or lastUpdated.');
});

router.delete('/comments/:id', (request, response) => {
  wikiService
    .deleteComment(Number(request.params.id))
    .then((_result) => response.send())
    .catch((error) => response.status(500).send(error));
});

//Profile page
router.get('/profile/:username/articles', (request, response) => {
  const username = String(request.params.username);
  wikiService
    .getAllUserArticles(username)
    .then((articles) =>
      articles ? response.send(articles) : response.status(404).send('User not found'),
    )
    .catch((error) => response.status(500).send(error));
});

router.get('/profile/:username/comments', (request, response) => {
  const username = String(request.params.username);
  wikiService
    .getUserComments(username)
    .then((comments) =>
      comments ? response.send(comments) : response.status(404).send('No comments found'),
    )
    .catch((error) => response.status(500).send(error));
});

router.put('/profile/:username/reset-password', (request, response) => {
  const username = request.params.username;
  const new_password = request.body.newPassword;

  wikiService
    .resetPassword(username, new_password)
    .then(() => response.send({ message: 'Password updated successfully' }))
    .catch((error) => response.status(500).send(error));
});

router.delete('/profile/:username', (request, response) => {
  wikiService
    .deleteUser(String(request.params.username))
    .then(() => response.send({ message: 'User deleted succesfully' }))
    .catch((error) => response.status(500).send(error));
});

// TAG

router.get('/tags/:id', (request, response) => {
  const id = Number(request.params.id);
  wikiService
    .getTag(id)
    .then((tag) => (tag ? response.send(tag) : response.status(404).send('Tag not found')))
    .catch((error) => response.status(500).send(error));
});

router.get('/tagsExist/:tagName', (request, response) => {
  const name = String(request.params.tagName);
  wikiService
    .getTagByName(name)
    .then((tag) => (tag ? response.send(tag) : response.status(404).send('Tag not found')))
    .catch((error) => response.status(500).send(error));
});

router.get('/tags', (_request, response) => {
  wikiService
    .getAllTags()
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

router.get('/articles/:id/tags', (request, response) => {
  const id = Number(request.params.id);
  wikiService
    .getArticleTags(id)
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

router.get('/tags/:id/articles', (request, response) => {
  const tagId = Number(request.params.id);
  wikiService
    .getArticlesByTag(tagId)
    .then((articles) => response.send(articles))
    .catch((error) => response.status(500).send(error));
});

router.get('/tags/:id/count', (request, response) => {
  const tagId = Number(request.params.id);
  wikiService
    .getTagUsageCount(tagId)
    .then((count) => response.json({ count }))
    .catch((error) => response.status(500).send(error));
});

router.post('/tags', (request, response) => {
  const data = request.body;
  console.log(data);
  if (data && data.tagName && data.tagName.length != 0)
    wikiService
      .createTag(data.tagName)
      .then((id) => response.send({ id: id }))
      .catch((error) => response.status(500).send(error));
  else response.status(400).send('Missing tagName.');
});

router.post('/article-tags', (request, response) => {
  const data = request.body;
  if (data && data.tagId && data.tagId != 0 && data.articleId && data.articleId != 0)
    wikiService
      .createTagRelation(data.tagId, data.articleId)
      .then((_result) => response.send())
      .catch((error) => response.status(500).send(error));
  else response.status(400).send('Missing tagId or articleId.');
});

router.delete('/tags/:id', (request, response) => {
  wikiService
    .deleteTag(Number(request.params.id))
    .then((_result) => response.send())
    .catch((error) => response.status(500).send(error));
});

router.delete('/articles/:id/tagRelations', (request, response) => {
  const id = Number(request.params.id);
  console.log('trying to delete relation with article id ' + id);
  wikiService
    .deleteTagRelationsByArticleId(id)
    .then((_result) => response.send())
    .catch((error) => response.status(500).send(error));
});

// USER

router.get('/users/:username/profilePicture', (request, response) => {
  const username = String(request.params.username);
  wikiService
    .getUserProfilePic(username)
    // we convert the array / buffer we got from the database into a string again (base64)
    .then((row) => {
      if (row && row.profilePicture) {
        const bufferString = row.profilePicture.toString(); // got this line with help from chatGPT
        row.profilePicture = bufferString;
        response.send(row);
      } else {
        response.status(404).send('Version not found');
      }
    })
    .catch((error) => response.status(500).send(error));
});

router.get('/users/:username', (request, response) => {
  const username = String(request.params.username);
  wikiService
    .getUser(username)
    // we convert the array / buffer we got from the database into a string again (base64)
    .then((row) => {
      if (row && row.profilePicture) {
        const bufferString = row.profilePicture.toString(); // got this line with help from chatGPT
        row.profilePicture = bufferString;
        response.send(row);
      } else {
        response.status(404).send('Version not found');
      }
    })
    .catch((error) => response.status(500).send(error));
});

router.get('/users', (_request, response) => {
  wikiService
    .getAllUsers()
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

router.post('/users', (request, response) => {
  const data = request.body;
  if (
    data &&
    data.username &&
    data.username.length != 0 &&
    data.password &&
    data.password.length != 0 &&
    data.profilePicture &&
    data.profilePicture.length != 0
  ) {
    data.password = hashPassword(data.password);

    wikiService
      .createUser(data.username, data.password, data.bio, data.profilePicture)
      .then((_result) => response.send())
      .catch((error) => response.status(500).send(error));
  } else response.status(400).send('Missing username, password, bio or profilePicture');
});

router.post('/users/:username/edit', (request, response) => {
  const username = String(request.params.username);
  const data = request.body;
  if (
    data &&
    username &&
    username.length != 0 &&
    data.profilePicture &&
    data.profilePicture.length != 0
  ) {
    wikiService
      .editUser(username, data.bio, data.profilePicture)
      .then((_result) => response.send())
      .catch((error) => response.status(500).send(error));
  } else response.status(400).send('Missing username, bio or profilePicture');
});

// BRUKER INTERGRASJON
//DELER AV KODE HENTET FRA YOUTUBE: https://www.youtube.com/watch?v=_lZUq39FGv0

//LOGGE INN
router.post('/auth/login', passport.authenticate('local'), (request, response) => {
  return response.sendStatus(200);
});

// HENTE BRUKER
router.get('/auth/status', (request, response) => {
  //console.log('Inside /login/status endpoint');
  //console.log(request.user);
  //console.log(request.session);
  if (request.user) return response.send(request.user);
  else return response.sendStatus(401);
});

// LOGGE UT
router.post('/auth/logout', (request, response) => {
  if (!request.user) return response.sendStatus(401);

  request.logout((error) => {
    if (error) return response.status(400);
    response.send(200);
  });
});

// SEARCH

router.get('/search', (request, response) => {
  const searchWord = request.query.q as string; // Henter søkeordet fra URL-parameteren

  if (!searchWord) {
    return response.status(400).send('Search query is required');
  }

  // Kall til tjenesten for å finne artikler basert på søkeordet
  wikiService
    .searchArticles(searchWord)
    .then((articles) => response.send(articles))
    .catch((error) => response.status(500).send(error));
});

// Add view

router.post('/articles/:id/views', (request, response) => {
  wikiService
    .addView(Number(request.params.id))
    .then((_result) => response.send())
    .catch((error) => response.status(500).send(error));
});

// appraise article

router.post('/articles/:id/appraise', (request, response) => {
  const articleId = Number(request.params.id);
  const data = request.body;
  if (data && data.username && data.good != undefined)
    wikiService
      .appraiseArticle(articleId, data.username, data.good)
      .then(() => response.send())
      .catch((error) => response.status(500).send(error));
  else response.status(400).send('Missing articleId, username, or good');
});

// get appraisals

router.get('/articles/:id/appraise', (request, response) => {
  const id = Number(request.params.id);
  wikiService
    .getArticleAppraises(id)
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

router.get('/articles/:id/appraise/:username', (request, response) => {
  const id = Number(request.params.id);
  const username = String(request.params.username);
  wikiService
    .getUserAppraisal(id, username)
    .then((row) => response.send(row))
    .catch((error) => response.status(500).send(error));
});

router.post('/version-author', (request, response) => {
  const data = request.body;
  if (
    data &&
    data.articleVersionId &&
    data.articleVersionId != 0 &&
    data.username &&
    data.username.length != 0
  )
    wikiService
      .createVersionAuthorRelation(data.articleVersionId, data.username)
      .then((_result) => response.send())
      .catch((error) => response.status(500).send(error));
  else response.status(400).send('Missing articleVersionId or username.');
});

router.get('/articles/versions/:versionId/authors', (request, response) => {
  const id = Number(request.params.versionId);
  wikiService
    .getVersionAuthorsById(id)
    .then((rows) => response.send(rows))
    .catch((error) => response.status(500).send(error));
});

export default router;
