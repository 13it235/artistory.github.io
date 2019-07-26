import React, { Component } from 'react';
import './App.css';
import Header from './header';
import SideBarItem from './sideBar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as artistActions from './actions/artists.action';
import cookie from 'react-cookie';
import axios from 'axios';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import Dashboard from './components/dashboard';
import Artist from './components/artist';

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      artists: []
    }

    this.searchResults = this.getArtists.bind(this);
    this.selectedArtist = this.selectedArtist.bind(this);
  }

  componentDidMount() {
    if (!cookie.load('access_token')) {
      this.props.history.push('/')
    }
    else {
      var self = this;
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + cookie.load('access_token');
      axios.interceptors.response.use(function (response) {
        return response;
      }, function (error) {
        if (error.response.status === 401) {
          cookie.remove('access_token');
          alert('Session expired');
          self.props.history.push('/login')
        }
      })
      this.props.history.push('/app/dashboard')
    }
  }

  getArtists(searchedTerm) {
    if (searchedTerm.length > 0) {
      var artists = [];
      this.props.artistActions.searchArtistOnSpotify(searchedTerm, res => {
        if (res.artists !== undefined && res.artists !== null) {
          res.artists.items.forEach(item => {
            artists.push({
              id: item.id,
              name: item.name,
              image: item.images.length > 0 ? item.images[0].url : '',
              followers: item.followers.total,
              genre: item.genres.length > 0 ? item.genres : ['Unavailable'],
              popularity: item.popularity
            })
          })
          this.setState({ artists: artists });
        }
      })
    }
    else {
      this.setState({ artists: [] });
      this.props.history.push('/app/dashboard')
    }
  }

  selectedArtist(id) {
    this.setState({ id: id })
  }

  render() {
    return (
      <BrowserRouter>
        <div className="app_container">
          <Header searchValue={(event) => this.searchResults(event.target.value)} />
          <div className="row" style={{ position: 'relative', top: '80px' }}>
            {
              this.state.artists.length > 0 &&
              <div className="col-sm-3 fitSidebar">
                {/* <Link to={`/${this.state.id}`}>
                  <SideBar artists={this.state.artists} onClickArtist={(event) => { this.selectedArtist(event) }} />
                </Link> */}
                <div className="sideBar">
                  {
                    this.state.artists.map(artist => {
                      return (
                        <Link to={`/app/artist/${artist.id}`} key={artist.id}>
                          <SideBarItem artist={artist} />
                        </Link>
                      )
                    }
                    )
                  }
                </div>
              </div>
            }
            <div className={this.state.artists.length === 0 ? "col-sm-12 app_content" : "col-sm-9 app_content"}>
              <Route path="/app/dashboard" component={Dashboard} />
              <Route exact path="/">
                <Redirect to="/app/dashboard" />
              </Route>
              <Route path={`/app/artist/:id`} component={Artist} />
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    artists: state.artists
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    artistActions: bindActionCreators(artistActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
