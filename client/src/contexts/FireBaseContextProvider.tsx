import React, { createContext, useContext, useState } from 'react';
import { initializeApp } from 'firebase/app'
import config from '../config.env.json'
import { getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';

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

const FirebaseContext = createContext<any>('');

export const FirebaseContextProvider = ({ children }: any) => {
    const [playlists, setPlaylists] = useState<any>()
    const [singlePlaylist, setSinglePlaylist] = useState<any>()
    const [currentSong, setCurrentSong] = useState<any>()
    const [translation, setTranslation] = useState<any>()


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

        setSinglePlaylist((prev: any) => ({ ...prev, [songId]: true }))
        setTranslation({ songId, playlistId, lyrics, userId: playlistId.split('-')[0] })
    }

    const unmarkTranslation = async (songId: string, playlistId: string) => {

        updateDoc(doc(db, 'playlists', playlistId), { [songId]: false })
        deleteDoc(doc(db, 'translations', songId + '[' + playlistId.split('[')[0]))

        setSinglePlaylist((prev: any) => ({ ...prev, [songId]: undefined }))
        setTranslation(undefined)
    }


    return (
        <FirebaseContext.Provider
            value={{
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
                unmarkTranslation
            }}
        >
            {children}
        </FirebaseContext.Provider>)
}


export const useFirebaseContext = () => useContext(FirebaseContext);