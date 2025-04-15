//This is the class that makes the search-bar (in the top navBar) work.

//

import * as React from 'react';
import { Component } from 'react-simplified';
import { RouteComponentProps } from 'react-router-dom';
import wikiService from '../services/wiki-service';
import { Article } from '../classes';
import { Card } from '../components/widgets';
import '../styles/wiki.css';

interface SearchResultsProps extends RouteComponentProps {}
//This line gives us the ability to use props such as location, history and match

export class SearchResults extends Component<SearchResultsProps> {
  searchResults: Article[] = []; // All search-results must have the same parameters as an Article.

  render() {
    return (
      <div className="blackBackground">
        <Card className="TurquoiseCard" title="Søkeresultater">
          {this.searchResults.length > 0 ? (
            this.searchResults.map((article) => (
              <div key={article.articleId} style={{ padding: '5px 0' }}>
                <a href={`#/articles/${article.articleId}`}>{article.title}</a>
              </div>
            ))
          ) : (
            <div>Ingen treff for søket.</div>
          )}
        </Card>
      </div>
    );
  }

  async componentDidMount() {
    const query = new URLSearchParams(this.props.location.search).get('q');
    if (query) {
      try {
        this.searchResults = await wikiService.searchArticles(query);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
  }
}

//Sources used for this page:
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
// https://reactrouter.com/en/main/hooks/use-location
// https://dev.to/vikram-boominathan/search-params-and-use-location-5b7h
// OpenAI for error-checking and debugging
