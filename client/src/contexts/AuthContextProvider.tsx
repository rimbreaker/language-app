import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebaseContext } from './FireBaseContextProvider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import SpotifyWebApi from 'spotify-web-api-node';
import config from '../config.env.json'
import { doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import axios from 'axios';

const AuthContext = createContext<any>('');

export const AuthContextProvider = ({ children }: any) => {
    const { auth, db, usersRef } = useFirebaseContext()

    const [currentUser, setCurrentUser] = useState({})

    const isLoggedIn = Object.keys(currentUser).includes('email')

    const [accessToken, setAccessToken] = useState()
    const [refreshToken, setRefreshToken] = useState()
    const [expiresIn, setExpiresIn] = useState()

    const [googleUser] = useAuthState(auth)
    useEffect(() => {
        if (googleUser && Object.keys(currentUser).length === 0) {
            setCurrentUser({
                displayName: googleUser.displayName,
                email: googleUser.email,
                photoUrl: googleUser.photoURL
            })
        }
    }, [googleUser])


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

    const spotifyLogin = async (accessToken: string) => {
        const spotifyApi = new SpotifyWebApi({
            clientId: config.CLIENT_ID,
        })
        spotifyApi.setAccessToken(accessToken)
        const userInfo = await spotifyApi.getMe()

        const exisitngUser = await getUserByEmail(userInfo.body.email)
        if (exisitngUser) {
            console.log('returning user')
            setCurrentUser({ ...(exisitngUser as any) })
        } else {
            console.log('a new user!!')
            const { display_name, email, images } = userInfo.body
            const haveImages = (images?.length ?? 0) > 0
            const userObject = { displayName: display_name, email }
            setDoc(doc(db, 'usersData', email || "default"), haveImages ? { ...userObject, photoURL: images![0] } : userObject)
            setCurrentUser({ ...currentUser, ...userObject })
        }
    }

    const googleLogin = () => {
        signInWithPopup(auth, new GoogleAuthProvider()).then(async (user) => {
            const exisitngUser = await getUserByEmail(user.user.email || "")
            if (exisitngUser) {
                console.log('returning user')
                setCurrentUser({ ...currentUser, ...(exisitngUser as any) })
            } else {
                console.log('a new user!!')
                const { photoURL, displayName, email } = user.user
                setDoc(doc(db, 'usersData', email || "default"), { photoURL, displayName, email })
                setCurrentUser({ ...currentUser, ...(exisitngUser as any) })
            }
        })
    }

    const getUserByEmail = async (email: string) => {
        if (email === "")
            return false
        const fetchedArray = await (await getDocs(query(usersRef, where('email', "==", email)))).docs.map(doc => doc.data())
        if (fetchedArray.length !== 1)
            return false

        return fetchedArray[0]
    }


    const logout = () => {
        signOut(auth);
        setCurrentUser({});
        setAccessToken(undefined)
        setRefreshToken(undefined)
        setExpiresIn(undefined)
    }

    return (
        <AuthContext.Provider
            value={{
                spotifyLogin,
                isLoggedIn,
                accessToken,
                setAccessToken,
                refreshToken,
                setRefreshToken,
                expiresIn,
                setExpiresIn,
                currentUser,
                googleLogin,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>)
}


export const useAuthContext = () => useContext(AuthContext);