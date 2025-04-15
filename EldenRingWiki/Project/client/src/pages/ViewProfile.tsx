//This class renderes a personalized profile page for each user. 


import * as React from 'react';
import { Component } from 'react-simplified';
import { ArticleVersion } from '../classes';
import wikiService from '../services/wiki-service';
import { Card, Row, Column } from '../components/widgets';
import { NavLink } from 'react-router-dom';
import { User } from '../classes';
import '../styles/wiki.css';

export class ViewProfile extends Component<{ match: { params: { username: string } } }> {
  user: User = new User();
  articles: ArticleVersion[] = [];
  bio: string = 'This user has not written a bio yet...';

  render() {
    return (
      <div className="blackBackground">
        <Card title={this.props.match.params.username + "'s profile" /* Takes in a paramater from the path */} className="TurquoiseCard">
          <br />
          <Row>
            <Column width={9}>
              <img
                src={this.user.profilePicture}
                alt={new User().profilePicture}
                style={{
                  width: '250px',
                  height: '250px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid black',
                }}
              ></img>
              <Row></Row>
              <br />
              <Row>
                <Column width={5}>
                  <Card title="Biography" className="basicCard">
                    <div style={{ width: '300px', minHeight: '150px', fontStyle: 'italic' }}>
                      {this.user.bio ? this.user.bio : this.bio}
                    </div>
                  </Card>
                </Column>
              </Row>
            </Column>
            <Column>
              <Card title="Articles contributed in" className="basicCard">
                <ul>
                  {this.articles.map((a) => (
                    <li key={a.articleId}>
                      <b>Article: </b>
                      <NavLink to={`/articles/${a.articleId}`}> {a.title}</NavLink>
                    </li>
                  ))}
                </ul>
              </Card>
            </Column>
          </Row>
          <br />
          <Row></Row>
          <br />
          <Row></Row>
        </Card>
      </div>
    );
  }

  // fetches user info and articles user has contributed in
  async mounted() {
    this.user = new User(); // this fixes a problem where user profiles would not load the updated content because it kept on rendering the last users profile pic and bio // this happened if image or bio wass null in database
    // this problem would not occur if we started creating users now but for now it is needed
    try {
      this.user = await wikiService.getUser(this.props.match.params.username);
    } catch (error) {}

    this.articles = await wikiService.getUserArticles(this.props.match.params.username);

    // Chat gpt is used from here -->
    // Filter out duplicate articleIds
    const uniqueArticlesMap = new Map();
    this.articles.forEach((article) => {
      if (!uniqueArticlesMap.has(article.articleId)) {
        uniqueArticlesMap.set(article.articleId, article);
      }
    });

    // Convert Map values back to an array
    this.articles = Array.from(uniqueArticlesMap.values());
    // --> to here
  }
}
