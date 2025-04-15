//This file is at the bottom of our framework and it is where we defined the classes 
//required by our database.


import { defaultProfilePic } from './images/defaultProfilePic';

export class Article {
  articleId: number = 0;
  title: string = '';
  currentVersion: number = 0;
  views: number = 0;
}

export class ArticleVersion {
  versionId: number = 0;
  articleId: number = 0;
  version: number = 0;
  title: string = '';
  content: string = '';
  image: string | undefined; // tips about using Buffer is from chatgpt
  username: string = '';
  versionDate: string = '';
}

export class Comment {
  commentId: number = 0;
  articleId: number = 0;
  username: string = '';
  commentText: string = '';
  commentDate: string = '';
  lastUpdated: string = '';
}

export class Tag {
  tagId: number = 0;
  tagName: string = '';
  usageCount?: number;
}

export class User {
  username: string = '';
  password: string = '';
  bio: string = '';
  profilePicture: string = defaultProfilePic;
}

export class Appraisal {
  articleId: number = 0;
  username: string = '';
  good: boolean = false;
}
