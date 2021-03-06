// src/App.js

import { linkEvent } from 'inferno';
import Component from 'inferno-component';
import auth0 from 'auth0-js';
import ApiService from './utils/ApiService';
import DinoList from './components/DinoList/DinoList';
import Login from './components/Login/Login';
import User from './components/User/User';
import Loading from './components/Loading/Loading';
import './App.css';

function logOut(instance) {
  // Remove token and profile from state
  // (using instance passed in by linkEvent to preserve "this" context)
  instance.setState({
    idToken: null,
    profile: null
  });

  // Remove token and profile from localStorage
  localStorage.removeItem('id_token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('profile');
}

class App extends Component {
  constructor() {
    super();

    // Initial authentication state:
    // check for existing token and profile
    this.state = {
      idToken: localStorage.getItem('id_token'),
      profile: JSON.parse(localStorage.getItem('profile'))
    };
  }

  componentDidMount() {
    // Create Auth0 WebAuth instance
    this.auth0 = new auth0.WebAuth({
      clientID: '[YOUR_CLIENT_ID]',
      domain: '[YOUR_CLIENT_DOMAIN]'
    });

    // When Auth0 hash parsed, get profile
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.idToken && authResult.accessToken) {
        // Use access token to retrieve user's profile and set session
        // If you wanted to protect API requests, you'd use the access token to do so!
        // For more information, please see: https://auth0.com/docs/api-auth/grant/implicit
        this.auth0.client.userInfo(authResult.accessToken, (err, profile) => {
          window.location.hash = '';

          // Save tokens and profile to state
          this.setState({
            idToken: authResult.idToken,
            profile: profile
          });

          // Save tokens and profile to localStorage
          localStorage.setItem('id_token', this.state.idToken);
          // access_token should be used to protect API requests using an Authorization header
          localStorage.setItem('access_token', this.state.accessToken);
          localStorage.setItem('profile', JSON.stringify(profile));
        });
      }
    });

    // GET list of dinosaurs from API
    ApiService.getDinoList()
      .then(
        res => {
          // Set state with fetched dinos list
          this.setState({
            dinos: res
          });
        },
        error => {
          // An error occurred, set state with error
          this.setState({
            error: error
          });
        }
      );
  }

  render(props, state) {
    return(
      <div className="App">
        <header className="App-header bg-primary clearfix">
          <div className="App-auth pull-right">
            {
              !state.idToken ? (
                <Login auth0={this.auth0} />
              ) : (
                <div className="App-auth-loggedIn">
                  <User profile={state.profile} />
                  <a
                    className="App-auth-loggedIn-logout"
                    onClick={linkEvent(this, logOut)}>Log Out</a>
                </div>
              )
            }
            </div>
          <h1 className="text-center">Dinosaurs</h1>
        </header>
        <div className="App-content container-fluid">
          <div className="row">
            {
              state.dinos ? (
                <DinoList dinos={state.dinos} />
              ) : (
                <Loading error={state.error} />
              )
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
