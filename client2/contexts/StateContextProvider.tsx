import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import encoding from '../util/encoding.json'
import completeImagesUrls from '../util/imagesUrls.json'
import config from '../util/getConfig'

const StateContext = createContext<any>('');

export const StateContextProvider = ({ children }: any) => {
    const [courseLanguage, setCourseLanguage] = useState<any>()
    const [navbarOpen, setNavbarOpen] = useState(false)
    const [backgroundImage, setBackgroundImage] = useState('')

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
        let requestUrl = `${config.SERVER_URI}/createplaylist/${language}?email=${email}`
        if (length) requestUrl += `&length=${length}`
        if (genre) requestUrl += `&genre=${genre}`
        axios.get(requestUrl)
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
                ensureLanguageByPlaylist
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);