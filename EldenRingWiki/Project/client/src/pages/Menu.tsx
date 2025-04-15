import * as React from 'react';
import { Component } from 'react-simplified';
import { NavBar, Form, Button, Column } from '../components/widgets';
import { createHashHistory } from 'history';
import wikiService from '../services/wiki-service';
import { Article } from '../classes';
import { User } from '../classes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
// @ts-ignore // VET IKKE HVORDAN MAN BEHANDLER DETTE MED TYPESCRIPT
import LogoImage from '../images/3e2afpjsi4f61.png';
import '../styles/wiki.css';

const history = createHashHistory();

//This is the navbar component which will always be rendered in the application.
//It contains a Home-button, login/profile button and a searchbar as well as our picture.

// Meny-komponent med søkefunksjonalitet/dropdown-forslag
export class Menu extends Component {
  searchWord: string = ''; 
  searchResults: Article[] = []; 
  showSuggestions: boolean = false; 
  debounceTimeout: NodeJS.Timeout | null = null;
  authUser: User = new User();

  render() {
    return (
      <div>
        <NavBar
          className="navbar-background"
          brand={
            <img
              src={LogoImage}
              alt="WIKI"
              height="80"
              width="80"
              className="logoImageEffects"
            ></img>
          }
        >
          <Column width={10} right={true}>
            {/* Søkefelt og søkeknapp i flex container */}
            <div className="flexCenterRelative">
              <Form.Input
                placeholder="Search"
                type="text"
                value={this.searchWord}
                onChange={(event) => this.handleSearchChange(event.currentTarget.value)}
                onKeyPress={(event: any) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    this.performSearch();
                  }
                }}
              />
              <Button.Light onClick={() => this.performSearch()}>Søk</Button.Light>

              {/* Dropdown for søkeforslag */}
              {this.showSuggestions && (
                <div
                  className="dropdown-suggestions"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    zIndex: 1,
                  }}
                >
                  {this.searchResults.length > 0 ? (
                    this.searchResults.slice(0, 5).map((a) => (
                      <div
                        key={a.articleId}
                        onClick={() => this.navigateToArticle(a.articleId)}
                        style={{ padding: '5px', cursor: 'pointer' }}
                      >
                        {a.title}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '5px', color: '#888' }}>Ingen resultater</div>
                  )}
                </div>
              )}
            </div>
          </Column>
          <div>
            <Column>
              {this.authUser.username === '' && (
                <Button.Light onClick={() => history.push('/login')}>Login</Button.Light>
              )}
              {this.authUser.username !== '' && (
                <NavBar.Link className="profilEffects" to={'/edit-profile'}>
                  <FontAwesomeIcon icon={faUser} /> {this.authUser.username}
                </NavBar.Link>
              )}
            </Column>
          </div>
        </NavBar>
      </div>
    );
  }

  async componentDidMount() {
    try {
      this.authUser = await wikiService.getAuthenticatedUser();
    } catch (error) {
    }
    // Legger til en event listener for å håndtere klikk utenfor dropdown for å lukke den
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    // Fjerner event listener ved unmounting for å forhindre minnelekkasje
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  // Lukk dropdown når man klikker utenfor den
  handleClickOutside = (event: MouseEvent) => {
    const dropdown = document.querySelector('.dropdown-suggestions');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.hideSuggestions();
    }
  };

  // Oppdaterer søkeord og henter forslag ved inndata fra bruker
  handleSearchChange(value: string) {
    this.searchWord = value;
    if (value.trim()) {
      this.showSuggestions = true;

      // Debounce for å begrense API-kall
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => this.fetchSuggestions(value.trim()), 300);
    } else {
      this.hideSuggestions();
    }
  }

  // Henter søkeresultater basert på brukerens inndata
  async fetchSuggestions(query: string) {
    try {
      this.searchResults = await wikiService.searchArticles(query);
      this.showSuggestions = true; // Holder dropdown åpen selv om det ikke er treff
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }

  // Utfører søk og navigerer til søkeside dersom det finnes treff
  performSearch() {
    if (this.searchWord.trim()) {
      history.push(`/search?q=${encodeURIComponent(this.searchWord.trim())}`);
      this.hideSuggestions();
    }
  }

  // Navigerer til spesifikk artikkel og skjuler forslagene
  navigateToArticle(articleId: number) {
    this.hideSuggestions();
    history.push(`/articles/${articleId}`);
    window.location.reload(); // Bruker window.location.reload() for å oppdatere siden
  }

  // Skjuler forslag og tømmer søkeresultater
  hideSuggestions() {
    this.showSuggestions = false;
    this.searchResults = [];
  }
}

// Search kilder:
// How to create a searchbar in React: // https://upmostly.com/tutorials/how-to-create-a-search-bar-in-react
// https://upmostly.com/tutorials/how-to-create-a-search-component-in-react
// https://upmostly.com/tutorials/react-filter-filtering-arrays-in-react-with-examples
// Detect click outside: https://blog.logrocket.com/detect-click-outside-react-component-how-to/
// debounce: https://www.freecodecamp.org/news/javascript-debounce-example/
// Chat-gpt er også brukt til renvasking, forlag til forbedring, samt strukturering av kode.
