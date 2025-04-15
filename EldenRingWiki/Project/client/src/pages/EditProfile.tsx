import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button } from '../components/widgets';
import { NavLink } from 'react-router-dom';
import { createHashHistory } from 'history';
import { User, Comment, ArticleVersion, Tag, Appraisal } from '../classes';
import wikiService from '../services/wiki-service';
import '../styles/wiki.css';

export const history = createHashHistory(); // Use history.push(...) to programmatically change path

export class EditProfile extends Component {
  user: User = new User();
  userArticles: ArticleVersion[] = [];
  userComments: Comment[] = [];
  editComment: Comment = new Comment();
  username: string = '';
  newProfilePicture: string = new User().profilePicture;

  render() {
    let username = this.user.username;
    return (
      <div className="blackBackground">
        <Card className="blackBackgroundLogin " title={`Hello - ${this.user.username}`}>
          <div className="divLoginBlack">
            Welcome to your profile! Here you can edit and delete your articles and comments.
          </div>
          <br />
          <Card title="Edit your profilepic and bio:" className="divLoginBlackWithBorder">
            <Row>
              <Column>
                <Form.Label>Bio: </Form.Label>
              </Column>
            </Row>
            <Row>
              <Column>
                {/* TextArea is limited to 250 characters */}
                <Form.Textarea
                  placeholder="write something about yourself"
                  type="text"
                  value={this.user.bio}
                  onChange={(event) => {
                    if (event.currentTarget.value.length <= 250) {
                      this.user.bio = event.currentTarget.value;
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    minWidth: '400px',
                    minHeight: '175px',
                  }}
                ></Form.Textarea>{' '}
                <div
                  style={{
                    fontSize: '12px',
                    fontStyle: 'italic',
                  }}
                >
                  max 250 characters
                </div>
              </Column>
            </Row>
            <br />
            <Row>
              { /*@ts-ignore*/ }
              <Form.Label htmlFor="profile-picture-input">Profile picture: </Form.Label>{' '}
              <Column>
                <Form.Input
                  id="profile-picture-input" // for tester
                  type="file"
                  onChange={(event) => {
                    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
                    const files = event.currentTarget.files;
                    //@ts-ignore
                    const file = event.currentTarget.files[0];
                    if (file && files && files.length > 0) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        // chatGPT helped with this
                        const base64String = reader.result as string; // This will be a Base64 string
                        this.newProfilePicture = base64String;
                      };
                      reader.readAsDataURL(file); // Read file as Base64
                    } else {
                      this.newProfilePicture = this.user.profilePicture;
                    }
                  }}
                ></Form.Input>
                <br />
                <b>Current profile picture:</b>
                <br />
                <img
                  src={this.newProfilePicture}
                  alt={new User().profilePicture}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid black',
                  }}
                ></img>
              </Column>
            </Row>
            <br />
            <Row>
              <Column>
                <Button.Success
                  onClick={() => {
                    this.editUser();
                  }}
                >
                  Save changes
                </Button.Success>
              </Column>
            </Row>
            <br />
            <Row>
              <NavLink to={'/profile/' + this.user.username}>
                Check out your public profile here
              </NavLink>
            </Row>
          </Card>

          <br />

          <Card className="divLoginBlackWithBorder" title="Your articles:">
            <ul>
              {this.userArticles.map((article) => (
                <li key={article.articleId}>
                  <b>Article: </b>
                  <NavLink to={`/articles/${article.articleId}`}> {article.title}</NavLink>
                </li>
              ))}
            </ul>
          </Card>
          <br />

          <Card className="divLoginBlackWithBorder" title="Your comments:">
            {this.userComments.map((comment) => (
              <div key={comment.commentId}>
                <b>Comment:</b>
                <NavLink to={`/articles/${comment.articleId}`}>{comment.commentText}</NavLink>
                <br />
                <small>
                  Created: {new Date(comment.commentDate).toLocaleString()}
                  {comment.lastUpdated && comment.lastUpdated !== comment.commentDate && (
                    <> | Last updated: {new Date(comment.lastUpdated).toLocaleString()}</>
                  )}
                </small>
                <br />
                <Button.Light small onClick={() => this.loadEditComment(comment)}>
                  Edit
                </Button.Light>
                <Button.Danger small onClick={() => this.deleteComment(comment.commentId)}>
                  Delete
                </Button.Danger>
              </div>
            ))}
          </Card>
          <br />

          {this.editComment.commentId ? (
            <Card className="basicCard" title="Edit Comment">
              <Form.Label>Update your comment:</Form.Label>
              <Form.Input
                type="text"
                value={this.editComment.commentText}
                onChange={(event) => {
                  this.editComment.commentText = event.currentTarget.value;
                  this.setState({});
                }}
              />

              <Button.Success onClick={() => this.updateComment()}>Save</Button.Success>
              <Button.Light onClick={() => this.cancelEdit()}>Cancel</Button.Light>
            </Card>
          ) : null}
          <br />

          <Row>
            <Column>
              <Button.Success onClick={() => history.push(`/profile/${username}/reset-password`)}>
                Reset password
              </Button.Success>
            </Column>
            <Column width={1}>
              <Button.Danger onClick={() => this.deleteAccount()}>Delete Account</Button.Danger>
            </Column>
          </Row>
          <br />

          <Row>
            <Column>
              <Button.Danger onClick={this.logout}>Log Out</Button.Danger>
            </Column>
          </Row>
        </Card>
      </div>
    );
  }

  async mounted() {
    // fetches logged in user, the users articles, and the users comments
    try {
      this.user = await wikiService.getAuthenticatedUser();
      this.userArticles = await wikiService.getUserArticles(this.user.username);

      // Chat gpt is used from here -->
      // Filter out duplicate articleIds
      const uniqueArticlesMap = new Map();
      this.userArticles.forEach((article) => {
        if (!uniqueArticlesMap.has(article.articleId)) {
          uniqueArticlesMap.set(article.articleId, article);
        }
      });

      // Convert Map values back to an array
      this.userArticles = Array.from(uniqueArticlesMap.values());
      // --> to here

      console.log(this.userArticles);
      this.userComments = await wikiService.getUserComments(this.user.username);
      console.log(this.userComments);
    } catch (error) {
      console.error('Error loading user or comments:', error);
    }

    // checks if user has a profile picture and gives default profile pic if no
    // this can be removed but was needed when we were migrating. from beofre users have profilepic = null in the db, now default profile pic is sent to the db when user creates user without profile pic
    if (this.user.profilePicture != null || this.user.profilePicture !== undefined) {
      this.newProfilePicture = this.user.profilePicture;
    }
  }

  // updates user bio and profilepicture
  async editUser() {
    if (this.user.bio === null || !this.user.bio) this.user.bio = '';
    try {
      await wikiService.editUser(this.user.username, this.user.bio, this.newProfilePicture);
      Alert.success('Updated bio and profile picture successfully');
    } catch (error) {
      console.error('Error with editing user: ', error);
      Alert.danger('Failed to edit user');
    }
  }

  loadEditComment(comment: Comment) {
    this.editComment = { ...comment };
    this.setState({});
  }

  // upadtes the user comment
  async updateComment() {
    try {
      if (this.editComment.commentId) {
        await wikiService.updateComment(this.editComment.commentId, this.editComment.commentText);
        const commentIndex = this.userComments.findIndex(
          (c) => c.commentId === this.editComment.commentId,
        );
        if (commentIndex !== -1) {
          this.userComments[commentIndex] = { ...this.editComment };
        }
        this.editComment = new Comment();
        this.setState({});
        Alert.success('Comment updated successfully.');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      Alert.danger('Failed to update comment.');
    }
  }

  // deletes the user comment
  async deleteComment(commentId: number) {
    try {
      await wikiService.deleteComment(commentId);
      this.userComments = this.userComments.filter((c) => c.commentId !== commentId);
      this.setState({});
      Alert.success('Comment deleted successfully.');
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.danger('Failed to delete comment.');
    }
  }

  cancelEdit() {
    this.editComment = new Comment();
    this.setState({});
  }

  // logout function for the user
  async logout() {
    try {
      await wikiService.logoutUser();
      Alert.success('Successfull logout'); //timeout is run for visual effects
      setTimeout(() => {
        history.push('/');
        window.location.reload();
      }, 250);
    } catch (error: any) {
      console.error(error);
      Alert.warning(error.message);
    }
  }

  deleteAccount() {
    console.log("Trying to delete user: " + this.user.username)
    if (!window.confirm('Are you sure? The Elden-ring community will miss you:(')) {
      return;
    }
    let user_deletion = this.user.username
    this.logout()
    history.push('/')

    wikiService
      .deleteUser(user_deletion)
      .then(() => {
        Alert.success('Goodbye, sad to see you go;' + user_deletion);
        window.location.reload();
      })
      .catch((error) => {
        console.error('Failed to delete account:', error);
        Alert.info('You get to be a member of Elden Ring one more day, deletion failed');
      });
  }
}
