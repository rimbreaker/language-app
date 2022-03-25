import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app'
import config from '../config.env.json'
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { sign } from 'crypto';
import { useAuthContext } from './AuthContextProvider';


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

        const cachedSong = singlePlaylist.songs.find((sg: any) => sg.youtubeId === songId)
        if (cachedSong) {
            setCurrentSong(cachedSong)
            return cachedSong
        }

        if (playlistId) {
            const fetchedPlaylistDoc = await (await getDoc(doc(db, 'playlists', playlistId)))
            const fetchedPlaylist = { id: fetchedPlaylistDoc.id, ...fetchedPlaylistDoc.data() }
            setSinglePlaylist(fetchedPlaylist)
            const fetchedSong = (fetchedPlaylist as any).songs.find((sg: any) => sg.youtubeId === songId)
            setCurrentSong(fetchedSong)
            return fetchedSong
        }

        window.history.pushState({}, "", "/")
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
                fetchCurrentSong
            }}
        >
            {children}
        </FirebaseContext.Provider>)
}


export const useFirebaseContext = () => useContext(FirebaseContext);