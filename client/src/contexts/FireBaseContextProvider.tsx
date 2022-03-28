import React, { createContext, useContext, useState } from 'react';
import { initializeApp } from 'firebase/app'
import config from '../config.env.json'
import { getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where, increment } from 'firebase/firestore';

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
const playlistsRef = collection(db, 'playlists')
const usersRef = collection(db, 'usersData')
const corsesRef = collection(db, 'activeCourses')

const FirebaseContext = createContext<any>('');

export const FirebaseContextProvider = ({ children }: any) => {
    const [playlists, setPlaylists] = useState<any>()
    const [singlePlaylist, setSinglePlaylist] = useState<any>()
    const [currentSong, setCurrentSong] = useState<any>()
    const [translation, setTranslation] = useState<any>()
    const [courses, setCourses] = useState<any>()

    const fetchCourses = async (user: any) => {

        const coursesDocs = await getDocs(query(corsesRef, where('userMail', '==', user.email)))
        const courses = await coursesDocs.docs.map(doc => doc.data())
        setCourses(courses)
    }

    const deleteCourse = (lang: string, user: any) => {
        deleteDoc(doc(db, 'activeCourses', user.email + lang));
        setCourses((prev: any) => prev.filter((course: any) => (course.language !== lang || course.userMail !== user.email)))
    }


    const fetchSinglePlaylist = async (playlistName: string) => {
        if ((singlePlaylist?.id ?? '') === playlistName) {
            return singlePlaylist
        }

        const cachedPl = playlists?.find((pl: any) => pl?.id === playlistName) ?? false

        if (cachedPl) {
            setSinglePlaylist(cachedPl)
            return singlePlaylist
        }

        const fetchedPlaylistDoc = await getDoc(doc(db, 'playlists', playlistName))
        const fetchedPlaylist = { id: fetchedPlaylistDoc.id, ...fetchedPlaylistDoc.data() }
        setSinglePlaylist(fetchedPlaylist)
        return fetchedPlaylist
    }

    const fetchPlaylists = async (coursName: string) => {
        const fetchedPlaylists = await (await getDocs(query(playlistsRef,
            where("activeCourse", "==", coursName)))).docs
            .map(doc => ({ id: doc.id, ...(doc.data()) }))
        setPlaylists(fetchedPlaylists)
    }

    const fetchCurrentSong = async (songId: string, playlistId?: string) => {
        if ((currentSong?.youtubeId ?? '') === songId) {
            return currentSong
        }

        if (songId) {
            const fetchedSongDoc = await getDoc(doc(db, 'songs', songId))
            const fetchedSong = { id: fetchedSongDoc.id, ...(await fetchedSongDoc.data()) }
            setCurrentSong(fetchedSong)
            return fetchedSong
        }
    }

    const markSongAsTranslated = async (songId: string, playlistId: string) => {

        const lyrics = JSON.parse(localStorage.getItem(songId) ?? '{}')

        updateDoc(doc(db, 'playlists', playlistId), { [songId]: true })
        setDoc(doc(db, 'translations', songId + '[' + playlistId.split('[')[0]), { songId, playlistId, lyrics, userId: playlistId.split('-')[0] })
        updateDoc(doc(db, 'activeCourses', playlistId.split('[').slice(0, 2).join("")), { wordsLearned: increment(currentSong.lyrics.split(" ").length) })

        setSinglePlaylist((prev: any) => ({ ...prev, [songId]: true }))
        setTranslation({ songId, playlistId, lyrics, userId: playlistId.split('-')[0] })
    }

    const unmarkTranslation = async (songId: string, playlistId: string) => {

        updateDoc(doc(db, 'playlists', playlistId), { [songId]: false })
        deleteDoc(doc(db, 'translations', songId + '[' + playlistId.split('[')[0]))
        updateDoc(doc(db, 'activeCourses', playlistId.split('[').slice(0, 2).join("")), { wordsLearned: increment(-currentSong.lyrics.split(" ").length) })

        setSinglePlaylist((prev: any) => ({ ...prev, [songId]: undefined }))
        setTranslation(undefined)
    }

    const createNewCourse = async (user: any, language: any) => {

        const langCode = language.encode

        const newCourse = {
            courseName: user.email + language.encode,
            language: langCode,
            userMail: user.email,
            wordsLearned: 0
        }
        await setDoc(doc(db, 'activeCourses', user.email + langCode), newCourse)
        setCourses((prev: any[]) => [...prev, newCourse])
    }


    return (
        <FirebaseContext.Provider
            value={{
                deleteCourse,
                fetchCourses,
                courses,
                setPlaylists,
                playlists,
                fetchPlaylists,
                setSinglePlaylist,
                fetchSinglePlaylist,
                auth,
                db,
                usersRef,
                currentSong,
                setCurrentSong,
                fetchCurrentSong,
                markSongAsTranslated,
                unmarkTranslation,
                createNewCourse
            }}
        >
            {children}
        </FirebaseContext.Provider>)
}


export const useFirebaseContext = () => useContext(FirebaseContext);