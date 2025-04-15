import * as React from 'react';
import { Component } from 'react-simplified';
import { Alert, Card, Row, Column, Form, Button } from '../components/widgets';
import { match, NavLink } from 'react-router-dom';
import { createHashHistory } from 'history';
import { User } from '../classes';
import wikiService from '../services/wiki-service';
import '../styles/wiki.css';
// @ts-ignore // VET IKKE HVORDAN MAN BEHANDLER DETTE MED TYPESCRIPT
import LogoCool from '../images/logo.png';

export const history = createHashHistory(); // Use history.push(...) to programmatically change path

export class Login extends Component {
  loginUser: User = new User();
  authUser: User = new User(); // authenticated user, altså brukeren som eventuelt allerede er logget på lastes inn her

  render() {
    // LASTER INN FORSKJELLIGE SIDER BASERT PÅ OM BRUKEREN ER LOGGET PÅ ELLER IKKE
    if (this.authUser.username == '') {
      return (
        <div className="blackBackground">
          <Card className="TurquoiseCardWithFont" title="">
            <Row>
              <Column>
                <h3>LOGIN</h3>
              </Column>
            </Row>
            <br />
            <Row>
              <Column width={8}>
                <Form.Input
                  placeholder="username"
                  type="text"
                  value={this.loginUser.username}
                  onChange={(event) => {
                    this.loginUser.username = event.currentTarget.value;
                  }}
                ></Form.Input>
              </Column>
            </Row>
            <Row>
              <Column>
                <Form.Input
                  placeholder="password"
                  type="password"
                  value={this.loginUser.password}
                  onChange={(event) => {
                    this.loginUser.password = event.currentTarget.value;
                  }}
                ></Form.Input>
              </Column>
            </Row>
            <br />
            <Row>
              <Column>
                Dont have an account? <NavLink to={'/create-user'}>Register now!</NavLink>
              </Column>
            </Row>
            <br />

            <Row>
              <Column>
                <Button.Success
                  onClick={() => {
                    this.login(this.loginUser.username, this.loginUser.password);
                  }}
                >
                  Login
                </Button.Success>
              </Column>
            </Row>
          </Card>
          <img src={LogoCool} alt="Logo" height="300" width="300" className="centeredLogo" />
        </div>
      );
    } else {
      return (
        <div>
          <Card title={'YOU ARE ALREADY LOGGED IN AS ' + this.authUser.username}>
            <Row>
              <Column>Press logout if you want to proceed to the LOGIN page.</Column>
            </Row>
            <br />
            <Row>
              <Column>
                <Button.Danger
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
      console.error('User not logged in');
    }
  }

  // logs in the user and connects a User object to the users cookie / session
  async login(username: string, password: string) {
    try {
      await wikiService.loginUser(username, password);

      Alert.success('Successfull login'); //kjører en timeout under her sånn at alert meldingen vises før vi reloader hele vinudet, ser bedre ut synes jeg
      setTimeout(() => {
        history.push('/');
        window.location.reload();
      }, 250);
      console.log("User '" + this.authUser.username + "' logged in");
    } catch (error: any) {
      console.error(error);
      Alert.warning('Wrong username or password');
    }
  }

  async logout() {
    try {
      await wikiService.logoutUser();
      
      Alert.success('Successfull logout'); //kjører en timeout under her sånn at alert meldingen vises før vi reloader hele vinudet, ser bedre ut synes jeg
      setTimeout(() => {
        window.location.reload();
      }, 250);
    } catch (error: any) {
      console.error(error);
      Alert.warning(error.message);
    }
  }
}
