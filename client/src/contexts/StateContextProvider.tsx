import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

const StateContext = createContext<any>('');

export const StateContextProvider = ({ children }: any) => {
    const [courseLanguage, setCourseLanguage] = useState('EN')//TODO: make it not have a default
    const [navbarOpen, setNavbarOpen] = useState(false)

    const [translation, setTranslation] = useState<any>()


    const fetchTranslation = async (phrase: string, from?: string, to?: string) => {
        setTranslation(
            await (await axios({ url: `http://localhost:4000/translate/${phrase}?from=${from}&to=${to}` })).data
        )
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
                translation,
                createPlaylist,
                courseLanguage,
                setCourseLanguage
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);