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
    image: string | undefined;
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
  }
  
  export class User {
    username: string = '';
    password: string = '';
    profilePicture: string | undefined;
    bio: string = '';
  }
  
  export class ArticleTag {
    tagId: number = 0;
    articleId: number = 0;
  }
  
  export class Appraisal {
    articleId: number = 0;
    username: string = '';
    good: boolean = false;
  }
  
  export class ArticleVersionAuthor {
    articleVersionId: number = 0;
    username: string = '';
  }