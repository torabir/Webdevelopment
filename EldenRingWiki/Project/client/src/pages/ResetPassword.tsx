//This class is used on the profile paged and is rendered when the Reset Password button is pressed.

import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button } from '../components/widgets';
import { createHashHistory } from 'history';
import { User } from '../classes';
import wikiService from '../services/wiki-service';
import '../styles/wiki.css';

export const history = createHashHistory(); // Use history.push(...) to programmatically change path, for instance after successfully saving a student

export class ResetPassword extends Component<{ match: { params: { username: string } } }> {
  user: User = new User();
  newpassword = '';
  newpasswordrepeat = '';

  render() {
    return (
      <div className="blackBackground">
        <Card className="basicCard" title="Reset the Password">
          <Form.Label>
            <b>New Password</b>
          </Form.Label>
          <Form.Input
            placeholder="new password"
            type="password"
            value={this.newpassword}
            onChange={(event) => {
              this.newpassword = event.currentTarget.value;
            }}
          ></Form.Input>
          <br />
          <Form.Label>
            <b>Repeat new password</b>
          </Form.Label>
          <Form.Input
            placeholder="new password"
            type="password"
            value={this.newpasswordrepeat}
            onChange={(event) => {
              this.newpasswordrepeat = event.currentTarget.value;
            }}
          ></Form.Input>
        </Card>
        <br />
        <Card className="basicCard" title="">
          <Row>
            <Column>
              <Button.Success
                onClick={() => {
                  this.resetPassword();
                }}
              >
                Reset Password
              </Button.Success>
            </Column>
            <Column width={1}>
              <Button.Danger
                onClick={() => {
                  history.push('/profile/' + this.props.match.params.username);
                }}
              >
                Cancel
              </Button.Danger>
            </Column>
          </Row>
        </Card>
      </div>
    );
  }
  async resetPassword() {
    if (this.newpassword != this.newpasswordrepeat) {
      Alert.danger('Passwords do not match, please try again');
      this.newpassword = '';
      this.newpasswordrepeat = '';
    }
    //This elif statement is with the same logic as in the NewUser class (from stackoverflow)
    else if (
      !/[A-Z]/.test(this.newpassword) ||
      !/\d/.test(this.newpassword) ||
      !/[!@#$%^&*]/.test(this.newpassword) ||
      this.newpassword.length < 8
    ) {
      Alert.danger(
        'Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character, try again.',
      );
      this.newpassword = '';
      this.newpasswordrepeat = '';
    } else {
      await wikiService.resetUserPassword(this.props.match.params.username, this.newpassword); //Actually resetting the password
      //await here means that in case something goes wrong in the backend, we do not display that everything went well
      Alert.info('Password updated!');
      history.push('/profile/' + this.props.match.params.username);
    }
  }
}
