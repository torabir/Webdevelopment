import type http from 'http';
import type https from 'https';
import WebSocket from 'ws';

export interface DataMessage {
  type:
    | 'message'
    | 'user-list'
    | 'title-update'
    | 'content-update'
    | 'image-update'
    | 'tags-update'
    | 'register'
    | 'request-user-list'
    | 'created-article';
  username?: string;
  users?: string[];
  title?: string;
  content?: any;
  allContent?: string;
  image?: string;
  tags?: string;
  text?: string;
  id?: number;
}

interface UserListMessage {
  type: 'user-list';
  users: string[];
}

interface TitleMessage {
  type: 'title-update';
  title: string;
}

interface ContentMessage {
  type: 'content-update';
  content: string;
}

interface TagsMessage {
  type: 'tags-update';
  tags: string;
}

interface ImageMessage {
  type: 'image-update';
  image: string;
}

interface CreatedMessage {
  type: 'created-article';
}

interface Client {
  connection: WebSocket;
  username: string;
}

// MÅTEN JEG DELER OPP ARTIKKEL DATAEN UNDER ULIKE SESSIONS ER BASERT PÅ KODE JEG HAR FÅTT FRA CHAT GPT

export default class EditArticleServer {
  private sessions: { [articleId: string]: Client[] } = {};
  private articleData: {
    [articleId: string]: {
      title: string;
      content: any;
      allContent: string;
      tags: string;
      image: string;
    };
  } = {}; //Handling different articles isolated

  constructor(webServer: http.Server | https.Server, path: string) {
    const server = new WebSocket.Server({ server: webServer, path: path + '/editarticle' });

    server.on('connection', (connection) => {
      let username: string | undefined;
      let articleId: number | undefined;

      connection.on('message', (message) => {
        try {
          const parsedMessage: DataMessage = JSON.parse(message.toString());

          // Register user for article edit
          if (parsedMessage.type === 'register' && parsedMessage.id && parsedMessage.username) {
            console.log('registering');
            articleId = parsedMessage.id;
            username = parsedMessage.username;

            if (!this.sessions[articleId]) {
              this.sessions[articleId] = [];
              this.articleData[articleId] = {
                title: '',
                content: [],
                allContent: '',
                tags: '',
                image: '',
              };
            } // creating a sessions if it doesnt already exist

            this.sessions[articleId].push({ connection, username });
            console.log(`${username} joined article: ${articleId}`);

            this.broadcastUserList(articleId);
            this.sendArticleContent(connection, articleId);
          } else if (parsedMessage.type === 'register') {
            connection.send(
              JSON.stringify({ type: 'error', message: 'Missing articleID or username' }),
            );
            return;
          }

          // Handle title update
          if (parsedMessage.type === 'title-update' && articleId && parsedMessage.title) {
            this.articleData[articleId].title = parsedMessage.title;
            this.broadcastTitleUpdate(articleId);
          }

          // Handle article being created
          if (parsedMessage.type === 'created-article' && articleId) {
            this.broadcastCreatedArticle(articleId);
          }

          // Handle content update
          if (parsedMessage.type === 'content-update' && articleId && parsedMessage.content) {
            this.articleData[articleId].allContent =
              parsedMessage.allContent || this.articleData[articleId].allContent;
            this.articleData[articleId].content = parsedMessage.content;
            this.broadcastContentUpdate(articleId, connection);
          }

          // Handle image update
          if (parsedMessage.type === 'image-update' && articleId && parsedMessage.image) {
            this.articleData[articleId].image = parsedMessage.image;
            this.broadcastImageUpdate(articleId);
          }

          // Handle tags update
          if (parsedMessage.type === 'tags-update' && articleId && parsedMessage.tags) {
            this.articleData[articleId].tags = parsedMessage.tags;
            this.broadcastTagsUpdate(articleId);
          }

          // Handle user list request
          if (parsedMessage.type === 'request-user-list' && articleId) {
            this.sendUserList(connection, articleId);
          }
        } catch (error) {
          connection.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      // Handle client disconnection
      connection.on('close', () => {
        if (username && articleId) {
          this.removeClientFromSession(articleId, username);
        }
      });
    });
  }

  // Handle user disconnection
  private removeClientFromSession(articleId: number, username: string) {
    const session = this.sessions[articleId];
    if (session) {
      this.sessions[articleId] = session.filter((client) => client.username !== username);
      if (this.sessions[articleId].length === 0) {
        delete this.sessions[articleId];
        delete this.articleData[articleId];
      } else {
        this.broadcastUserList(articleId);
      }
    }
  }

  // Broadcast the updated user list to all clients in the session
  private broadcastUserList(articleId: number) {
    const userListMessage: UserListMessage = {
      type: 'user-list',
      users: this.sessions[articleId].map((client) => client.username),
    };
    this.broadcastToClients(articleId, JSON.stringify(userListMessage));
  }

  // Broadcast the updated title to all clients in the session
  private broadcastTitleUpdate(articleId: number) {
    const titleMessage: TitleMessage = {
      type: 'title-update',
      title: this.articleData[articleId].title,
    };
    this.broadcastToClients(articleId, JSON.stringify(titleMessage));
  }

  // Broadcast the updated content to all clients in the session
  private broadcastContentUpdate(articleId: number, senderSocket: WebSocket) {
    const contentMessage: ContentMessage = {
      type: 'content-update',
      content: this.articleData[articleId].content,
    };
    this.broadcastToClients(articleId, JSON.stringify(contentMessage), senderSocket);
  }

  // Broadcast the updated image to all clients in the session
  private broadcastImageUpdate(articleId: number) {
    const imageMessage: ImageMessage = {
      type: 'image-update',
      image: this.articleData[articleId].image,
    };
    this.broadcastToClients(articleId, JSON.stringify(imageMessage));
  }

  // Broadcast the updated tags to all clients in the session
  private broadcastTagsUpdate(articleId: number) {
    const tagsMessage: TagsMessage = {
      type: 'tags-update',
      tags: this.articleData[articleId].tags,
    };
    this.broadcastToClients(articleId, JSON.stringify(tagsMessage));
  }

  // Broadcast the updated tags to all clients in the session
  private broadcastCreatedArticle(articleId: number) {
    const createdMessage: CreatedMessage = {
      type: 'created-article',
    };
    this.broadcastToClients(articleId, JSON.stringify(createdMessage));
  }

  // Broadcast a message to all clients in the specified session, except the sender
  private broadcastToClients(articleId: number, message: string, senderSocket?: WebSocket) {
    const session = this.sessions[articleId];
    session.forEach(({ connection }) => {
      if (connection !== senderSocket && connection.readyState === WebSocket.OPEN) {
        connection.send(message);
      }
    });
  }

  // Send the current document content to a specific client
  private sendArticleContent(connection: WebSocket, articleId: number) {
    const { title, allContent, tags, image } = this.articleData[articleId];

    connection.send(JSON.stringify({ type: 'title-update', title }));
    connection.send(JSON.stringify({ type: 'content-update', allContent }));
    connection.send(JSON.stringify({ type: 'image-update', image }));
    connection.send(JSON.stringify({ type: 'tags-update', tags }));
  }

  // Send the current user list to a specific client
  private sendUserList(connection: WebSocket, articleId: number) {
    const userListMessage: UserListMessage = {
      type: 'user-list',
      users: this.sessions[articleId].map((client) => client.username),
    };
    connection.send(JSON.stringify(userListMessage));
  }
}
