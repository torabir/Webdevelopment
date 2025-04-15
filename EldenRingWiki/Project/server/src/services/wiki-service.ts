import { hashPassword } from '../helpers/hashPassword';
import pool from '../config/mysql-pool';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

import { Article, Comment, Tag, User, ArticleVersion, Appraisal } from '../classes';

class WikiService {
  // ARTICLE FUNCTIONS:

  //get:

  countArticles() {
    return new Promise<number>((resolve, reject) => {
      pool.query('SELECT COUNT(*) AS count FROM Article', (error, results: RowDataPacket[]) => {
        if (error) {
          return reject(error); // Reject the promise on error
        }

        const articleCount = results[0].count; // Ensure the result is defined
        if (articleCount === undefined) {
          return reject(new Error('Unexpected result format'));
        }

        resolve(articleCount); // Resolve with the count
      });
    });
  }

  countTags() {
    return new Promise<number>((resolve, reject) => {
      pool.query('SELECT COUNT(*) AS count FROM Tags', (error, results: RowDataPacket[]) => {
        if (error) {
          return reject(error);
        }

        const tagsCount = results[0].count; // Ensure the result is defined
        if (tagsCount === undefined) {
          return reject(new Error('Unexpected result format'));
        }

        resolve(tagsCount);
      });
    });
  }

  updateArticleTitle(articleId: number, title: string) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        `UPDATE Article 
         SET title = ?
         WHERE articleId = ?`,
        [title, articleId],
        (error, _results: ResultSetHeader) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  getArticle(id: number) {
    return new Promise<Article | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Article WHERE articleId = ?',
        [id],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as Article);
        },
      );
    });
  }

  getArticleByTitle(title: string) {
    return new Promise<Article | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Article WHERE title = ?',
        [title],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as Article);
        },
      );
    });
  }

  getAllArticles() {
    return new Promise<Article[]>((resolve, reject) => {
      pool.query('SELECT * FROM Article', (error, results: RowDataPacket[]) => {
        if (error) return reject(error);

        resolve(results as Article[]);
      });
    });
  }

  getArticlesByTag(tagId: number): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
      const query = `
        SELECT DISTINCT Article.*
        FROM Article
        JOIN ArticleTags ON Article.articleId = ArticleTags.articleId
        WHERE ArticleTags.tagId = ?
      `;
      //This query was made by using the JOIN function as we learned in IDATT2002
      pool.query(query, [tagId], (error, results: RowDataPacket[]) => {
        if (error) return reject(error);
        resolve(results as Article[]);
      });
    });
  }

  //The SQL statement was reviewed by GPT
  //We need to ensure that each distinct articleId only occurs once in the query (As a user can be author to many versions)
  getAllUserArticles(username: string) {
    return new Promise<ArticleVersion[]>((resolve, reject) => {
      pool.query(
        `SELECT * 
      FROM ArticleVersions av
      LEFT JOIN ArticleVersionAuthors ava ON av.versionId = ava.articleVersionId
      WHERE username = ?`,
        [username, username],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);
          resolve(results as ArticleVersion[]);
        },
      );
    });
  }

  getPaginatedArticles(pageSize: number, offset: number, orderBy: string) {
    return new Promise<Article[]>((resolve, reject) => {
      pool.query(
        `SELECT * FROM Article ORDER BY ${orderBy} LIMIT ? OFFSET ?`, // sql spørring hentet fra chatGPT
        [pageSize, offset],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Article[]);
        },
      );
    });
  }

  getPaginatedTags(pageSize: number, offset: number, orderBy: string) {
    return new Promise<Tag[]>((resolve, reject) => {
      pool.query(
        `SELECT * FROM Tags ORDER BY ${orderBy} LIMIT ? OFFSET ?`, // sql spørring hentet fra chatGPT
        [pageSize, offset],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Tag[]);
        },
      );
    });
  }

  //create:

  // kommet frem til den neste funksjonen ved hjelp av chatGpt og https://www.w3resource.com/typescript-exercises/typescript-error-handling-exercise-12.php og også meg selv
  // gjør en transaksjon slit at man hvis man får en feil så ender man IKKE med å endre kun på 1 av tabellene
  // async fordi databasekallene må skje i riktig rekkefølge
  //
  // har byttet ut den tidligere funksjonen med hjelp av chatgpt
  //erstatter transaksjoner med at vi sletter det vi evt har laget upon error
  async createArticle(
    title: string,
    content: string,
    date: string,
    image: ArrayBuffer | string | null,
  ): Promise<{ articleId: number; versionId: number }> {
    const currentVersion = 1;
    const views = 0;
    let articleId: number | null = null;
    let versionId: number | null = null;

    try {
      // Først oppretter vi selve artikkelen
      articleId = await new Promise<number>((resolve, reject) => {
        pool.query(
          'INSERT INTO Article (currentVersion, title, views) VALUES (?, ?, ?)',
          [currentVersion, title, views],
          (error, results: ResultSetHeader) => {
            if (error) return reject(error);
            resolve(results.insertId);
          },
        );
      });

      // Deretter oppretter vi den første versjonen av artikkelen
      versionId = await new Promise<number>((resolve, reject) => {
        pool.query(
          'INSERT INTO ArticleVersions (articleId, version, title, content, versionDate, image) VALUES (?, ?, ?, ?, ?, ?)',
          [articleId, currentVersion, title, content, date, image],
          (error, results: ResultSetHeader) => {
            if (error) return reject(error);
            resolve(results.insertId);
          },
        );
      });

      console.log('Article created successfully.');
      return { articleId, versionId };
    } catch (error) {
      console.error(`Error: ${error}`);

      // Hvis artikkelen ble opprettet, men versjonen feilet, sletter vi artikkelen
      if (articleId !== null) {
        await new Promise<void>((resolve, reject) => {
          pool.query('DELETE FROM Article WHERE articleId = ?', [articleId], (deleteError) => {
            if (deleteError) return reject(deleteError);
            resolve();
          });
        });
      }

      throw new Error(`Failed to create article: ${error}`);
    }
  }

  // delete:

  // sletting av en artikkel vil også føre til sletting av artikkelens versjoner i ARTICLE_VERSIONS, pga ON DELETE CASCADE
  deleteArticle(articleId: number) {
    console.log(`Trying to delete article with ID: ${articleId}`);
    //This function was developed by us, but rewritten by GPT to include more error handling

    return new Promise<void>((resolve, reject) => {
      // Delete from Appraisals
      pool.query(
        'DELETE FROM Appraisals WHERE articleId = ?;',
        [articleId],
        (error, results: ResultSetHeader) => {
          if (error) {
            console.error(`Failed to delete from Appraisals for articleId: ${articleId}`, error);
            return reject(error);
          }
          if (results.affectedRows === 0) {
            console.warn(`No rows deleted in Appraisals for articleId: ${articleId}`);
          }

          // Delete from ArticleTags
          pool.query(
            'DELETE FROM ArticleTags WHERE articleId = ?;',
            [articleId],
            (error, results: ResultSetHeader) => {
              if (error) {
                console.error(
                  `Failed to delete from ArticleTags for articleId: ${articleId}`,
                  error,
                );
                return reject(error);
              }
              if (results.affectedRows === 0) {
                console.warn(`No rows deleted in ArticleTags for articleId: ${articleId}`);
              }

              // Delete from Comments
              pool.query(
                'DELETE FROM Comments WHERE articleId = ?;',
                [articleId],
                (error, results: ResultSetHeader) => {
                  if (error) {
                    console.error(
                      `Failed to delete from Comments for articleId: ${articleId}`,
                      error,
                    );
                    return reject(error);
                  }
                  if (results.affectedRows === 0) {
                    console.warn(`No rows deleted in Comments for articleId: ${articleId}`);
                  }
                  // Disable foreign key checks to allow deletion even with foreign key constraints
                  pool.query('SET foreign_key_checks = 0;', (error) => {
                    if (error) {
                      console.error('Failed to disable foreign key checks', error);
                      return reject(error);
                    }
                    // Delete from ArticleVersions
                    pool.query(
                      'DELETE FROM ArticleVersions WHERE articleId = ?;',
                      [articleId],
                      (error, results: ResultSetHeader) => {
                        if (error) {
                          console.error(
                            `Failed to delete from ArticleVersions for articleId: ${articleId}`,
                            error,
                          );
                          return reject(error);
                        }
                        if (results.affectedRows === 0) {
                          console.warn(
                            `No rows deleted in ArticleVersions for articleId: ${articleId}`,
                          );
                        }

                        // Finally, delete from Article
                        pool.query(
                          'DELETE FROM Article WHERE articleId = ?;',
                          [articleId],
                          (error, results: ResultSetHeader) => {
                            if (error) {
                              console.error(
                                `Failed to delete from Article for articleId: ${articleId}`,
                                error,
                              );
                              return reject(error);
                            }
                            if (results.affectedRows === 0) {
                              console.warn(
                                `No rows deleted in Article for articleId: ${articleId}`,
                              );
                              return reject(new Error('No rows deleted in Article'));
                            }

                            console.log(`Successfully deleted article with ID: ${articleId}`);

                            // Enable foreign key checks after the deletion process
                            pool.query('SET foreign_key_checks = 1;', (error) => {
                              if (error) {
                                console.error('Failed to enable foreign key checks', error);
                                return reject(error);
                              }
                              resolve();
                            });
                          },
                        );
                      },
                    );
                  });
                },
              );
            },
          );
        },
      );
    });
  }
  deleteUser(username: string) {
    console.log(`Trying to delete user with username: ${username}`);

    return new Promise<void>((resolve, reject) => {
      pool.query(
        'DELETE FROM Users WHERE username = ?;',
        [username],
        (error, results: ResultSetHeader) => {
          if (error) {
            console.error(`Failed to delete user with username: ${username}`, error);
            return reject(error);
          }
          if (results.affectedRows === 0) {
            console.warn(`No user found with username: ${username}`);
            return reject(new Error('No user found to delete'));
          }

          console.log(`Successfully deleted user with username: ${username}`);
          resolve();
        },
      );
    });
  }

  resetPassword(username: string, newPassword: string) {
    return new Promise<void>((resolve, reject) => {
      let password_hashed = hashPassword(newPassword); //Using the hashPassword function made in server/src/hashPassword
      pool.query(
        'UPDATE Users SET password = ? WHERE username = ?',
        [password_hashed, username],
        (error, results: ResultSetHeader) => {
          if (error) return reject(error);
          if (results.affectedRows === 0)
            return reject(new Error('No user found to reset password'));
          resolve();
        },
      );
    });
  }

  // VERSION FUNCTIONS:

  // get:

  getVersion(versionId: number) {
    return new Promise<ArticleVersion | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM ArticleVersions WHERE versionId = ?',
        [versionId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as ArticleVersion);
        },
      );
    });
  }

  getAllVersions() {
    return new Promise<ArticleVersion[]>((resolve, reject) => {
      pool.query('SELECT * FROM ArticleVersions', (error, results: RowDataPacket[]) => {
        if (error) return reject(error);

        resolve(results as ArticleVersion[]);
      });
    });
  }

  getArticleVersions(articleId: number) {
    return new Promise<ArticleVersion[]>((resolve, reject) => {
      pool.query(
        'SELECT * FROM ArticleVersions WHERE articleId = ?',
        [articleId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as ArticleVersion[]);
        },
      );
    });
  }

  // create:

  // kommet frem til den neste funksjonen ved hjelp av chatGpt og https://www.w3resource.com/typescript-exercises/typescript-error-handling-exercise-12.php og også meg selv
  // gjør en transaksjon slit at man hvis man får en feil så ender man IKKE med å endre kun på 1 av tabellene
  // async fordi databasekallene må skje i riktig rekkefølge
  // dette er det samme som edit
  //
  //her har jeg fått chatgpt til å skrive om den funksjonen som sto her tidligere:
  async createVersion(
    articleId: number,
    version: number,
    content: string,
    title: string,
    date: string,
    image: any,
  ) {
    return new Promise<number>((resolve, reject) => {
      // Insert new version into ArticleVersions
      pool.query(
        `INSERT INTO ArticleVersions (articleId, version, title, content, versionDate, image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [articleId, version, title, content, date, image],
        (error, results: ResultSetHeader) => {
          if (error) return reject(error);

          const insertedId = results.insertId;

          // Update the current version in Article table
          pool.query(
            `UPDATE Article 
             SET currentVersion = (SELECT MAX(version) FROM ArticleVersions WHERE articleId = ?)
             WHERE articleId = ?`,
            [articleId, articleId],
            (updateError) => {
              if (updateError) return reject(updateError);

              resolve(insertedId);
            },
          );
        },
      );
    });
  }

  //delete:

  deleteVersion(versionId: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'DELETE FROM ArticleVersions WHERE versionId = ?',
        [versionId],
        (error, results: ResultSetHeader) => {
          if (error) return reject(error);
          if (results.affectedRows == 0) return reject(new Error('No row deleted'));

          resolve();
        },
      );
    });
  }

  // COMMENT FUNCTIONS

  // get:

  getComment(commentId: number) {
    return new Promise<Comment | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Comments WHERE commentId = ?',
        [commentId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as Comment);
        },
      );
    });
  }

  getAllComments() {
    return new Promise<Comment[]>((resolve, reject) => {
      pool.query('SELECT * FROM Comments', (error, results: RowDataPacket[]) => {
        if (error) return reject(error);

        resolve(results as Comment[]);
      });
    });
  }

  getArticleComments(articleId: number) {
    return new Promise<Comment[] | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Comments WHERE articleId = ?',
        [articleId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Comment[]);
        },
      );
    });
  }

  getUserComments(username: string) {
    return new Promise<Comment[] | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Comments WHERE username = ?',
        [username],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Comment[]);
        },
      );
    });
  }

  // update:

  updateComment(commentId: number, commentText: string) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'UPDATE Comments SET commentText = ?, lastUpdated = NOW() WHERE commentId = ?',
        [commentText, commentId],
        (error, results: ResultSetHeader) => {
          if (error) return reject(error);
          if (results.affectedRows === 0) return reject(new Error('No comment found to update'));

          resolve();
        },
      );
    });
  }

  // create:

  createComment(
    articleId: number,
    username: string,
    commentText: string,
    commentDate: string,
    lastUpdated: string,
  ) {
    return new Promise<number>((resolve, reject) => {
      pool.query(
        'INSERT INTO Comments (articleId, username, commentText, commentDate, lastUpdated) VALUES (?, ?, ?, ?, ?)',
        [articleId, username, commentText, commentDate, lastUpdated],
        (error, results: ResultSetHeader) => {
          if (error) return reject(error);

          resolve(results.insertId);
        },
      );
    });
  }

  // delete:

  deleteComment(commentId: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'DELETE FROM Comments WHERE commentId = ?',
        [commentId],
        (error, results: ResultSetHeader) => {
          if (error) return reject(error);
          if (results.affectedRows == 0) return reject(new Error('No row deleted'));

          resolve();
        },
      );
    });
  }

  // GET FUNCTIONS

  // get:

  getTag(tagId: number) {
    return new Promise<Tag | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Tags WHERE tagId = ?',
        [tagId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as Tag);
        },
      );
    });
  }

  getTagByName(tagName: string) {
    return new Promise<Tag | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Tags WHERE tagName = ?',
        [tagName],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as Tag);
        },
      );
    });
  }

  getAllTags() {
    return new Promise<Tag[]>((resolve, reject) => {
      pool.query('SELECT * FROM Tags', (error, results: RowDataPacket[]) => {
        if (error) return reject(error);

        resolve(results as Tag[]);
      });
    });
  }

  getArticleTags(articleId: number) {
    return new Promise<Tag[] | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Tags INNER JOIN ArticleTags ON Tags.tagId = ArticleTags.tagId WHERE articleId = ?',
        [articleId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Tag[]);
        },
      );
    });
  }

  getTagUsageCount(tagId: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM ArticleTags
        WHERE tagId = ?
      `;

      pool.query(query, [tagId], (error, results: RowDataPacket[]) => {
        if (error) return reject(error);
        resolve(results[0].count);
      });
    });
  }

  // create:

  createTag(tagName: string) {
    return new Promise<number>((resolve, reject) => {
      pool.query(
        'INSERT INTO Tags (tagName) VALUES (?)',
        [tagName],
        (error, results: ResultSetHeader) => {
          if (error) return reject(error);

          resolve(results.insertId);
        },
      );
    });
  }

  createTagRelation(tagId: number, articleId: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO ArticleTags (tagId, articleId) VALUES (?, ?)',
        [tagId, articleId],
        (error) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  // delete:

  deleteTag(tagId: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query('DELETE FROM Tags WHERE tagId = ?', [tagId], (error, results: ResultSetHeader) => {
        if (error) return reject(error);
        if (results.affectedRows == 0) return reject(new Error('No row deleted'));

        resolve();
      });
    });
  }

  deleteTagRelationsByArticleId(articleId: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'DELETE FROM ArticleTags WHERE articleId = ?',
        [articleId],
        (error, results: ResultSetHeader) => {
          if (error) return reject(error);
          if (results.affectedRows == 0) return reject(new Error('No row deleted'));

          resolve();
        },
      );
    });
  }

  // USERS:

  getUser(username: string) {
    return new Promise<User | undefined>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Users WHERE username = ?',
        [username],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as User);
        },
      );
    });
  }

  getAllUsers() {
    return new Promise<User[]>((resolve, reject) => {
      pool.query('SELECT * FROM Users', (error, results: RowDataPacket[]) => {
        if (error) return reject(error);

        resolve(results as User[]);
      });
    });
  }

  getUserProfilePic(username: string) {
    return new Promise<RowDataPacket | null>((resolve, reject) => {
      pool.query(
        'SELECT profilePicture FROM Users WHERE username = ?',
        [username],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);
          if (results.length === 0) return resolve(null);
          resolve(results[0]);
        },
      );
    });
  }

  // edit:

  editUser(username: string, bio: string, profilePicture: string) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'UPDATE Users SET profilePicture = ?, bio = ? WHERE username = ?',
        [profilePicture, bio, username],
        (error, _results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  // create:

  createUser(username: string, password: string, bio: string, profilePicture: string) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO Users (username, password, bio, profilePicture) VALUES (?, ?, ?, ?)',
        [username, password, bio, profilePicture],
        (error) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  // SEARCH
  // Vi bruker LEFT JOIN for å koble ARTICLE- og TAGS-tabellene via ARTICLE_TAGS.
  // Dette lar oss søke i begge feltene.
  // LIKE-operatoren brukes med '%${searchWord}%' for å søke etter deltreff i både title og tagName.

  searchArticles(searchWord: string): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
      const query = `
      SELECT DISTINCT Article.articleId, Article.currentVersion, Article.title, Article.views
      FROM Article
      LEFT JOIN ArticleTags ON Article.articleId = ArticleTags.articleId
      LEFT JOIN Tags ON ArticleTags.tagId = Tags.tagId
      WHERE Article.title LIKE ? OR Tags.tagName LIKE ?
    `;

      const searchTerm = `%${searchWord}%`;

      pool.query(query, [searchTerm, searchTerm], (error, results: RowDataPacket[]) => {
        if (error) return reject(error);
        resolve(results as Article[]);
      });
    });
  }

  // Add View

  addView(articleId: number) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'UPDATE Article SET views = views + 1 WHERE articleId = ?',
        [articleId],
        (error, _results: ResultSetHeader[]) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  // appraise article

  appraiseArticle(articleId: number, username: string, good: boolean) {
    return new Promise<void>((resolve, reject) => {
      pool.query(
        'INSERT INTO Appraisals (articleId, username, good) VALUES (?, ?, ?)',
        [articleId, username, good],
        (error, _results: ResultSetHeader[]) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  // get appraises

  // denne brukes ikke atm
  getArticleAppraises(articleId: number) {
    return new Promise<Appraisal[]>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Appraisals WHERE articleId = ?',
        [articleId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as Appraisal[]);
        },
      );
    });
  }

  countAppraisals(articleId: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM Appraisals
        WHERE articleId = ?
      `;

      pool.query(query, [articleId], (error, results: RowDataPacket[]) => {
        if (error) return reject(error);
        resolve(results[0].count);
      });
    });
  }

  countGoodAppraisals(articleId: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count
        FROM Appraisals
        WHERE articleId = ? AND good = true
      `;

      pool.query(query, [articleId], (error, results: RowDataPacket[]) => {
        if (error) return reject(error);
        resolve(results[0].count);
      });
    });
  }

  getUserAppraisal(articleId: number, username: string) {
    return new Promise<Appraisal>((resolve, reject) => {
      pool.query(
        'SELECT * FROM Appraisals WHERE articleId = ? AND username = ?',
        [articleId, username],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results[0] as Appraisal);
        },
      );
    });
  }

  createVersionAuthorRelation(articleVersionId: number, username: string) {
    return new Promise<void>((resolve, reject) => {
      console.log(typeof articleVersionId);
      console.log(typeof username);
      pool.query(
        'INSERT INTO ArticleVersionAuthors (articleVersionId, username) VALUES (?, ?)',
        [articleVersionId, username],
        (error) => {
          if (error) return reject(error);

          resolve();
        },
      );
    });
  }

  getVersionAuthorsById(versionId: number) {
    return new Promise<RowDataPacket[]>((resolve, reject) => {
      pool.query(
        'SELECT username FROM ArticleVersionAuthors WHERE articleVersionId = ?',
        [versionId],
        (error, results: RowDataPacket[]) => {
          if (error) return reject(error);

          resolve(results as RowDataPacket[]);
        },
      );
    });
  }
}

const wikiService = new WikiService();
export default wikiService;
