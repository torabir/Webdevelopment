//Importing all modules required for this
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route } from 'react-router-dom';
import { TagArticles } from './pages/TagArticles';
import { ViewProfile } from './pages/ViewProfile';
import { Alert } from './components/widgets';
import { EditArticle } from './pages/EditArticle';
import { Login } from './pages/Login';
import { NewArticle } from './pages/NewArticle';
import { NewUser } from './pages/NewUser';
import { ResetPassword } from './pages/ResetPassword';
import { ViewArticle } from './pages/ViewArticle';
import { EditProfile } from './pages/EditProfile';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { SearchResults } from './pages/SearchResults';
import './styles/wiki.css';

//We implement Hash-router according to the same principles as we learned in DCST1007
let root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <HashRouter>
      <div>
        <Alert />
        <Menu />
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/create-user" component={NewUser} />
        <Route exact path="/create-article" component={NewArticle} />
        <Route exact path="/articles/:id" component={ViewArticle} />
        <Route exact path="/edit-profile/" component={EditProfile} />
        <Route exact path="/profile/:username" component={ViewProfile} />
        <Route exact path="/profile/:username/reset-password" component={ResetPassword} />
        <Route exact path="/articles/:id/edit" component={EditArticle} />
        <Route exact path="/search" component={SearchResults} />
        <Route exact path="/tags/:tagId/articles" component={TagArticles} />
      </div>
    </HashRouter>,
  );

  //The router is essential for the API to know which component to render when the user is at a certain path
  //We have used HashRouter in previous subjects such as DCST1007.