import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app'
import config from '../config.env.json'
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';


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

const FirebaseContext = createContext<any>('');

export const FirebaseContextProvider = ({ children }: any) => {
    const [playlists, setPlaylists] = useState<any>()
    const [singlePlaylist, setSinglePlaylist] = useState<any>()

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

        console.log('dupa')
        console.log(fetchedPlaylistDoc)
        const lul = fetchedPlaylistDoc.data()
        console.log(lul)
        const fetchedPlaylist = { id: fetchedPlaylistDoc.id, ...lul }
        console.log(fetchedPlaylist)
        setSinglePlaylist(fetchedPlaylist)
        return fetchedPlaylist
    }

    const fetchPlaylists = async (coursName: string) => {
        const fetchedPlaylists = await (await getDocs(query(playlistsRef,
            where("activeCourse", "==", coursName)))).docs
            .map(doc => ({ id: doc.id, ...(doc.data()) }))
        setPlaylists(fetchedPlaylists)
    }

    return (
        <FirebaseContext.Provider
            value={{
                playlists,
                fetchPlaylists,
                fetchSinglePlaylist
            }}
        >
            {children}
        </FirebaseContext.Provider>)
}


export const useFirebaseContext = () => useContext(FirebaseContext);