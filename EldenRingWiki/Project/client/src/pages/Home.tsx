//Importing all modules required for this
import * as React from 'react';
import { Component } from 'react-simplified';
import { NavLink } from 'react-router-dom';
import { Card, Form, Button, Column, Row } from '../components/widgets';
import { Article, User, Tag } from '../classes';
import wikiService from '../services/wiki-service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; //Package for the icons
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/wiki.css';
// @ts-ignore // Not sure how this is done with TS, but it works.
import wikiLogo from '../images/download1.png';
import { createHashHistory } from 'history';

export const history = createHashHistory();

export class Home extends Component {
  articles: Article[] = []; // here we are fetching 5 articles at a time  based on the pagination page
  tags: Tag[] = []; // here we are fetching 5 tags at a time based on the pagination page
  user: User = new User();
  currentPage: number = 1;
  pageSize: number = 5;
  sortBy: string = 'views';
  numberOfArticles: number = 0;
  numberOfTags: number = 0;
  currentTagPage: number = 1;
  tagPageSize: number = 5;
  tagSortBy: string = 'timesUsed';

  // in paginatedarticles() and setpage() i have gotte help from chatGPT

  // offsetpagination methods
  setPage(page: number) {
    if (page > 0 && page <= Math.ceil(this.numberOfArticles / this.pageSize)) {
      this.currentPage = page;
    }
  }
  setTagPage(page: number) {
    //We have used a similar function last year in DCST1003
    if (page > 0 && page <= Math.ceil(this.numberOfTags / this.tagPageSize)) {
      this.currentTagPage = page;
    }
  }

  render() {
    return (
      <div className="blackBackground">
        <Card title="" className="blackBackground">
          <Card className="CenteredFontStyle" title="Welcome to the">
            <div className="centeredImage">
              <img src={wikiLogo} alt="wiki" />
            </div>
            <div className="youTubeEmbed">
              <iframe
                title="Youtube Video"
                src="https://www.youtube.com/embed/E3Huy2cdih0"
                width="750"
                height="300"
                allowFullScreen
              ></iframe>
            </div>
            <div className="smallText">
              ELDEN RING - Official Gameplay Reveal Trailer - Bandai Namco™
            </div>
          </Card>
          <Card className="TurquoiseCard" title="">
            <Row>
              <Column width={2}>
                {' '}
                <h3>ARTICLES</h3>{' '}
              </Column>{' '}
              Sort by:
              <Column>
                <Form.Select
                  value={this.sortBy}
                  onChange={(event) => {
                    this.sortBy = event.currentTarget.value;
                    this.loadContents();
                  }}
                >
                  <option value="views">Views</option>
                  {''}
                  <option value="alphabetically">Alphabetically</option>
                </Form.Select>
              </Column>
            </Row>
            {this.articles.map((a) => {
              return (
                <div key={a.articleId}>
                  <Card className="basicCard" title="">
                    <NavLink to={'articles/' + a.articleId}>
                      {' '}
                      <h6>{a.title}</h6>
                    </NavLink>
                    sett {a.views} ganger <br /> <br />
                  </Card>
                </div>
              );
            })}

            <Button.Light
              onClick={() => {
                if (this.currentPage !== 1) this.setPage(this.currentPage - 1);
                this.getPaginatedArticles();
              }}
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </Button.Light>
            <span>
              {' '}
              Page {this.currentPage} of {Math.ceil(this.numberOfArticles / this.pageSize)}{' '}
            </span>
            <Button.Light
              onClick={() => {
                if (this.currentPage !== Math.ceil(this.numberOfArticles / this.pageSize))
                  this.setPage(this.currentPage + 1);
                this.getPaginatedArticles();
              }}
            >
              {' '}
              <FontAwesomeIcon icon={faAngleRight} />{' '}
            </Button.Light>
          </Card>
          <Card className="TurquoiseCard" title="">
            <Row>
              <Column width={2}>
                {' '}
                <h3>TAGS</h3>{' '}
              </Column>
              Sort by:
              <Column>
                <Form.Select
                  value={this.tagSortBy}
                  onChange={(event) => {
                    this.tagSortBy = event.currentTarget.value;
                    this.loadContents();
                  }}
                >
                  <option value="alphabetically">Alphabetically</option>
                </Form.Select>
              </Column>
            </Row>

            {this.tags.map((t) => {
              return (
                <div key={t.tagId}>
                  <Card className="basicCard" title="">
                    <NavLink to={`/tags/${t.tagId}/articles`}>
                      <h6>{t.tagName}</h6>
                    </NavLink>
                    <p>
                      {t.usageCount || t.usageCount === 0
                        ? 'Brukt ' + t.usageCount + ' ganger'
                        : 'loading...'}{' '}
                      <br /> <br />
                    </p>
                  </Card>
                </div>
              );
            })}

            <Button.Light
              onClick={() => {
                if (this.currentTagPage !== 1) this.setTagPage(this.currentTagPage - 1);
                this.getPaginatedTags();
              }}
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </Button.Light>
            <span>
              {' '}
              Page {this.currentTagPage} of {Math.ceil(this.numberOfTags / this.tagPageSize)}{' '}
            </span>
            <Button.Light
              onClick={() => {
                if (this.currentTagPage !== Math.ceil(this.numberOfTags / this.tagPageSize))
                  this.setTagPage(this.currentTagPage + 1);
                this.getPaginatedTags();
              }}
            >
              {' '}
              <FontAwesomeIcon icon={faAngleRight} />{' '}
            </Button.Light>
          </Card>
          <Card className="basicCard" title="">
            <Column>
              <Button.Success
                small={false}
                onClick={() => {
                  if (this.user.username === '') history.push('/login');
                  else history.push('/create-article');
                }}
              >
                New Article
              </Button.Success>
            </Column>
            <Column right={true} width={8}>
              <Button.Success
                small={false}
                onClick={() => {
                  if (this.user.username !== '') history.push('/edit-profile/');
                  else history.push('/login');
                }}
              >
                Profile
              </Button.Success>
            </Column>
          </Card>
        </Card>
      </div>
    );
  }

  mounted() {
    this.login();
    this.loadContents();
  }

  // gets paginated articles and tags and check how many articles/tags exist
  loadContents() {
    this.getPaginatedArticles();
    this.countArticles();
    this.getPaginatedTags();
    this.countTags();
  }

  // gets user if user is logged in
  async login() {
    try {
      this.user = await wikiService.getAuthenticatedUser();
    } catch (error) {
      console.log('User is not logged in.');
    }
  }

  // get pages 5 by 5 based on the page number
  async getPaginatedArticles() {
    try {
      this.articles = await wikiService.getPaginatedArticles(
        this.currentPage,
        this.pageSize,
        this.sortBy,
      );
    } catch (error) {
      console.error('Could not get articles:', error);
    }
  }

  // gets how many times a tag is used
  async getTagUsageCounts() {
    try {
      //
      const promises = this.tags.map((tag) =>
        wikiService.getTagUsageCount(tag.tagId).then((usageCount) => {
          tag.usageCount = usageCount.count ?? 0; // Assigner 0 hvis usageCount er undefined
        }),
      );

      // venter på at alle promisene som blir kjørt i map funksjonen skal fullføre
      await Promise.all(promises);
    } catch (error) {
      console.error('Could not get tag usage counts:', error);
    }
  }

  async getPaginatedTags() {
    try {
      this.tags = await wikiService.getPaginatedTags(
        this.currentTagPage,
        this.tagPageSize,
        this.tagSortBy,
      );

      await this.getTagUsageCounts();

      this.forceUpdate(); // Force a re-render if necessary
    } catch (error) {
      console.error('Could not get tags:', error);
    }
  }

  async countArticles() {
    const count = await wikiService.getCountArticles();
    this.numberOfArticles = count.count;
  }

  async countTags() {
    const count = await wikiService.getCountTags();
    this.numberOfTags = count.count;
  }
}
