import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button } from '../components/widgets';
import { NavLink } from 'react-router-dom';
import { createHashHistory } from 'history';
import { Article, User, ArticleVersion, Tag } from '../classes';
import wikiService from '../services/wiki-service';
import '../styles/wiki.css';

// WYSIWYG editor stuff
// have used their website for learning
// have also learned about it relation with websocket in this video: https://www.youtube.com/watch?v=iRaelG7v0OU&t=2367s
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import Quill from 'quill';

//websocket
import websocketService, { Subscription } from '../services/websocket-service';

export const history = createHashHistory(); // Use history.push(...) to programmatically change path

// interface for WEBSOCKET
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

export class EditArticle extends Component<{ match: { params: { id: number } } }> {
  article: Article = new Article();
  articleVersions: ArticleVersion[] = [];
  newVersion: ArticleVersion = new ArticleVersion();
  currentVersion: ArticleVersion = new ArticleVersion();
  authUser: User = new User();
  tags: Tag[] = [];
  commaSeperatedTags: string = '';
  currentCommaSeperatedTags: string = '';
  editor: Quill | null = null;
  //websocker
  subscription: Subscription | null = null;
  connected: boolean = false;
  connectedUsers: string[] = [];
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map kilde for new Map()
  profilePictures: { [x: string]: any } = new Map();
  visibleAuthors: string = '';

  render() {
    return (
      <div className="blackBackground">
        <Card className="basicCard" title="Edit Article">
          <Card className="TurquoiseCard" title="">
            {this.connected ? (
              <div>
                {' '}
                <h6>Connected users:</h6>
                {this.connectedUsers.map((username: string, i: number) => {
                  return (
                    <div key={i}>
                      <NavLink to={'/profile/' + username}>
                        <img
                          src={this.profilePictures.get(username)}
                          alt={new User().profilePicture}
                          className="commentProfilePicture"
                        ></img>
                      </NavLink>{' '}
                      {username} <br />
                    </div>
                  );
                })}
                You are connected as
                <b> {this.authUser.username} </b>{' '}
              </div>
            ) : (
              <div>
                <b>You are disconnected</b>
              </div>
            )}
          </Card>
          <Card className="TurquoiseCard" title="">
            <Form.Label>
              <b>Title:</b>
            </Form.Label>
            <Form.Input
              data-testid="title-input"
              placeholder="Article title not found"
              type="text"
              value={this.newVersion.title || ''} 
              onChange={(event) => {
                this.newVersion.title = event.currentTarget.value;
                this.updateTitle();
              }}
            ></Form.Input>
            <br />
            <Form.Label>
              <b>Article image</b>
            </Form.Label>
            <Form.Input
              data-testid="file-input"
              type="file"
              onChange={(event) => { // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
                const files = event.currentTarget.files;
                let file;
                if (event.currentTarget.files != null) {
                  file = event.currentTarget.files[0];
                }
                if (file && files && files.length > 0) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    // chatGPT helped with this
                    const base64String = reader.result as string; // this is converted to base 64
                    this.newVersion.image = base64String;
                    this.updateImage();
                    console.log('image changed');
                  };
                  reader.readAsDataURL(file); // this reads files as base 64
                } else {
                  console.log('cancelled');
                  console.log(this.currentVersion);
                  this.newVersion.image = this.currentVersion.image;
                  this.updateImage();
                }
              }}
            ></Form.Input>
            <br />
            <b>Current image:</b>
            <br />
            <img
              data-testid="article-image"
              src={this.newVersion.image}
              alt="No picture uploaded"
              style={{ width: '100px', height: 'auto' }}
            ></img>
            <br />
            <br />
            <Form.Label>
              <b>Content:</b>
            </Form.Label>
            <div id="editor" data-testid="editor"></div>
            <br />
            <Form.Label>
              <b>Author:</b>
            </Form.Label>
            <Form.Input
              data-testid="author-input"
              placeholder=""
              type="text"
              disabled
              value={this.visibleAuthors}
              onChange={() => {}}
            ></Form.Input>
            <br />
            <Form.Label>
              <b>Tags (comma-seperated):</b>
            </Form.Label>
            <Form.Input
              data-testid="tags-input"
              placeholder="This article does not have any tags yet"
              type="text"
              value={this.commaSeperatedTags}
              onChange={(event) => {
                this.commaSeperatedTags = event.currentTarget.value;
                this.updateTags();
              }}
            ></Form.Input>
            <br />
            <Card className="basicCard" title="">
              <Row>
                <Column>
                  <Button.Success
                    data-testid="save-button" 
                    onClick={() => {
                      this.createVersion();
                    }}
                  >
                    Save
                  </Button.Success>
                </Column>
                <Column width={1}>
                  <Button.Danger
                    data-testid="discard-button" 
                    onClick={() => {
                      Alert.danger('Discarding');
                      history.push('/articles/' + this.props.match.params.id);
                    }}
                  >
                    Discard
                  </Button.Danger>
                </Column>
              </Row>
            </Card>
          </Card>
        </Card>
      </div>
    );
  }
   // ENDRET MOUNTED IFT TESTER. SE OM DETTE ER ET PROBLEM (løste et problem med tester): 
   // la til || også i "Article title not found"  
  // async mounted() {
  //   try {
  //     this.authUser = await wikiService.getAuthenticatedUser();
  //   } catch {
  //     console.error('User is not logged in');
  //   }

  //   try {
  //     this.tags = await wikiService.getArticleTags(this.props.match.params.id);
  //     this.commaSeperatedTags = this.tags.map((tag) => tag.tagName).join(', '); //Formatterer det slik at man kan editere det
  //     console.log(this.commaSeperatedTags);

  //     this.article = await wikiService.getArticle(this.props.match.params.id);
  //     this.articleVersions = await wikiService.getArticleVersions(this.props.match.params.id);

  //     this.currentVersion = this.articleVersions.find(
  //       (version) => version.version === this.article.currentVersion,
  //     )!;

  //     this.newVersion = { ...this.currentVersion };
  //   } catch (error) {}

  //   this.newVersion.version += 1;

  //   this.editorSetup();

  //   this.websocketSetup();
  // }

  async mounted() {
    //initiliazes quill (rich text edtior)
    this.editor = new Quill('#editor', { placeholder: 'Write your article here!', theme: 'snow' });

    // check if user is logged in
    try {
      this.authUser = await wikiService.getAuthenticatedUser();
    } catch {
      console.error('User is not logged in');
    }

    // gets the content from the current version of the article
    try {
      this.tags = await wikiService.getArticleTags(this.props.match.params.id);
      this.currentCommaSeperatedTags = this.tags.map((tag) => tag.tagName).join(', ');
      this.commaSeperatedTags = this.tags.map((tag) => tag.tagName).join(', '); //Formatterer det slik at man kan editere det

      console.log(this.commaSeperatedTags);
  
      this.article = await wikiService.getArticle(this.props.match.params.id);
      this.articleVersions = await wikiService.getArticleVersions(this.props.match.params.id);
  
      this.currentVersion = this.articleVersions.find(
        (version) => version.version === this.article.currentVersion,
      )!;
  
      this.newVersion = { ...this.currentVersion };
      this.newVersion.title = this.newVersion.title || ''; // fallback for testing
      console.log('Title after fetching:', this.newVersion.title); // Legg til logg

    } catch (error) {
      console.error('Error in mounted:', error);
    }
  
    this.newVersion.version += 1;

    // sets up editor
    this.editorSetup();

    // sets up webscoket // if there is ongoing changes the contents of the article will also update
    this.websocketSetup();
  }
  

  // gets profile pic of hte connected users, instead og getting the whole user
  getProfilePic = async (username: string) => {
    try {
      let profilePicture: any = await wikiService.getUserProfilePic(username);
      return profilePicture.profilePicture;
    } catch (error) {
      console.error('error fetching profile pic: ', error);
      return new User().profilePicture;
    }
  };

  // sets up websocket
  websocketSetup() {
    this.subscription = websocketService.subscribe();

    this.subscription.onopen = () => {
      this.connected = true;

      // Send register message
      websocketService.send({
        type: 'register',
        id: this.article.articleId,
        username: this.authUser.username,
      });
      this.forceUpdate(); // triggers a re-render to show connected state
    };

    // handles recieved messages from websocket
    this.subscription.onmessage = async (message) => {
      switch (message.type) {
        case 'user-list':
          console.log('user-list called');
          this.connectedUsers = message.users || this.connectedUsers;
          this.connectedUsers = this.connectedUsers.filter(
            (username, index, self) => self.indexOf(username) === index,
          ); // ensures the connectedUsers doesnt have double entries

          // adds profile pictures
          for (const c of this.connectedUsers) {
            let pic: string = await this.getProfilePic(c);
            if (!this.profilePictures.has(c)) this.profilePictures.set(c, pic);
          }

          // adds authors in authors field on screen
          let string: string = '';
          this.connectedUsers.forEach((c, i) => {
            if (i === this.connectedUsers.length - 1) {
              string += c;
            } else {
              string += c + ', ';
            }
          });
          this.visibleAuthors = string;

          this.forceUpdate(); // triggers a re-render
          break;

        case 'title-update':
          console.log('Received title-update message:', message.title); // Debug log
          this.newVersion.title = message.title || this.newVersion.title;
          this.forceUpdate(); // triggers a re-render

        case 'content-update':
          if (message.content && this.editor) this.editor.updateContents(message.content);
          if (message.allContent && this.editor) {
            let delta = JSON.parse(message.allContent);
            this.editor.setContents(delta);
          }
          this.forceUpdate(); // triggers a re-render
          break;

        case 'image-update':
          this.newVersion.image = message.image || this.newVersion.image;
          this.forceUpdate(); // triggers a re-render
          break;

        case 'tags-update':
          this.commaSeperatedTags = message.tags || this.commaSeperatedTags;
          this.forceUpdate(); // triggers a re-render
          break;

        case 'created-article':
          Alert.success('Page edited!');
          history.push(`/articles/${this.props.match.params.id}`); // returns to ViewArticle if another user creates the article
          break;

        default:
          console.error('Unknown message type:', message.type);
      }
    };

    // handles the user leaving the editpage / disconnecting
    this.subscription.onclose = (_code, reason) => {
      console.log('WebSocket closed:', event);
      this.connected = false;
      this.profilePictures.delete(this.authUser.username);
      alert('Connection closed: ' + reason);
      this.forceUpdate(); // Trigger re-render to show disconnected state
    };
  }

  // Functions for sending websocket messages with a specific type / purpose
  updateTitle() {
    const updateMessage: DataMessage = {
      type: 'title-update',
      id: this.article.articleId,
      title: this.newVersion.title,
    };

    websocketService.send(updateMessage);
  }

  updateImage() {
    const updateMessage: DataMessage = {
      type: 'image-update',
      id: this.article.articleId,
      image: this.newVersion.image,
    };

    websocketService.send(updateMessage);
  }

  updateContent(delta: any) {
    const updateMessage: DataMessage = {
      type: 'content-update',
      id: this.article.articleId,
      content: delta,
      allContent: this.newVersion.content,
    };

    websocketService.send(updateMessage);
  }

  updateTags() {
    const updateMessage: DataMessage = {
      type: 'tags-update',
      id: this.article.articleId,
      tags: this.commaSeperatedTags,
    };

    websocketService.send(updateMessage);
  }

  createdArticle() {
    const updateMessage: DataMessage = {
      type: 'created-article',
      id: this.article.articleId,
    };

    websocketService.send(updateMessage);
  }

  // runs when the user leaves the page
  beforeUnmount(): void {
    if (this.subscription) {
      websocketService.unsubscribe(this.subscription);
      console.log('unmounted');
    }
    window.location.reload(); // this solves a problem where the websocket sessions got mixed together. figured it out through testing // connection.on('close) in server side is only being called when i reload
  }

  //this could be removed if wanted
  //was used when migrating from text area to rich text
  isJson(value: string) {
    try {
      JSON.parse(value); // this line was created by AI
      return true;
    } catch (e) {
      return false;
    }
  }

  // sets up the editor
  editorSetup() {
    this.editor?.on('text-change', (delta, _oldDelta, source) => {
      const content = this.editor?.getContents();
      this.newVersion.content = JSON.stringify(content); //saves content as json in a string format
      if (source !== 'user') return;
      this.updateContent(delta); // if the user made the change(with keyboard), it sends changed content to websocket
    });

    // here we are checking if the content is stored as a quill json (string) or as clear text. this was a solution made up when we were transition from inform.textarea --> quill (rich text)
    if (this.isJson(this.newVersion.content)) {
      let delta = JSON.parse(this.newVersion.content);
      this.editor?.setContents(delta);
    } else {
      this.editor?.setText(this.newVersion.content);
    }
  }

  // creates the version when the save button is pressed
  async createVersion() {
    let existingArticle;

    // checks for correct input
    if (
      this.currentVersion.content === this.newVersion.content &&
      this.currentCommaSeperatedTags === this.commaSeperatedTags &&
      this.currentVersion.title === this.newVersion.title &&
      this.currentVersion.image === this.newVersion.image
    ) {
      return Alert.warning('You need to change something to save changes');
    }

    // check if article name already exist in cases of changing the title
    if (this.article.title.toLocaleLowerCase() != this.newVersion.title.toLocaleLowerCase()) {
      try {
        existingArticle = await wikiService.getArticleByTitle(this.newVersion.title);
      } catch {}

      if (existingArticle) {
        console.log('An article with this title already exists:', this.newVersion.title);
        return Alert.warning('An article with this title already exists');
      }
    }

    // checks that content is not empty
    if (this.newVersion.content.trim() == '') {
      console.log('Content cant be empty');
      return Alert.warning('Content cant be empty');
    }

    // checks that articleversion have tags
    if (!this.commaSeperatedTags || this.commaSeperatedTags == '') {
      console.log('Tags cant be empty');
      return Alert.warning('Article must have tags');
    }

    //creates version
    let articleVersionId = await wikiService.createVersion(
      this.props.match.params.id,
      this.newVersion.version,
      this.newVersion.content,
      this.newVersion.title,
      getCurrentFormattedDate(),
      this.newVersion.image,
    );

    // updates title in article table if title is changed
    if (this.article.title != this.newVersion.title) {
      await wikiService.updateArticleTitle(this.props.match.params.id, this.newVersion.title);
    }

    // formats the tags and creates tags if they dont already exist
    const tagsArray: string[] = this.commaSeperatedTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    const tagIds: number[] = await Promise.all(
      // Promise.all method was found through chatGPT
      tagsArray.map(async (tag) => {
        let existingTag;

        try {
          existingTag = await wikiService.getTagByName(tag);
        } catch {
          console.log('creating tag: ' + tag);
          const newTagId = await wikiService.createTag(tag);
          return newTagId;
        }

        // Return the existing tag's id
        return existingTag.tagId;
      }),
    );

    // deletes all article tag relations (ensures that removed tags will be removed from aticle)
    try {
      await wikiService.deleteTagRelationsByArticleId(this.props.match.params.id);
    } catch {
      console.log('No tagRelations already exist');
    }

    // creates tagRelations
    for (const tagId of tagIds) {
      try {
        await wikiService.createTagRelation(tagId, this.props.match.params.id);
      } catch (error) {
        console.error('Could not create tag relation: ' + error);
      }
      console.log(articleVersionId);

      // creates author articleVersion relation
      for (let username of this.connectedUsers) {
        console.log(username);
        try {
          await wikiService.createVersionAuthor(articleVersionId.id, username);
        } catch (error) {
          console.error('error: possibly double entry', error);
        }
      }
    }

    // this gives a "message" to the other clients so they know the article was created
    this.createdArticle();

    Alert.success('Page edited!');

    history.push(`/articles/${this.props.match.params.id}`);

    // function for getting the correct formatted date, (should be removed to its own file in helpers if time for it)
    function getCurrentFormattedDate(): string {
      //This function is copied from NewArticle
      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    }
  }
}
