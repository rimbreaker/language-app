import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

const StateContext = createContext<any>('');

export const StateContextProvider = ({ children }: any) => {
    const [navbarOpen, setNavbarOpen] = useState(false)
    const [loggedIn] = useState(true)
    const [preAuthLocation, setPreAuthLocation] = useState('/')

    const [translation, setTranslation] = useState<any>()


    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const [expiresIn, setExpiresIn] = useState()

    const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false)

    useEffect(() => {
        if (!refreshToken || !expiresIn) return
        const interval = setInterval(() => {
            axios
                .post("http://localhost:4000/refresh", {
                    refreshToken,
                })
                .then(res => {
                    setAccessToken(res.data.accessToken)
                    setExpiresIn(res.data.expiresIn)
                })
                .catch(() => {
                    window.location = ("/" as any)
                })
        }, (expiresIn - 60) * 1000)

        return () => clearInterval(interval)
    }, [refreshToken, expiresIn])


    const fetchTranslation = async (phrase: string, from?: string, to?: string) => {
        setTranslation(
            await (await axios({ url: `http://localhost:4000/translate/${phrase}?from=${from}&to=${to}` })).data
        )
    }

    return (
        <StateContext.Provider
            value={{
                navbarOpen,
                setNavbarOpen,
                loggedIn,
                isSpotifyLoggedIn,
                setIsSpotifyLoggedIn,
                accessToken,
                setAccessToken,
                refreshToken, setRefreshToken,
                expiresIn,
                setExpiresIn,
                preAuthLocation,
                setPreAuthLocation,
                fetchTranslation,
                translation
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);