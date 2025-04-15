//This is a very important file as it defined the entire _test database
//Structure was made by us, dummy-data was created by OpenAI
//The structure of these array's reflect the strucutre of the database so these can be used for testing purposes


import { Article } from '../src/classes';
import { ArticleVersion } from '../src/classes';
import { Comment } from '../src/classes';
import { Tag } from '../src/classes';
import { User } from '../src/classes';
import { ArticleTag } from '../src/classes';
import { Appraisal } from '../src/classes';
import { ArticleVersionAuthor } from '../src/classes';

import { testImageData } from './testImageData';

export let testArticles: Article[] = [
  {
    articleId: 1,
    currentVersion: 1,
    title: 'Introduction to Databases',
    views: 32,
  },
  {
    articleId: 2,
    currentVersion: 3,
    title: 'Advanced Database Design',
    views: 2200,
  },
  {
    articleId: 3,
    currentVersion: 2,
    title: 'SQL Query Optimization Techniques',
    views: 0,
  },
  {
    articleId: 4,
    currentVersion: 1,
    title: 'Database Indexing Basics',
    views: 1500,
  },
  {
    articleId: 5,
    currentVersion: 6,
    title: 'NoSQL vs. SQL Databases',
    views: 3,
  },
];
export let testArticleVersions: ArticleVersion[] = [
  {
    versionId: 1,
    articleId: 1,
    version: 1,
    title: 'Introduction to Databases',
    content: 'This is the hardest Database-course',
    image: testImageData,
    username: 'Bob',
    versionDate: '2024-11-04 13:00:00',
  },
  {
    versionId: 2,
    articleId: 2,
    version: 1,
    title: 'Advanced Database Design',
    content: 'Some content about database design',
    image: testImageData,
    username: 'Charlie',
    versionDate: '2024-11-04 13:00:00',
  },
  {
    versionId: 3,
    articleId: 3,
    version: 1,
    title: 'SQL Query Optimization Techniques',
    content: 'Content on SQL optimization techniques',
    image: testImageData,
    username: 'Delta',
    versionDate: '2024-11-04 13:00:00',
  },
  {
    versionId: 4,
    articleId: 4,
    version: 1,
    title: 'Database Indexing Basics',
    content: 'Introduction to indexing in databases',
    image: testImageData,
    username: 'Erling',
    versionDate: '2024-11-04 13:00:00',
  },
  {
    versionId: 5,
    articleId: 5,
    version: 1,
    title: 'NoSQL vs. SQL Databases',
    content: 'Content comparing NoSQL and SQL databases',
    image: testImageData,
    username: 'Farhad',
    versionDate: '2024-11-04 13:00:00',
  },
];

export const testComments: Comment[] = [
  {
    commentId: 1,
    articleId: 1,
    username: 'bob',
    commentText: 'Fantastic introduction to databases!',
    commentDate: '2024-11-01 09:45:00',
    lastUpdated: '2024-11-01 09:45:00',
  },
  {
    commentId: 2,
    articleId: 2,
    username: 'john_doe',
    commentText: 'Loved the insights on database design.',
    commentDate: '2024-11-02 14:20:00',
    lastUpdated: '2024-11-02 14:20:00',
  },
  {
    commentId: 3,
    articleId: 3,
    username: 'sarah',
    commentText: 'This article on optimization is very detailed.',
    commentDate: '2024-11-03 11:00:00',
    lastUpdated: '2024-11-03 11:00:00',
  },
  {
    commentId: 4,
    articleId: 3,
    username: 'bob',
    commentText: 'This article on normalization cleared up many questions!',
    commentDate: '2024-10-23 10:15:00',
    lastUpdated: '2024-10-23 10:15:00',
  },
  {
    commentId: 5,
    articleId: 5,
    username: 'mary_j',
    commentText: 'Interesting comparison between NoSQL and SQL databases.',
    commentDate: '2024-10-25 16:45:00',
    lastUpdated: '2024-10-25 16:45:00',
  },
];

export const testTags: Tag[] = [
  {
    tagId: 1,
    tagName: 'SQL',
  },
  {
    tagId: 2,
    tagName: 'NoSQL',
  },
  {
    tagId: 3,
    tagName: 'Database Design',
  },
  {
    tagId: 4,
    tagName: 'Normalization',
  },
  {
    tagId: 5,
    tagName: 'Indexing',
  },
];

export const testUsers: User[] = [
  {
    username: 'aleks',
    password: '$2b$10$C0snPTqdhqKLN/cASloul.TdTSLKeGwgpOQ4au1zqGj', // hashed password
    profilePicture: testImageData, // Assuming 'testImageData' contains the image data
    bio: "Hey, I'm Aleks, a passionate developer and database enthusiast!",
  },
  {
    username: 'bob',
    password: '$2b$10$K7PojZZPMnpnD.aFg2ZEMe1vTxKjFlYg1N0VjlmOqsO', // hashed password
    profilePicture: testImageData, // Assuming 'testImageData' contains the image data
    bio: 'Bob here! I love coding, gaming, and exploring new technologies.',
  },
  {
    username: 'charlie',
    password: '$2b$10$rzlkuCC8BoaCaWnDrbFHCufSBWl.LqJqwOQoGDQ60rbjH3bbCgnsC', // hashed password
    profilePicture: testImageData,
    bio: 'Charlie, a web developer with a passion for front-end development!',
  },
  {
    username: 'diana',
    password: '$2b$10$E5Gop3WwLbmVYFvPtJ5YXeHrHgHPOjwKtJFLZ3QReNK', // hashed password
    profilePicture: testImageData,
    bio: 'Diana, a software engineer working on scalable and secure systems.',
  },
  {
    username: 'emily',
    password: '$2b$10$M2Xf5l9yS.q1Zwl.bFxsZ.G9uLyCdb8WVkLp.dOF1sO', // hashed password
    profilePicture: testImageData,
    bio: "Hi, I'm Emily! I specialize in backend development and cloud computing.",
  },
];

export let testArticleTags: { tagId: number; articleId: number }[] = [
  { tagId: 1, articleId: 1 }, // SQL tag for "Introduction to Databases"
  { tagId: 3, articleId: 1 }, // Database Design tag for "Introduction to Databases"
  { tagId: 1, articleId: 2 }, // SQL tag for "Advanced Database Design"
  { tagId: 3, articleId: 2 }, // Database Design tag for "Advanced Database Design"
  { tagId: 1, articleId: 3 }, // SQL tag for "SQL Query Optimization Techniques"
  { tagId: 4, articleId: 3 }, // Normalization tag for "SQL Query Optimization Techniques"
  { tagId: 5, articleId: 4 }, // Indexing tag for "Database Indexing Basics"
  { tagId: 1, articleId: 5 }, // SQL tag for "NoSQL vs. SQL Databases"
  { tagId: 2, articleId: 5 }, // NoSQL tag for "NoSQL vs. SQL Databases"
];

export const testAppraisals: Appraisal[] = [
  {
    articleId: 1,
    username: 'aleks',
    good: true,
  },
  {
    articleId: 1,
    username: 'bob',
    good: false,
  },
  {
    articleId: 2,
    username: 'charlie',
    good: true,
  },
  {
    articleId: 3,
    username: 'diana',
    good: false,
  },
  {
    articleId: 4,
    username: 'emily',
    good: true,
  },
  {
    articleId: 5,
    username: 'bob',
    good: true,
  },
];

export const testArticleVersionAuthors: ArticleVersionAuthor[] = [
  {
    articleVersionId: 1,
    username: 'aleks',
  },
  {
    articleVersionId: 2,
    username: 'bob',
  },
  {
    articleVersionId: 3,
    username: 'charlie',
  },
  {
    articleVersionId: 4,
    username: 'diana',
  },
  {
    articleVersionId: 5,
    username: 'emily',
  },
];
