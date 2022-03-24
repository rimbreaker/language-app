import React, { useState } from 'react';
import { getFirestore, collection, setDoc, doc, deleteDoc, onSnapshot, query, where, orderBy, limit, getDoc, getDocFromCache, DocumentData, } from 'firebase/firestore'
import { initializePerformance } from 'firebase/performance'
import { initializeAnalytics } from 'firebase/analytics'
import { getAuth, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import availableLangs from './encoding.json'
import CoursePage from './CoursePage';
import { Switch, Route, withRouter, Redirect, RouteComponentProps } from 'react-router-dom'
import { useHistory } from 'react-router';
import Player from './spotifyWebPlayer/App'
import config from './config.env.json'
import LandingPage from './mantine/Landing';
import { AppShell, Container, Burger, Header, MediaQuery, Group, Text, useMantineTheme, Button, Popover, Avatar } from '@mantine/core';
import SongView from './mantine/SongView';
import CourseView from './mantine/CourseView';
import Playlist from './mantine/Playlist';
import NavbarMain from './mantine/NavbarMain';
import HeaderMain from './mantine/HeaderMain';
import { useStateContext } from './contexts/StateContextProvider';
import Auth from './mantine/Auth';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId
};

const app = initializeApp(firebaseConfig)

const auth = getAuth()
const db = getFirestore()
const coursesRef = collection(db, 'activeCourses')
initializePerformance(app)
initializeAnalytics(app)

function App() {

  const { loggedIn } = useStateContext()

  const [opened, setOpened] = useState(false)
  const theme = useMantineTheme()

  //const authUnsub = onAuthStateChanged(auth, (user) => console.log(user))
  const [user] = useAuthState(auth)

  //const q = query(coursesRef, where("userData", "==", doc(db, 'usersData/', user?.email || 'lol')), limit(10))

  // const userCoursesUnsub = user ? onSnapshot(q, () => console.log("change in courses")) : () => null

  const logout = () => {
    signOut(auth);
    //  userCoursesUnsub();
  }

  const login = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).then((user) => {
      if ((user.user.metadata as any).lastLoginAt - (user.user.metadata as any).createdAt < 10) {
        console.log("ADDING NEW USER")
        const { uid, photoURL, displayName, email } = user.user
        setDoc(doc(db, 'usersData', email || "lol"), { uid, photoURL, displayName, email })
      }
    })
  }
  const [isOver, setIsOver] = useState(false)


  const selectionHandler = () => {
    if (isOver) {
      const selection = document.getSelection()
      const range = selection?.getRangeAt(0)
      console.log(selection?.anchorNode?.textContent?.slice(range?.startOffset, range?.endOffset))
    }
  }

  return (
    <div >
      {/* //   <header className="App-header">
    //     {user ? <button onClick={() => logout()}>logout</button> : <button onClick={() => login()}>login</button>}
    //     <p onMouseUp={selectionHandler} onMouseEnter={() => setIsOver(true)} onMouseLeave={() => setIsOver(false)} >tekst lorem ipsum dłuższy tekst</p> */}
      <AppShell
        style={{ color: 'aliceblue', backgroundColor: theme.colors.dark[4] }}
        navbarOffsetBreakpoint="sm"
        fixed
        header={
          <HeaderMain />
        }
        navbar={loggedIn &&
          <NavbarMain />
        }
      >
        <Container >
          <Switch>
            <Route exact path="/player" component={Player} />
            <Route exact path='/auth' component={Auth} />
            <Route exact path='/song' component={SongView} />
            <Route exact path='/course/:courseLang' component={CoursePageByCourseLang} />
            <Route exact path='/courseview' component={CourseView} />
            <Route exact path='/firebaseStuff' component={HomePage} />
            <Route exact path='/playlist' component={Playlist} />
            <Route exact path='/' component={LandingPage} />
            <Redirect to='/' />
          </Switch>
        </Container>
      </AppShell >
    </div>
  );
}

const CoursePageByCourseLang = ({ match }: RouteComponentProps) => {
  return <CoursePage auth={auth} db={db} courseLang={(match.params as {} & { courseLang: string }).courseLang} />
}

const HomePage = () => {
  const [user] = useAuthState(auth)

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
}

export default withRouter(App);
