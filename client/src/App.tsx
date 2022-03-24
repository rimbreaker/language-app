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

function App() {

  const { isLoggedIn } = useAuthContext()

  const theme = useMantineTheme()

  return (
    <div >
      <AppShell
        style={{ color: 'aliceblue', backgroundColor: theme.colors.dark[4] }}
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

/*
const HomePage = () => {

  const q = query(coursesRef, where("userData", "==", doc(db, 'usersData/', user?.email || 'lol')), limit(10))

  const [courses] = useCollectionData(q);

  const [newCourseLanguage, setNewCourseLanguage] = useState('english')

  const deleteCourse = (course: DocumentData) => {
    deleteDoc(doc(db, 'activeCourses', course.id))
  }

  const createNewCourse = () => {

    const languageEncoding = Object.entries(availableLangs as any).find(([_key, value]: any) => value.name === newCourseLanguage)?.[0]
    if (!courses?.find(course => course.language === languageEncoding)) {
      const courseName = (user?.email || 'failedUser') + languageEncoding
      setDoc(doc(db, 'activeCourses', courseName), { id: courseName, userData: doc(db, 'usersData/', user?.email || ''), percentageCompleted: 0, learnedWords: null, language: languageEncoding })
    } else {
      alert('you already ahve a course in that language')
    }
  }

  const history = useHistory()
  return (<>
    {user && <>
      <p> select language:  <select value={newCourseLanguage} onChange={(e) => setNewCourseLanguage(e.target.value)}>
        {Object.values(availableLangs).map(({ name }: any) => (
          <option key={name} >{name}</option>
        ))}
      </select>
        <button onClick={() => createNewCourse()}>add course</button>
      </p>
      <h3>your courses:</h3>
      {
        courses?.map((course, i) => {
          return (<div key={i}>
            {course.language} course: {course.percentageCompleted}% completed
            <button onClick={async () => {
              history.push('/course/' + course.language)
            }}>
              open course
            </button>
            <button onClick={() => deleteCourse(course)}>
              delete course
            </button>
          </div>)
        })}
    </>}</>
  )
}*/

export default withRouter(App);
