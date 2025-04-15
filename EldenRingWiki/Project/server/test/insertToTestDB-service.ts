import { hashPassword } from '../src/helpers/hashPassword';
import pool from '../src/config/mysql-pool';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

// insert database functions to create testData
class TestService {
  // Insert into Article
  insertArticle(articleId: number, currentVersion: number, title: string, views: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO Article (articleId, currentVersion, title, views) VALUES (?, ?, ?, ?)',
        [articleId, currentVersion, title, views],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  // Insert into ArticleVersion
  insertArticleVersion(
    versionId: number,
    articleId: number,
    version: number,
    title: string,
    content: string,
    image: ArrayBuffer | String | null,
    username: string,
    versionDate: string,
  ) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO ArticleVersions (versionId, articleId, version, title, content, image, username, versionDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [versionId, articleId, version, title, content, image, username, versionDate],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);

          resolve();
          console.log('version with ');
        },
      );
    });
  }

  insertTag(tagId: number, tagName: string) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO Tags (tagId, tagName) VALUES (?, ?)',
        [tagId, tagName],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }

  // Insert into Users table
  insertUser(
    username: string,
    password: string,
    profilePicture: ArrayBuffer | String | null,
    bio: string,
  ) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO Users (username, password, profilePicture, bio) VALUES (?, ?, ?, ?)',
        [username, password, profilePicture, bio],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }

  // Insert into Comments table
  insertComment(
    commentId: number,
    articleId: number,
    username: string,
    commentText: string,
    commentDate: string,
    lastUpdated: string,
  ) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO Comments (commentId, articleId, username, commentText, commentDate, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)',
        [commentId, articleId, username, commentText, commentDate, lastUpdated],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }

  // Insert into ArticleTags table
  insertArticleTag(tagId: number, articleId: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO ArticleTags (tagId, articleId) VALUES (?, ?)',
        [tagId, articleId],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }

  // Insert into ArticleVersionAuthors
  insertArticleVersionAuthor(articleVersionId: number, username: string) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO ArticleVersionAuthors (articleVersionId, username) VALUES (?, ?)',
        [articleVersionId, username],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }

  // Insert into Appraisals table
  insertAppraisal(articleId: number, username: string, good: boolean) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO Appraisals (articleId, username, good) VALUES (?, ?, ?)',
        [articleId, username, good],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }
}

const testService = new TestService();
export default testService;
