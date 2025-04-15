//This file fetches and displays articles associated with a specific tag, retrieved via API calls.

import * as React from 'react';
import { Component } from 'react-simplified';
import { Article, Tag } from '../classes';
import wikiService from '../services/wiki-service';
import { Card } from '../components/widgets';
import { NavLink } from 'react-router-dom';
import '../styles/wiki.css';

export class TagArticles extends Component<{ match: { params: { tagId: number } } }> {
  articles: Article[] = [];
  tagName: string = '';
  tagCount: number = 0;

  async mounted() {
    const { tagId } = this.props.match.params;

    try {
      this.articles = await wikiService.getArticlesByTag(tagId);

      const tag: Tag = await wikiService.getTag(tagId);
      if (tag) {
        this.tagName = tag.tagName;
      }
    } catch (error) {
      console.error('Error fetching articles or tag:', error);
    }

    let count = await wikiService.getTagUsageCount(Number(this.props.match.params.tagId));
    this.tagCount = count.count;
  }

  render() {
    return (
      <div className="blackBackground">
        <Card className="TurquoiseCard" title={`Articles with tag "${this.tagName}"`}>
          There {this.tagCount == 1 ? 'is' : 'are'} <b>{this.tagCount}</b>{' '}
          {this.tagCount == 1 ? 'article' : 'articles'} with this tag.
          {this.articles.length ? (
            this.articles.map((article) => (
              <Card className="basicCard" key={article.articleId} title="">
                <NavLink to={`/articles/${article.articleId}`}>
                  <h6>{article.title}</h6>
                </NavLink>
                Views: {article.views}
              </Card>
            ))
          ) : (
            <p>No articles found with this tag.</p>
          )}
        </Card>
      </div>
    );
  }
}
