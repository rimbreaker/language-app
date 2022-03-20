import React from 'react';
import logo from './logo.svg';
import './App.css';
import { getFirestore, collection, setDoc, doc, deleteDoc, onSnapshot, query, where, orderBy, limit, getDoc, getDocFromCache, } from 'firebase/firestore'
import { initializePerformance } from 'firebase/performance'
import { initializeAnalytics } from 'firebase/analytics'
import { getAuth, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
};

const app = initializeApp(firebaseConfig)

const auth = getAuth()
const db = getFirestore()
const langColRef = collection(db, 'languages')
const coursesRef = collection(db, 'activeCourses')
initializePerformance(app)
initializeAnalytics(app)

function App() {

  const authUnsub = onAuthStateChanged(auth, (user) => console.log(user))
  const dbUnsub = onSnapshot(langColRef, () => console.log("dupa"))
  const [user] = useAuthState(auth)

  const q = query(coursesRef, limit(10))

  const [courses] = useCollectionData(q);

  const deleteRussian = () => {
    const docRef = doc(db, 'languages', 'RU')

    deleteDoc(docRef)
  }

  const logout = () => { signOut(auth); authUnsub(); dbUnsub(); }

  const login = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).then((user) => {
      const { uid, photoURL, displayName, email } = user.user
      setDoc(doc(db, 'usersData', email || "lol"), { uid, photoURL, displayName, email })
      console.log(user)
    })
  }

  const addCourse = () => {
    const courseName = (user?.email || 'lol') + 'US'
    setDoc(doc(db, 'activeCourses', courseName), { userData: doc(db, 'usersData/', user?.email || 'lol'), percentageCompleted: 0, learnedWords: null })
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={() => deleteRussian()}>delete russian</button>
        <button onClick={() => login()}>login</button>
        <button onClick={() => logout()}>logout</button>
        {user && <button onClick={() => addCourse()}>add US course</button>}
        {
          courses?.map((course) => {
            return (<>course <button onClick={async () => {
              console.log(course, course.userData);
              console.log((await getDocFromCache(course.userData).catch(() => getDoc(course.userData))).data())

            }}>log data</button></>)
          })}
      </header>
    </div>
  );
}

export default App;
