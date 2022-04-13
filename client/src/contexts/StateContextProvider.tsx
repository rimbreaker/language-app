import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import encoding from '../encoding.json'
import completeImagesUrls from '../imagesUrls.json'
import config from '../util/getConfig'
import { io } from 'socket.io-client'
import { useFirebaseContext } from './FireBaseContextProvider'


const StateContext = createContext<any>('');

export const StateContextProvider = ({ children }: any) => {

    const [courseLanguage, setCourseLanguage] = useState<any>()
    const [navbarOpen, setNavbarOpen] = useState(false)
    const [backgroundImage, setBackgroundImage] = useState('')
    const [playlistStatus, setPlaylistStatus] = useState(0)

    const { fetchPlaylists } = useFirebaseContext()

    const handleBackground = (hasBackground: boolean) => {

        const url = (completeImagesUrls as string[])[parseInt((Math.random() * (completeImagesUrls as string[]).length).toString())]
        if (hasBackground)
            setBackgroundImage(url)
        else
            setBackgroundImage('')
    }

    const ensureLanguageByPlaylist = () => {
        const url = window.location.href
        if (!courseLanguage) {
            Object.keys(encoding).forEach(key => {
                if (url.split('[').length > 1)
                    if (url.split('[')[1].toLowerCase().includes(key.toLowerCase())) {
                        setCourseLanguage(key)
                        return
                    }
            })
        }

    }

    const fetchTranslation = async (phrase: string, from?: string, to?: string) => {
        return await axios({ url: `${config.SERVER_URI}/translate/${phrase}?from=${from}&to=${to}` })
            .then((res) => res.data)
    }

    const createPlaylist = async (language: string, email: string, length?: number, genre?: string) => {
        const sock = io(config.SERVER_URI)
        sock.on('connect', () => {
            sock.emit('assign', `${email}${language}`)
        })
        sock.on("playlist-status", (m) => {
            setPlaylistStatus(m)
            console.log(m)
        })
        sock.on("playlist-ready", () => {
            sock.disconnect()
            fetchPlaylists(`${email}${language}`).then(setPlaylistStatus(0))
        })
        sock.on('id', (id) => {
            let requestUrl = `${config.SERVER_URI}/createplaylist/${language}?email=${email}`
            if (length) requestUrl += `&length=${length}`
            if (genre) requestUrl += `&genre=${genre}`
            requestUrl += `&socketid=${id}`
            axios.get(requestUrl)
        })
    }

    return (
        <StateContext.Provider
            value={{
                handleBackground,
                backgroundImage,
                navbarOpen,
                setNavbarOpen,
                fetchTranslation,
                createPlaylist,
                courseLanguage,
                setCourseLanguage,
                ensureLanguageByPlaylist,
                playlistStatus
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);