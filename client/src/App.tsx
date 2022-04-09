import React from 'react';
import { Switch, Route, withRouter, Redirect } from 'react-router-dom'
import LandingPage from './mantine/Landing';
import { AppShell, Container, useMantineTheme } from '@mantine/core';
import SongView from './mantine/SongView';
import CourseView from './mantine/CourseView';
import Playlist from './mantine/Playlist';
import NavbarMain from './mantine/NavbarMain';
import HeaderMain from './mantine/HeaderMain';
import Auth from './mantine/SpotifyAuth';
import { useAuthContext } from './contexts/AuthContextProvider';
import FallbackPage from './mantine/FallbackPage';
import { useStateContext } from './contexts/StateContextProvider';

function App() {

  const { isLoggedIn } = useAuthContext()
  const { backgroundImage } = useStateContext()

  const theme = useMantineTheme()

  return (
    <div >
      <AppShell
        style={{ color: 'aliceblue', backgroundColor: theme.colors.dark[4], backgroundImage: `url(${backgroundImage})` }}
        navbarOffsetBreakpoint="sm"
        fixed
        header={
          <HeaderMain />
        }
        navbar={isLoggedIn &&
          <NavbarMain />
        }
      >
        <Container >
          <Switch>
            <Route exact path='/song' component={isLoggedIn ? SongView : FallbackPage} />
            <Route exact path='/courseview' component={isLoggedIn ? CourseView : FallbackPage} />
            <Route exact path='/courseview' component={isLoggedIn ? CourseView : FallbackPage} />
            <Route exact path='/playlist' component={isLoggedIn ? Playlist : FallbackPage} />
            <Route exact path='/auth' component={Auth} />
            <Route exact path='/' component={LandingPage} />
            <Redirect to='/' />
          </Switch>
        </Container>
      </AppShell >
    </div>
  );
}

export default withRouter(App);
