//This page is made for the class NewUser that is used either when someone not logged in attempts
//to write a comment (or similar) or when a new user wants to register.

import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button } from '../components/widgets';
import { createHashHistory } from 'history';
import { User } from '../classes';
import wikiService from '../services/wiki-service';
import '../styles/wiki.css';

export const history = createHashHistory(); // Use history.push(...) to programmatically change path

export class NewUser extends Component {
  newUser: User = new User();
  confirmPassword: string = '';
  infoUsername: string = ''; // i disse lagrer jeg info HVIS jeg vil displaye det til brukeren
  infoPassword: string = '';
  infoConfirmPassword: string = '';
  usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/; // fra ChatGPT
  passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$.!%*?&_-])[A-Za-z\d@$.!%*?&_-]{8,}$/; // hentet fra stackoverflow men har modifisert den litt selv
  users: User[] = []; // laster inn alle brukere her når jeg skal sjekke om brukernavn allerede eksisterer
  authUser: User = new User(); // authenticated user, altså brukeren som eventuelt allerede er logget på lastes inn her

  render() {
    //Kjøres kun om ingen bruker er logget inn
    if (this.authUser.username == '') {
      return (
        <div className="blackBackground">
          <Card className="TurquoiseCardWithFont" title="CREATE USER">
            <br />
            <Row>
              <Form.Label>Username:</Form.Label>{' '}
              <Column width={1}>
                <Form.Input
                  placeholder="username"
                  data-testid="username-input"
                  type="text"
                  value={this.newUser.username}
                  onChange={(event) => {
                    this.newUser.username = event.currentTarget.value;
                    this.displayInfoUsername();
                  }}
                ></Form.Input>
              </Column>
              <Column>{this.infoUsername}</Column>
            </Row>
            <Row>
              <Row>
                <Column>
                  <Form.Label>Bio: </Form.Label>
                </Column>
              </Row>
              <Column>
                {/* TextArea is limited to 250 characters */}
                <Form.Textarea
                  placeholder="write something about yourself"
                  type="text"
                  value={this.newUser.bio}
                  onChange={(event) => {
                    if (event.currentTarget.value.length <= 250) {
                      this.newUser.bio = event.currentTarget.value;
                    }
                  }}
                  style={{
                    width: '100%',
                    minWidth: '400px',
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
            <Row>
              <Form.Label>Profile picture: </Form.Label>{' '}
              <Column>
                <Form.Input
                  type="file"
                  onChange={(event) => {
                    const files = event.currentTarget.files; // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
                    //@ts-ignore
                    const file = event.currentTarget.files[0];
                    if (file && files && files.length > 0) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        // chatGPT helped with this
                        const base64String = reader.result as string; // this is converted to base 64
                        this.newUser.profilePicture = base64String;
                      };
                      reader.readAsDataURL(file); // this reads files as base 64
                    } else {
                      this.newUser.profilePicture = new User().profilePicture;
                    }
                  }}
                ></Form.Input>
                <br />
                <b>Current profile picture:</b>
                <br />
                <img
                  src={this.newUser.profilePicture}
                  alt="error"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid black',
                  }}
                ></img>
              </Column>
              <br />
            </Row>
            <Row>
              <Form.Label>Password: </Form.Label>{' '}
              <Column width={1}>
                <Form.Input
                  placeholder="password"
                  type="password"
                  value={this.newUser.password}
                  onChange={(event) => {
                    this.newUser.password = event.currentTarget.value;
                    this.displayInfoPassword();
                  }}
                ></Form.Input>
              </Column>
              <Column>{this.infoPassword}</Column>
            </Row>
            <Row>
              <Form.Label>Confirm password: </Form.Label>{' '}
              <Column width={1}>
                <Form.Input
                  placeholder="password"
                  type="password"
                  value={this.confirmPassword}
                  onChange={(event) => {
                    this.confirmPassword = event.currentTarget.value;
                  }}
                ></Form.Input>
              </Column>
              <Column>{this.infoConfirmPassword}</Column>
            </Row>
            <br />
            <Row>
              <Column>
                <Button.Success
                  data-testid="create-user-button"
                  onClick={() => {
                    this.createUser();
                  }}
                >
                  CREATE USER
                </Button.Success>
              </Column>
            </Row>
          </Card>
        </div>
      );
      //I render() bruker vi event.currentTarget.value slik vi har brukt i timene
    } else {
      // renders a different page if user is already logged in
      return (
        <div>
          <Card title={'YOU ARE ALREADY LOGGED IN AS ' + this.authUser.username}>
            <Row>
              <Column>Press logout if you want to proceed to the CREATE USER page..</Column>
            </Row>
            <br />
            <Row>
              <Column>
                <Button.Danger
                  data-testid="logout-button"
                  onClick={() => {
                    this.logout();
                  }}
                >
                  Log Out
                </Button.Danger>
              </Column>
            </Row>
          </Card>
        </div>
      );
    }
  }

  async mounted() {
    try {
      this.authUser = await wikiService.getAuthenticatedUser();
      console.log("User '" + this.authUser.username + "' logged in");
    } catch (error) {
      console.log('User not logged in');
    }
  }

  // display info about username constraints IF the username is not valid
  displayInfoUsername() {
    // [a-zA-Z0-9_] allows uppercase and lowercase letters, numbers, and underscores.
    // {3,16} enforces a length constraint of 3 to 16 characters.

    //linjen under hentet fra chatGPT
    if (!this.usernameRegex.test(this.newUser.username) && this.newUser.username != '') {
      this.infoUsername =
        'Please ensure your username is valid. It must be between 3 to 16 characters long and can only contain letters (A-Z, a-z), numbers (0-9), and underscores (_) and hyphens (-).';
    } else {
      this.infoUsername = '';
    }
  }

  // display info about password constraints IF the username is not valid
  displayInfoPassword() {
    if (!this.passwordRegex.test(this.newUser.password) && this.newUser.password != '') {
      this.infoPassword =
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.';
    } else this.infoPassword = '';
  }

  // creates the user
  async createUser() {
    // checks if username and password is valid
    if (
      (!this.usernameRegex.test(this.newUser.username) && this.newUser.username != '') ||
      this.newUser.username.length < 3 ||
      this.newUser.username.length > 16
    )
      return Alert.danger('Username is not valid');
    if (
      (!this.passwordRegex.test(this.newUser.password) && this.newUser.password != '') ||
      this.newUser.password.length < 8
    )
      return Alert.danger('Password is not valid');
    if (this.newUser.password != this.confirmPassword) {
      this.infoConfirmPassword = 'Passwords did not match';
      this.confirmPassword = '';
      this.newUser.password = '';
      return Alert.danger('Passwords did not match');
    }
    this.infoConfirmPassword = '';

    // checks that a profilepicture is in place // (default profile picture is set in User() object (i classes))
    if (!this.newUser.profilePicture || this.newUser.profilePicture.length === 0)
      return Alert.danger('An unknown error has occured');

    // checks if user with username = ? already exists
    let userExists;
    try {
      userExists = await wikiService.getUser(this.newUser.username);
    } catch (error: any) {
      console.log('username is available');
    }

    // returns alert if username is taken
    if (userExists)
      return Alert.warning('User with username ' + this.newUser.username + ' already exists');

    // creates user if username does not exist
    if (!userExists)
      await wikiService.createUser(
        this.newUser.username,
        this.newUser.password,
        this.newUser.bio,
        this.newUser.profilePicture,
      );

    // redirects to login page and displays alert if user was created successfully
    history.push('/login');
    return Alert.success('You have created your user successfully');
  }

  async logout() {
    try {
      await wikiService.logoutUser();
      Alert.success('Successfull logout'); //kjører en timeout under her sånn at alert meldingen vises før vi reloader hele vinudet, ser mer smud ut synes jeg
      setTimeout(() => {
        window.location.reload();
      }, 250);
    } catch (error: any) {
      console.error(error);
      Alert.warning(error.message);
    }
  }
}
