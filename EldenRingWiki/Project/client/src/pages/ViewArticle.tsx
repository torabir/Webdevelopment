//This is one of our main classes, made for being able to view and create

import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button } from '../components/widgets';
import { NavLink } from 'react-router-dom';
import { createHashHistory } from 'history';
import { Article, User, Comment, ArticleVersion, Tag, Appraisal } from '../classes';
import wikiService from '../services/wiki-service';
import '../styles/wiki.css';

// WYSIWYG editor stuff
// har tatt i bruk nettsiden deres for å lære å bruke det
//https://www.wysiwygwebbuilder.com/
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import ReactQuill from 'quill';
import Quill from 'quill';

//fort awesome, this may cause some issues if the correct packages are not installed.
//forawesome are a series of icons, here they are used for profile (silouette) and two arrows
//AI and their website was used to implement them: https://fontawesome.com/icons 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

export const history = createHashHistory(); // Use history.push(...) to programmatically change path, for instance after successfully saving a student

export class ViewArticle extends Component<{ match: { params: { id: number } } }> {
  currentVersion: ArticleVersion = new ArticleVersion(); // the version which is shown by default and that is considered the up to date normal version of article
  displayedVersion: ArticleVersion = new ArticleVersion(); // the version being displayed
  articleVersions: ArticleVersion[] = [];
  article: Article = new Article();
  user: User = new User();
  contributors: { username: string }[] = [];
  comments: Comment[] = [];
  newComment: Comment = new Comment();
  editComment: Comment | null = null;
  tags: Tag[] = [];
  ref: any;
  //
  currentPage: number = 1;
  versionsPerPage: number = 4;
  currentVersions: ArticleVersion[] = [];
  totalPages: number = 0;
  // @ts-ignore
  editor: Quill;
  appraisalPercentage: number = 0;
  appraisalCount: number = 0;
  userAppraisal: Appraisal = new Appraisal();
  profilePics: string[] = [];
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  versionAuthors: Map<number, { username: string }[]> = new Map();
  originalAuthor: string = '';

  state = {
    //Implemented due to a previous bug with this.user.username. The solution with state is from OpenAI
    authenticatedUsername: '',
  };

  setPage(page: number) {
    if (page > 0 && page <= Math.ceil(this.articleVersions.length / this.versionsPerPage)) {
      this.currentPage = page;
    }
  }

  paginateVersions() { //As mentioned, OpenAi was used for this
    // Calculate the index range for the current page
    const indexOfLastVersion = this.currentPage * this.versionsPerPage;
    const indexOfFirstVersion = indexOfLastVersion - this.versionsPerPage;
    this.currentVersions = this.articleVersions
      .sort((a, b) => b.version - a.version)
      .slice(indexOfFirstVersion, indexOfLastVersion); // Getting 4 versions per page

    // Total pages for pagination
    this.totalPages = Math.ceil(this.articleVersions.length / this.versionsPerPage);
  }

  render() {
    return (
      <div className="blackBackground">
        <Card className="basicCard" title="">
          {this.displayedVersion.version !== this.currentVersion.version && (
            <b>Version: {this.displayedVersion.version} (older version)</b>
          )}

          <Card title="" className="totalBlackCard">
            <Row>
              <Column width={10}>
                <div>
                  <Row>
                    <Card
                      className="articleContainer basicCard"
                      title={this.displayedVersion.title}
                    >
                      <div className="articleImage">
                        <img src={this.displayedVersion.image} alt="image"></img>
                      </div>
                      <div id="quill-content" style={{}}></div>
                    </Card>
                  </Row>
                  <Row>
                    <Card className="TurquoiseCard" title="">
                      <b>Tags: </b>
                      <br />
                      {this.tags.map((t, i) => {
                        return (
                          <span key={t.tagId}>
                            <button
                              className="tagLinks"
                              onClick={() => history.push('/tags/' + t.tagId + '/articles')}
                            >
                              {t.tagName}
                            </button>
                            {i < this.tags.length - 1 && <span> | </span>}
                          </span>
                        );
                      })}
                    </Card>
                  </Row>
                  <br />
                  <Row>
                    <Column>
                      <Button.Success
                        onClick={() => {
                          if (this.state.authenticatedUsername !== '') { 
                            //authenticatedUsername has been one of our most useful functions
                            history.push('/articles/' + this.article.articleId + '/edit');
                          } else {
                            Alert.danger('Must be logged in to edit article');
                          }
                        }}
                      >
                        Edit Page
                      </Button.Success>
                    </Column>
                  </Row>
                </div>
              </Column>
              <Column right={true}>
                <div>
                  <Card title="Older versions" className="articleVersions basicCard">
                    {this.currentVersions.map((v) => { //We use CSS-classes to effectivly style the entire webpage
                      return (
                        <div>
                          <Card
                            className="TurquoiseCard"
                            key={v.versionId}
                            title={'Version: ' + v.version}
                          >
                            <small>
                              Edit done by:{' '}
                              <div style={{ fontStyle: 'italic' }}>
                                {(this.versionAuthors.get(v.versionId) || []).length === 0 && (
                                  <b>unknown authors</b>
                                )}
                                {this.versionAuthors.get(v.versionId)?.map((author, i, arr) => {
                                  if (i === arr.length - 1) {
                                    return <b key={i}>{author.username}</b>;
                                  }
                                  return <b key={i}>{author.username}, </b>;
                                })}{' '}
                              </div>
                            </small>
                            <small>Created: {new Date(v.versionDate).toLocaleString()/*This returns a string from the local time-zone*/}</small>
                            <br />
                            {this.article.currentVersion === v.version && <div>NEWEST VERSION</div>}
                            {this.displayedVersion.version === v.version && (
                              <div>
                                <b>viewing this article</b>
                              </div>
                            )}
                            {this.displayedVersion.version !== v.version && (
                              <div>
                                <Button.Black
                                  onClick={() => {
                                    this.displayedVersion = this.articleVersions.find(
                                      (v2) => v.version === v2.version,
                                    )!;
                                    Alert.info('Changed to different version');
                                    this.mounted();
                                  }}
                                >
                                  View this version
                                </Button.Black>
                              </div>
                            )}
                          </Card>
                        </div>
                      );
                    })}
                  </Card>
                  <div style={{}}>
                    <Button.Light
                      onClick={() => {
                        if (this.currentPage !== 1) this.setPage(this.currentPage - 1);
                        this.paginateVersions();
                      }}
                    >
                      <FontAwesomeIcon icon={faAngleLeft} />
                    </Button.Light>
                    <span>
                      {' '}
                      Page {this.currentPage} of {this.totalPages}{' '}
                    </span>
                    <Button.Light
                      onClick={() => {
                        if (this.currentPage !== this.totalPages)
                          this.setPage(this.currentPage + 1);
                        this.paginateVersions();
                      }}
                    >
                      {' '}
                      <FontAwesomeIcon icon={faAngleRight} />{' '}
                    </Button.Light>
                  </div>
                </div>
              </Column>
            </Row>
          </Card>
          <br />
          <br />
          <Card className="TurquoiseCard" title="">
            <b>Views: </b> {this.article.views}
            <br />
            <b>Original author: </b> {this.originalAuthor}
            <br />
            <b>Contributors: </b>
            {this.contributors.map((a, index) => {
              if (index !== this.contributors.length - 1) return a.username + ', ';
              return a.username;
            })}
            <br />
            <b>Changed: </b> {new Date(this.displayedVersion.versionDate).toLocaleString()}
          </Card>
          <Card title="" className="TurquoiseCard">
            <b>Appraisals: </b>
            {this.appraisalCount}
            <br />
            {this.appraisalCount !== 0 && (
              <div
                className="progress-bar"
                style={{ '--width': this.appraisalPercentage } as React.CSSProperties} //denne linjen har jeg fått hjelp av chatGPT til å bruke as REACT.CSS...
              ></div>
            )}
            {this.userAppraisal.articleId === 0 && (
              <div>
                Appraise {this.article.title}:{'  '}
                <Button.Black
                  onClick={() => {
                    this.appraiseArticle(true);
                  }}
                  small={true}
                >
                  Good
                </Button.Black>
                <Button.Black
                  onClick={() => {
                    this.appraiseArticle(false);
                  }}
                  small={true}
                >
                  Poor
                </Button.Black>
              </div>
            )}
            {this.userAppraisal.articleId !== 0 && (
              <div>
                <br />
                <b>
                  You have appraised {this.article.title} as{' '}
                  {this.userAppraisal.good ? 'good' : 'poor'}
                </b>
              </div>
            )}
          </Card>
          <br />
          <Card className="basicCard" title="Comments">
            <Form.Label>
              <b>Add Comment:</b>
            </Form.Label>
            <Form.Input
              type="text"
              placeholder="Write your comment here"
              value={this.newComment.commentText}
              onChange={(event) => {
                this.newComment.commentText = event.currentTarget.value;
              }}
            ></Form.Input>
            <Button.Success onClick={this.addComment}>Add Comment</Button.Success>
            <br />
            <br />
            <Card className="TurquoiseCard" title="Comments">
              {this.comments.map((c, i) => (
                <div key={c.commentId}>
                  <NavLink to={'/profile/' + c.username}>
                    <img className="commentProfilePicture" src={this.profilePics[i]} alt=""></img>
                  </NavLink>{' '}
                  <button
                    className="tagLinks"
                    onClick={() => {
                      history.push('/profile/' + c.username);
                    }}
                  >
                    <b> {c.username}:</b>
                  </button>{' '}
                  {c.commentText}{' '}
                  <small>
                    <br />
                    Created: {new Date(c.commentDate).toLocaleString()}
                    {c.lastUpdated && c.lastUpdated !== c.commentDate && (
                      <> | Last updated: {new Date(c.lastUpdated).toLocaleString()}</>
                    )}
                  </small>
                  <br />
                  {this.state.authenticatedUsername === c.username && (
                    <>
                      {this.editComment && this.editComment.commentId === c.commentId ? (
                        <>
                          <Form.Input
                            type="text"
                            value={this.editComment.commentText}
                            onChange={(event) =>
                              (this.editComment!.commentText = event.currentTarget.value)
                            }
                          />
                          <Button.Success onClick={() => this.saveEditedComment(c.commentId)}>
                            Save
                          </Button.Success>
                          <Button.Light onClick={() => this.cancelEdit()}>Cancel</Button.Light>
                        </>
                      ) : (
                        <>
                          <Button.Light small onClick={() => this.loadEditComment(c)}>
                            Edit
                          </Button.Light>
                          <Button.Danger small onClick={() => this.deleteComment(c.commentId)}>
                            Delete
                          </Button.Danger>
                        </>
                      )}
                      <br />
                    </>
                  )}
                  <br />
                </div>
              ))}
            </Card>
          </Card>
        </Card>
        <Card className="TurquoiseCard" title="Danger zone!">
          <Button.Danger onClick={() => this.deleteArticle()}>Delete article</Button.Danger>
        </Card>
      </div>
    );
  }
  async mounted() {
    await this.login();
    await this.loadArticle();
    this.paginateVersions();
    this.editorSetup();
    this.getAppraisalPercentage();
    this.findUserAppraisal();
    for (let version of this.articleVersions) {
      try {
        const authors = await wikiService.getVersionAuthors(version.versionId);
        this.versionAuthors.set(version.versionId, authors);
      } catch (error) {
        console.error('Authors probably doesnt exist in ArticleVersionsAuthors', error);
      }
    }

    const lowestVersionId = Math.min(...Array.from(this.versionAuthors.keys())); // this single line is learned from chat gpt
    const authorObject = this.versionAuthors.get(lowestVersionId);
    if (authorObject && authorObject[0]) this.originalAuthor = authorObject[0].username;
    else this.originalAuthor = 'unknown';

    this.getContributors();
  }

  getContributors(): void {
    const uniqueUsernames: Set<string> = new Set();

    // Collect unique usernames from the map
    for (const entries of this.versionAuthors.values()) {
      entries.forEach((entry: { username: string }) => {
        uniqueUsernames.add(entry.username);
      });
    }

    this.contributors = Array.from(uniqueUsernames).map((username) => ({ username }));
  }

  async login() {
    try {
      const user = await wikiService.getAuthenticatedUser();
      this.setState({ authenticatedUsername: user.username });
    } catch (error) {}
  }

  async saveEditedComment(commentId: number) {
    if (this.editComment) {
      try {
        await wikiService.updateComment(commentId, this.editComment.commentText);
        Alert.success('Comment updated successfully.');
        this.editComment = null;
        await this.loadArticle();
      } catch (error) {
        console.error('Failed to update comment:', error);
        Alert.danger('Failed to update comment.');
      }
    }
  }

  //denne funksjonen vil vi ikke trenge etterhvert, den er her foreløpig mens vi transitioner fra textarea til WYSIWYG editor
  isJson(value: string) {
    try {
      // Try to parse the value as JSON
      JSON.parse(value);
      return true; // If successful, it's valid JSON
    } catch (e) {
      return false; // If parsing fails, it's not valid JSON
    }
  }

  // denne funksjonen kan vi gjøre enklere når vi kun har artikler som er laget med QUILL editor.
  editorSetup() {
    this.editor = new Quill('#quill-content', {
      theme: 'bubble',
      readOnly: true,
    });

    if (this.isJson(this.displayedVersion.content)) {
      let delta = JSON.parse(this.displayedVersion.content);
      this.editor.setContents(delta);
    } else {
      this.editor.setText(this.displayedVersion.content);
    }
  }
  // Sjekker om URL-id har endret seg og oppdaterer artikkelen om nødvendig
  componentDidUpdate = async (prevProps: { match: { params: { id: number } } }) => {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      await this.loadArticle(); // Henter artikkel basert på ny id
    }
  };

  addComment = async () => {
    let user = new User();
    try {
      user = await wikiService.getAuthenticatedUser();
    } catch (error) {
      return Alert.danger('You must be logged in on a user to add a comment');
    }

    if (this.newComment.commentText.trim() === '') {
      return Alert.danger('Comment cannot be empty');
    }
    if (user.username == '') {
      return Alert.danger('You must be logged in on a user to add a comment');
    }

    const date = getCurrentFormattedDate();

    try {
      await wikiService.createComment(
        this.article.articleId,
        user.username,
        this.newComment.commentText,
        date,
      );

      Alert.success('Comment added successfully');
      this.newComment.commentText = '';
      this.mounted();
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.danger('Failed to add comment');
    }

    // brukt chat gpt til hjelp for å få den funksjonen under her
    function getCurrentFormattedDate(): string {
      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    }
  };

  deleteComment = async (commentId: number) => {
    try {
      await wikiService.deleteComment(commentId);
      Alert.success('Comment deleted successfully');
      this.mounted();
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.danger('Failed to delete comment');
    }
  };

  //Danger zone, deleting the article
  deleteArticle = async () => {
    if (window.confirm('Are you sure you want to do this, this action cannot be undone')) {
      try {
        await wikiService.deleteArticle(this.props.match.params.id);
        Alert.success('Article deleted');
        history.push('/');
      } catch (error) {
        Alert.danger('Failed to delete article');
      }
    }
  };

  getProfilePic = async (username: string) => {
    try {
      let profilePicture: any = await wikiService.getUserProfilePic(username);
      return profilePicture.profilePicture;
    } catch (error) {
      console.error('error fetching profile pic: ', error);
      return new User().profilePicture;
    }
  };

  loadEditComment(comment: Comment) {
    this.editComment = { ...comment };
    this.setState({});
  }

  cancelEdit() {
    this.editComment = null;
    this.setState({});
  }

  // Ny metode `loadArticle` for å hente artikkel og relatert data basert på id (for at søkefunksjon skal funke inne på artikler)

  loadArticle = async () => {
    try {
      const articleId = this.props.match.params.id; // Hent id fra URL-parameterne

      // Hent artikkelversjoner og selve artikkelen basert på id
      this.articleVersions = await wikiService.getArticleVersions(articleId);
      this.article = await wikiService.getArticle(articleId);

      // Sett `currentVersion` til den nyeste versjonen og vis denne som standard
      this.currentVersion = this.articleVersions.find(
        (version) => version.version === this.article.currentVersion,
      )!;
      if (this.displayedVersion.versionId === 0) this.displayedVersion = this.currentVersion;

      // Hent tags og kommentarer for artikkelen
      this.tags = await wikiService.getArticleTags(articleId);

      await this.getComments(articleId);

      // Oppdater visningstallet for artikkelen
      await wikiService.addView(articleId);
    } catch (error) {
      console.error('Error loading article data:', error); // Logg feilmelding om noe går galt
    }
  };

  async appraiseArticle(good: boolean) {
    if (this.state.authenticatedUsername === '')
      return Alert.danger('You must be logged in to give an appraisal');
    await wikiService.appraiseArticle(
      this.props.match.params.id,
      this.state.authenticatedUsername,
      good,
    );
    this.getAppraisalPercentage();
    this.findUserAppraisal();
  }

  async getAppraisalPercentage() {
    let totalAppraisals = await wikiService.countAppraisals(this.props.match.params.id); // makes db calls that counts appraisals and appraisals with attribute good = true
    let totalGoodAppraisals = await wikiService.countGoodAppraisals(this.props.match.params.id);

    this.appraisalCount = totalAppraisals.count;

    let percentage = (totalGoodAppraisals.count / totalAppraisals.count) * 100;
    this.appraisalPercentage = percentage;
  }

  async findUserAppraisal() {
    const user: User = await wikiService.getAuthenticatedUser();
    if (this.user) {
      const appraisal: Appraisal | undefined = await wikiService.getUserAppraisal(
        this.props.match.params.id,
        this.state.authenticatedUsername,
      );

      if (appraisal) this.userAppraisal = appraisal;
    }
  }

  async getComments(articleId: number) {
    this.comments = await wikiService.getArticleComments(articleId);

    this.profilePics = [];

    for (const c of this.comments) {
      let pic = await this.getProfilePic(c.username);
      this.profilePics.push(pic);
    }
  }
}
