import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Component } from 'react-simplified';
import { HashRouter, NavLink, Route } from 'react-router-dom';
import { Card, Alert, Form, Button, Column, Row } from './widgets';
import { EditArticle, Login, NewArticle, NewUser, ResetPassword, ViewArticle, ViewProfile } from './task-components';
import { User } from './classes';
import taskService from './task-service';
import { history } from './task-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { Menu } from './menu';
import { SearchResults } from './searchResults';
//@ts-ignore

// Make sure the path is correct
import './wiki.css';
import wikiLogo from './images/download1.png';
class Home extends Component {
  articles = []; // her henter vi inn et viss antall artikler om gangen ettersom når de trengs å vises, altså vi henter ikke inn alle artiklene på 1 gang
  tags = []; // her henter vi inn et viss antall tags om gangen ettersom når de trengs å vises, altså vi henter ikke inn alle tagsene på 1 gang
  user = new User();
  currentPage = 1;
  pageSize = 5;
  sortBy = 'views';
  numberOfArticles = 0;
  numberOfTags = 0;
  currentTagPage = 1;
  tagPageSize = 5;
  tagSortBy = 'timesUsed';

  // på paginatedarticles() og setpage() har jeg fått hjelp fra chatGPT

  // det kalles OFFSET-BASED PAGINATION,
  // KAN VÆRE LURT Å GJØRE OM PÅ NØYAKTIG HVODAN DETTE GJØRES FORDI Å LASTE INN ALLE ARTIKLENE KAN VÆRE TIDKREVENDE OM MAN HAR EN STOR DATABASE
  // DET SAMME GJELDER I CREATE USER NÅR VI SJEKKER OM BRUKER ALLEREDE EKSISTERER
  // KAN SKRIVE NYE DATABASEKALL SOM HJELPER OSS MED DETTE I GUESS

  setPage(page) {
    if (page > 0 && page <= Math.ceil(this.numberOfArticles / this.pageSize)) {
      this.currentPage = page;
    }
  }
  setTagPage(page) {
    if (page > 0 && page <= Math.ceil(this.numberOfArticles / this.tagPageSize)) {
      this.currentTagPage = page;
    }
  }
  render() {
    return /*#__PURE__*/React.createElement(Card, {
      title: "",
      className: "blackBackground"
    }, /*#__PURE__*/React.createElement(Card, {
      className: "CenteredFontStyle",
      title: "Velkommen til"
    }, /*#__PURE__*/React.createElement("div", {
      className: "centeredImage"
    }, /*#__PURE__*/React.createElement("img", {
      src: wikiLogo,
      alt: "wiki"
    }))), /*#__PURE__*/React.createElement(Card, {
      className: "TurquoiseCard",
      title: ""
    }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Column, {
      width: 1
    }, ' ', /*#__PURE__*/React.createElement("h3", {
      className: "FontStyle"
    }, "Articles"), ' '), "Sort by:", /*#__PURE__*/React.createElement(Column, null, /*#__PURE__*/React.createElement(Form.Select, {
      value: this.sortBy,
      onChange: event => {
        this.sortBy = event.currentTarget.value;
        this.mounted();
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "views"
    }, "Views"), /*#__PURE__*/React.createElement("option", {
      value: "alphabetically"
    }, "Alphabetically")))), this.articles.map(a => {
      return /*#__PURE__*/React.createElement("div", {
        key: a.articleId
      }, /*#__PURE__*/React.createElement(Card, {
        className: "basicCard",
        title: ""
      }, /*#__PURE__*/React.createElement(NavLink, {
        to: 'articles/' + a.articleId
      }, ' ', /*#__PURE__*/React.createElement("h6", null, a.title)), "sett ", a.views, " ganger ", /*#__PURE__*/React.createElement("br", null), " ", /*#__PURE__*/React.createElement("br", null)));
    }), /*#__PURE__*/React.createElement(Button.Light, {
      onClick: () => {
        if (this.currentPage !== 1) this.setPage(this.currentPage - 1);
        this.getPaginatedArticles();
      }
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faAngleLeft
    })), /*#__PURE__*/React.createElement("span", null, ' ', "Page ", this.currentPage, " of ", Math.ceil(this.numberOfArticles / this.pageSize), ' '), /*#__PURE__*/React.createElement(Button.Light, {
      onClick: () => {
        if (this.currentPage !== Math.ceil(this.numberOfArticles / this.pageSize)) this.setPage(this.currentPage + 1);
        this.getPaginatedArticles();
      }
    }, ' ', /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faAngleRight
    }), ' ')), /*#__PURE__*/React.createElement(Card, {
      className: "TurquoiseCard",
      title: ""
    }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Column, {
      width: 1
    }, ' ', /*#__PURE__*/React.createElement("h3", null, "Tags"), ' '), "Sort by:", /*#__PURE__*/React.createElement(Column, null, /*#__PURE__*/React.createElement(Form.Select, {
      value: this.tagSortBy,
      onChange: event => {
        this.tagSortBy = event.currentTarget.value;
        this.mounted();
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "timesUsed"
    }, "Times Used"), /*#__PURE__*/React.createElement("option", {
      value: "alphabetically"
    }, "Alphabetically")))), this.tags.map(t => {
      return /*#__PURE__*/React.createElement("div", {
        key: t.tagId
      }, /*#__PURE__*/React.createElement(Card, {
        className: "basicCard",
        title: ""
      }, /*#__PURE__*/React.createElement(NavLink, {
        to: 'tags/' + t.tagId
      }, ' ', /*#__PURE__*/React.createElement("h6", null, t.tagName)), "Brukt ", t.tagCount, " ganger ", /*#__PURE__*/React.createElement("br", null), " ", /*#__PURE__*/React.createElement("br", null)));
    }), /*#__PURE__*/React.createElement(Button.Light, {
      onClick: () => {
        if (this.currentTagPage !== 1) this.setTagPage(this.currentTagPage - 1);
        this.getPaginatedTags();
      }
    }, /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faAngleLeft
    })), /*#__PURE__*/React.createElement("span", null, ' ', "Page ", this.currentTagPage, " of ", Math.ceil(this.numberOfTags / this.tagPageSize), ' '), /*#__PURE__*/React.createElement(Button.Light, {
      onClick: () => {
        if (this.currentTagPage !== Math.ceil(this.numberOfTags / this.tagPageSize)) this.setTagPage(this.currentTagPage + 1);
        this.getPaginatedTags();
      }
    }, ' ', /*#__PURE__*/React.createElement(FontAwesomeIcon, {
      icon: faAngleRight
    }), ' ')), /*#__PURE__*/React.createElement(Card, {
      className: "basicCard",
      title: ""
    }, /*#__PURE__*/React.createElement(Column, null, /*#__PURE__*/React.createElement(Button.Success, {
      className: "buttonTurquoise",
      small: false,
      onClick: () => {
        console.log(this.user);
        if (this.user.username === '') history.push('/login');else history.push('/create-article');
      }
    }, "New Article")), /*#__PURE__*/React.createElement(Column, {
      right: true,
      width: 8
    }, /*#__PURE__*/React.createElement(Button.Success, {
      small: false,
      onClick: () => {
        history.push('/profile/:id');
      }
    }, "Profile"))));
  }
  mounted() {
    this.login();
    this.getPaginatedArticles();
    this.countArticles();
    this.getPaginatedTags();
    this.countTags();
  }
  async login() {
    try {
      this.user = await taskService.getAuthenticatedUser();
    } catch (error) {
      console.error('User is not logged in.');
    }
  }
  async getPaginatedArticles() {
    try {
      this.articles = await taskService.getPaginatedArticles(this.currentPage, this.pageSize, this.sortBy);

      // if (this.sortBy === 'recent') this.articles = articles.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error('Could not get articles:', error);
    }
  }
  async getPaginatedTags() {
    try {
      this.tags = await taskService.getPaginatedTags(this.currentTagPage, this.tagPageSize, this.tagSortBy);
    } catch (error) {
      console.error('Could not get tags:', error);
    }
  }
  async countArticles() {
    const count = await taskService.getCountArticles();
    this.numberOfArticles = count.count;
  }
  async countTags() {
    const count = await taskService.getCountTags();
    this.numberOfTags = count.count;
  }
}
let root = document.getElementById('root');
if (root) createRoot(root).render(/*#__PURE__*/React.createElement(HashRouter, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Alert, null), /*#__PURE__*/React.createElement(Menu, null), /*#__PURE__*/React.createElement(Route, {
  exact: true,
  path: "/",
  component: Home
}), /*#__PURE__*/React.createElement(Route, {
  exact: true,
  path: "/login",
  component: Login
}), /*#__PURE__*/React.createElement(Route, {
  exact: true,
  path: "/create-user",
  component: NewUser
}), /*#__PURE__*/React.createElement(Route, {
  exact: true,
  path: "/create-article",
  component: NewArticle
}), /*#__PURE__*/React.createElement(Route, {
  path: "/articles/:id",
  component: ViewArticle
}), /*#__PURE__*/React.createElement(Route, {
  path: "/profile/:username",
  component: ViewProfile
}), /*#__PURE__*/React.createElement(Route, {
  path: "/profile/:username/reset-password",
  component: ResetPassword
}), /*#__PURE__*/React.createElement(Route, {
  path: "/articles/:id/edit",
  component: EditArticle
}), /*#__PURE__*/React.createElement(Route, {
  exact: true,
  path: "/search",
  component: SearchResults
}))));