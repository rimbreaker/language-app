import React, { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { getDoc, doc, DocumentData, setDoc, collection, updateDoc, query, where, limit } from 'firebase/firestore'
import { useHistory } from 'react-router';
import { useCollectionData } from 'react-firebase-hooks/firestore';


const CoursePage = ({ courseLang, auth, db }: { courseLang: string, auth: any, db: any }) => {

    const [user] = useAuthState(auth)

    const coursesRef = collection(db, 'activeCourses')
    const playlitsRef = collection(db, 'playlists')
    const translationsRef = collection(db, 'translations')
    const history = useHistory()
    const [course, setCourse] = useState<DocumentData>()
    const [words, setWords] = useState<any>([])

    const playlistsQuery = query(playlitsRef, where("activeCourse", "==", doc(coursesRef, user?.email + courseLang)))
    const [playlists] = useCollectionData(playlistsQuery);


    const translationsQuery = query(translationsRef, where("activeCourse", "==", doc(coursesRef, user?.email + courseLang)))
    const [translations] = useCollectionData(translationsQuery);

    const fetchCourse = async () => {

        const courseToSave = await getDoc(doc(coursesRef, user?.email + courseLang))

        if (!(courseToSave as any).learnedWords) {
            setDoc(doc(db, 'learnedWords', user?.email + courseLang), {
                language: courseLang, activeCourse: doc(coursesRef, user?.email + courseLang)
            })
            updateDoc(doc(coursesRef, user?.email + courseLang), { learnedWords: doc(db, 'learnedWords', user?.email + courseLang) })

            setCourse({ ...courseToSave.data(), learnedWords: doc(db, 'learnedWords', user?.email + courseLang) })
        }
        else
            setCourse(courseToSave.data())
    }
    //check if course has a words list

    useEffect(() => {
        if (!course)
            fetchCourse()
    }, [])

    const fetchWordlist = async () => {
        if (course && !words) {
            const wordlist = await (await getDoc(course.learnedWords)).data()
            setWords(wordlist)
        }
    }

    return (
        <>
            <button onClick={() => history.push('/')}>go back home</button>
            language: {courseLang}
            <br />
            compeletion: {course?.percentageCompleted}
            <button onClick={fetchWordlist}> fetch wordList</button>
            {Object.entries(words).filter(([key]) => parseInt(key)).map(([key, word]: any) =>
                (<div key={key}>{key}: {word}</div>)
            )}
            course playlists:
            {playlists?.map((playlist, index) => (<div key={index}>playlist: {playlist.id}<button>open playlist</button></div>))}
            <br />
            course translations:
            {translations?.map((translations, index) => (<div key={index}>translations: {translations.id}</div>))}
        </>
    )
}

export default CoursePage