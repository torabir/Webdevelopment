import axios from 'axios';
import { Article, User, Comment, ArticleVersion, Tag, Appraisal } from '../classes';
import { resolvePath } from 'react-router-dom-v5-compat';

axios.defaults.baseURL = 'http://localhost:3000/api/v2';

//This is the client version of task-service. This is the middle man between the UI and the database.
//We are using the Axios framework and most of these calls are created by copying previous calls. not a lot of creativity
//For the calls that require nothing new, AI was used to generate, but they were always checked by us before being implemented.
class WikiService {
  /**
   * Get task with given id.
   */
  getArticle(articleId: number) {
    return axios.get<Article>('/articles/' + articleId).then((response) => response.data);
  }

  getArticleByTitle(title: string) {
    return axios.get<Article>('/articlesExist/' + title).then((response) => response.data);
  }

  /**
   * Get all tasks.
   */
  getAllArticles() {
    return axios.get<Article[]>('/articles').then((response) => response.data);
  }

  getPaginatedArticles(page: number, pageSize: number, sortBy: string) {
    return axios
      .get<Article[]>('/articles/paginated/' + pageSize + '/' + page + '/' + sortBy)
      .then((response) => response.data);
  }

  getPaginatedTags(page: number, pageSize: number, sortBy: string) {
    return axios
      .get<Tag[]>('/tags/paginated/' + pageSize + '/' + page + '/' + sortBy)
      .then((response) => response.data);
  }

  getCountArticles() {
    return axios.get<any>('/articles/count').then((response) => response.data);
  }

  getCountTags() {
    return axios.get<any>('/tags/count').then((response) => response.data);
  }

  /**
   * Create new task having the given title.
   *
   * Resolves the newly created task id.
   */
  createArticle(
    title: string,
    content: string,
    date: string,
    image: any,
  ): Promise<number> {
    return axios
      .post('/articles/', { title, content, date, image }) //Unsure if this should be /articles or /articles/:id
      .then((response) => {
        return response.data; // returnerer artikkelId som database nettopp har lagd
      });
  }

  updateArticleTitle(articleId: number, title: string): Promise<void> {
    return axios.post('/articles/' + articleId + '/edit/title', { title }).then((_response) => {});
  }

  deleteArticle(articleId: number): Promise<void> {
    console.log(articleId);
    return axios.delete('/articles/' + articleId).then((response) => {
      response.data;
    }); //Do not need response.data, but no harm including it
  }

  getVersion(versionId: number, articleId: number): Promise<ArticleVersion> {
    return axios.get('/articles/' + articleId + '/versions/' + versionId).then((response) => {
      return response.data;
    });
  }

  getAllVersions(article_id: number): Promise<ArticleVersion[]> {
    //This is not really useful as we want the versions of a specific article
    {
      return axios.get<ArticleVersion[]>('/versions').then((response) => response.data);
    }
  }

  getArticleVersions(articleId: number) {
    console.log('Axios: getting path' + '/articles/' + articleId + '/versions');
    return axios

      .get<ArticleVersion[]>('/articles/' + articleId + '/versions')
      .then((response) => response.data);
  }

  createVersion(
    articleId: number,
    version: number,
    content: string,
    title: string,
    date: string,
    image: any,
  ): Promise<any> {
    console.log(
      `Data passed to Axios: ${articleId}, ${version} ${content}, ${title}, ${date}, image not included`,
    );

    return axios
      .post(`/articles/${articleId}/versions`, {
        articleId,
        version,
        content,
        title,
        date,
        image,
      })
      .then((response) => {
        console.log('Axios response:', response.data);
        return response.data;
      })
      .catch((error) => {
        if (error.response) {
          console.error(
            'Axios server error response:',
            error.response.data,
            'Status:',
            error.response.status,
          );
        } else if (error.request) {
          console.error('Axios no response:', error.request);
        } else {
          console.error('Axios general error:', error.message);
        }
        throw error;
      });
  }

  deleteVersion(versionId: number, article_id: number): Promise<void> {
    return axios.delete('/article/' + article_id + '/' + versionId).then((response) => {
      response.data;
    });
  }

  getComment(commentId: number, article_id: number): Promise<Comment | undefined> {
    return axios
      .get<Comment>('/articles/' + article_id + '/' + commentId)
      .then((response) => response.data);
  }

  //These should be made as we need them, hard to predict the exact API end-nodes
  getArticleComments(articleId: number) {
    return axios
      .get<Comment[]>(`/articles/${articleId}/comments`)
      .then((response) => response.data);
  }
  createComment(articleId: number, username: string, commentText: string, commentDate: string) {
    const lastUpdated = commentDate;

    return axios
      .post('/comments', { articleId, username, commentText, commentDate, lastUpdated })
      .then((response) => response.data.id);
  }
  getUserComments(username: string) {
    return axios.get<Comment[]>(`/profile/${username}/comments`).then((response) => response.data);
  }

  getUserArticles(username: string) {
    return axios
      .get<ArticleVersion[]>(`/profile/${username}/articles`)
      .then((response) => response.data);
  }

  updateComment(commentId: number, commentText: string) {
    return axios.put(`/comments/${commentId}`, { commentText }).then((response) => response.data);
  }

  deleteComment(commentId: number): Promise<void> {
    return axios.delete('/comments/' + commentId).then((response) => {
      response.data;
    });
  }

  getAllTags() {
    return axios.get<Tag[]>('/tags').then((response) => response.data);
  }

  getArticleTags(articleId: number) {
    return axios.get<Tag[]>('/articles/' + articleId + '/tags').then((response) => response.data);
  }

  getArticlesByTag(tagId: number) {
    return axios.get<Article[]>(`/tags/${tagId}/articles`).then((response) => response.data);
  }

  getTag(tagId: number): Promise<Tag> {
    return axios.get<Tag>(`/tags/${tagId}`).then((response) => response.data);
  }

  getTagByName(tagName: string): Promise<Tag> {
    return axios.get<Tag>(`/tagsExist/${tagName}`).then((response) => response.data);
  }

  createTag(tagName: string) {
    return axios.post('/tags/', { tagName }).then((response) => {
      return response.data.id; // akkurat denne linjen er fra chat gpt, returnerer tag id som databasen har skapt
    });
  }

  createTagRelation(tagId: number, articleId: number) {
    return axios.post('/article-tags/', { tagId, articleId }).then((response) => {
      response.data;
    });
  }

  getTagUsageCount(tagId: number) {
    return axios.get<any>(`/tags/${tagId}/count`).then((response) => response.data);
  }

  deleteTag(tagId: number) {}

  getUser(username: string) {
    return axios.get<User>('/users/' + username).then((response) => response.data);
  }

  getAllUsers() {
    return axios.get<User[]>('/users').then((response) => response.data);
  }

  createUser(username: string, password: string, bio: string, profilePicture: string) {
    console.log('createUser called with:', { username, password, bio, profilePicture }); // Log argumenter
    return axios.post('/users/', { username, password, bio, profilePicture }).then((response) => {
      response.data;
    });
  }

  getAuthenticatedUser() {
    return axios.get<User>('/auth/status').then((response) => response.data);
  }

  loginUser(username: string, password: string) {
    return axios.post('/auth/login', { username, password }).then((response) => {
      response.data;
    });
  }

  deleteUser(username: string) {
    return axios.delete('/profile/' + username).then((response) => {
      return response.data;
    });
  }

  resetUserPassword(username: string, newPassword: string) {
    console.log('From axios: username sent: ' + username + 'Password sent: ' + newPassword);
    return axios
      .put(`/profile/${username}/reset-password`, { newPassword })
      .then((response) => response.data);
  }

  logoutUser() {
    return axios.post('/auth/logout', {}).then((response) => {
      response.data;
    });
  }

  searchArticles(searchWord: string) {
    return axios
      .get<Article[]>(`/search?q=${encodeURIComponent(searchWord)}`)
      .then((response) => response.data);
  }

  addView(articleId: number) {
    return axios.post('/articles/' + articleId + '/views').then((response) => response.data);
  }

  appraiseArticle(articleId: number, username: string, good: boolean): Promise<void> {
    return axios
      .post('/articles/' + articleId + '/appraise', { username, good })
      .then((response) => {
        response.data;
      });
  }

  getArticleAppraisals(articleId: number) {
    return axios
      .get<Appraisal[]>('/articles/' + articleId + '/appraise')
      .then((response) => response.data);
  }

  getUserAppraisal(articleId: number, username: string) {
    return axios
      .get<Appraisal>('/articles/' + articleId + '/appraise/' + username)
      .then((response) => response.data);
  }

  countAppraisals(articleId: number) {
    return axios
      .get<any>('/articles/' + articleId + '/appraise/count')
      .then((response) => response.data);
  }

  countGoodAppraisals(articleId: number) {
    return axios
      .get<any>('/articles/' + articleId + '/appraise/good/count')
      .then((response) => response.data);
  }

  deleteTagRelationsByArticleId(articleId: number): Promise<void> {
    return axios.delete('/articles/' + articleId + '/tagRelations').then((response) => {
      response.data;
    });
  }

  editUser(username: string, bio: string, profilePicture: string) {
    return axios.post('/users/' + username + '/edit', { bio, profilePicture }).then((response) => {
      response.data;
    });
  }

  getUserProfilePic(username: string) {
    return axios
      .get<any>('/users/' + username + '/profilePicture')
      .then((response) => response.data);
  }

  createVersionAuthor(articleVersionId: number, username: string) {
    return axios.post('/version-author', { articleVersionId, username }).then((response) => {
      response.data;
    });
  }

  getVersionAuthors(versionId: number) {
    return axios
      .get<[]>('/articles/versions/' + versionId + '/authors')
      .then((response) => response.data);
  }
}

const wikiService = new WikiService();
export default wikiService;

//The last two lines enable us to use this service anywhere in the application.