import axios from 'axios';
import React, { createContext, useContext, useState } from 'react';
import { useHistory } from 'react-router';
import encoding from '../encoding.json'

const StateContext = createContext<any>('');

export const StateContextProvider = ({ children }: any) => {
    const [courseLanguage, setCourseLanguage] = useState<any>()
    const [navbarOpen, setNavbarOpen] = useState(false)
    const history = useHistory()

    //TODO: fix this boi
    const ensureLanguage = () => {
        const url = window.location.href
        if (!courseLanguage) {
            Object.keys(encoding).forEach(key => {
                if (url.toLowerCase().includes(key.toLowerCase()))
                    setCourseLanguage(key)
                return
            })
            history.push('/')
        }

    }

    const fetchTranslation = async (phrase: string, from?: string, to?: string) => {
        return await axios({ url: `http://localhost:4000/translate/${phrase}?from=${from}&to=${to}` })
            .then((res) => res.data)
    }

    const createPlaylist = async (language: string, email: string, length?: number, genre?: string) => {
        let requestUrl = `http://localhost:4000/createplaylist/${language}?email=${email}`
        if (length) requestUrl += `&length${length}`
        if (genre) requestUrl += `&genre=${genre}`
        axios.get(requestUrl)
    }

    return (
        <StateContext.Provider
            value={{
                navbarOpen,
                setNavbarOpen,
                fetchTranslation,
                createPlaylist,
                courseLanguage,
                setCourseLanguage,
                ensureLanguage
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);