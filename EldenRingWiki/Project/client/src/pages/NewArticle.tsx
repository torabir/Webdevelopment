import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button } from '../components/widgets';
import { createHashHistory } from 'history';
import { Article, User, ArticleVersion } from '../classes';
import wikiService from '../services/wiki-service';
import '../styles/wiki.css';

// WYSIWYG editor stuff
// have used their website for learning
// have also learned about it relation with websocket in this video: https://www.youtube.com/watch?v=iRaelG7v0OU&t=2367s
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import Quill from 'quill';

export const history = createHashHistory(); // Use history.push(...) to programmatically change path

export class NewArticle extends Component {
  article: Article = new Article();
  articleVersion: ArticleVersion = new ArticleVersion();
  user: User = new User();
  commaSeperatedTags: string = '';
  // @ts-ignore
  editor: Quill;

  // https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript // blir brukt til å lagre bilder i database

  render() {
    return (
      <div className="blackBackground">
        <Card className="TurquoiseCardWithFont" title="NEW ARTICLE">
          <Form.Label>
            <b>Title:</b>
          </Form.Label>
          <Form.Input
            placeholder="write your title here"
            type="text"
            value={this.article.title}
            onChange={(event) => {
              this.article.title = event.currentTarget.value;
            }}
          ></Form.Input>
          <br />
          <Form.Label>
            <b>Article image</b>
          </Form.Label>
          <Form.Input
            type="file"
            onChange={(event) => { // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
              //@ts-ignore
              const file = event.currentTarget.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64String = reader.result as string; // this is converted to base 64
                  this.articleVersion.image = base64String;
                };
                reader.readAsDataURL(file); // this reads files as base 64
              }
            }}
          ></Form.Input>
          <Form.Label>
            <b>Content:</b>
          </Form.Label>
          <div id="editor"></div>
          <br />
          <Form.Label>
            <b>Author:</b>
          </Form.Label>
          <Form.Input
            className="basicCard"
            placeholder=""
            type="text"
            disabled
            value={this.user.username}
            onChange={() => {}}
          ></Form.Input>
          <br />
          <Form.Label>
            <b>Tags (comma-seperated):</b>
          </Form.Label>
          <Form.Input
            placeholder="example: music, artist, jazz, music"
            type="text"
            value={this.commaSeperatedTags}
            onChange={(event) => {
              this.commaSeperatedTags = event.currentTarget.value;
            }}
          ></Form.Input>
          <br />
          <Card className="basicCard" title="">
            <Row>
              <Column>
                <Button.Success
                  onClick={() => {
                    this.createArticle();
                  }}
                >
                  Save
                </Button.Success>
              </Column>
              <Column width={1}>
                <Button.Danger
                  onClick={() => {
                    Alert.danger('avbryter');
                  }}
                >
                  Discard
                </Button.Danger>
              </Column>
            </Row>
          </Card>
        </Card>
      </div>
    );
  }

  async mounted() {
    this.user = await wikiService.getAuthenticatedUser();
    this.editorSetup();
  }

  //sets up the editor
  editorSetup() {
    this.editor = new Quill('#editor', { placeholder: 'Write your article here!', theme: 'snow' });

    this.editor.on('text-change', () => {
      const content = this.editor.getContents();
      // this.setState({ editorContent: content });
      this.articleVersion.content = JSON.stringify(content);
    });
  }

  // creates the article
  async createArticle() {
    let existingArticle;

    // cheks if the contents of the article are accepted and return alerts if not
    try {
      existingArticle = await wikiService.getArticleByTitle(this.article.title);
    } catch {}

    if (existingArticle) {
      console.log('An article with this title already exists:', this.article.title);
      return Alert.warning('An article with this title already exists');
    }

    if (this.articleVersion.content.trim() == '') {
      console.log('Content cant be empty');
      return Alert.warning('Content cant be empty');
    }

    if (!this.commaSeperatedTags || this.commaSeperatedTags == '') {
      console.log('Content cant be empty');
      return Alert.warning('Article must have tags');
    }

    let date = getCurrentFormattedDate();

    const tagsArray: string[] = this.commaSeperatedTags
      .split(',')
      .map((tag) => tag.trim()) // takes away white space
      .filter((tag) => tag !== ''); // filtering away empty tags

    const tagIds: number[] = await Promise.all(
      // promise.all method was found through chatGPT
      tagsArray.map(async (tag) => {
        let existingTag;

        try {
          existingTag = await wikiService.getTagByName(tag);
        } catch {
          console.log('creating tag: ' + tag);
          const newTagId = await wikiService.createTag(tag);
          return newTagId;
        }

        // return the existing tag's id
        return existingTag.tagId;
      }),
    );

    //creates the article and returns the id to a variable
    let ids: any = await wikiService.createArticle(
      this.article.title,
      this.articleVersion.content,
      date,
      this.articleVersion.image,
    );

    // creates tag relation
    for (const tagId of tagIds) {
      try {
        await wikiService.createTagRelation(tagId, ids.articleId);
      } catch(error) {
        console.error("error with creating article tag relation")
      }
    }

    try {
      await wikiService.createVersionAuthor(ids.versionId, this.user.username);
    } catch (error) {
      console.error('Did not create version-author relation', error);
    }

    Alert.success('Article created successfully');
    history.push('/articles/' + ids.articleId);

    //funksjon laget av chatgpt til å formattere dato på riktig måte for databasen
    function getCurrentFormattedDate(): string {
      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    }
  }
}
