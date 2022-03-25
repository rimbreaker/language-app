import axios from 'axios'
import React, { useEffect } from 'react'
//import { useHistory } from 'react-router'
import { useHistory } from 'react-router'
import { useAuthContext } from '../contexts/AuthContextProvider'


const code = new URLSearchParams(window.location.search).get("code")

const Auth = () => {

    const history = useHistory()
    const { spotifyLogin, accessToken, setAccessToken, setRefreshToken, setExpiresIn } = useAuthContext()


    useEffect(() => {
        if (!accessToken) {
            axios
                .post("http://localhost:4000/login", {
                    code, redirect: "http://localhost:3000/auth"
                })
                .then(res => {
                    setAccessToken(res.data.accessToken)
                    setRefreshToken(res.data.refreshToken)
                    setExpiresIn(res.data.expiresIn)
                    spotifyLogin(res.data.accessToken)
                })
                .then(() => {
                    const locationToPush = localStorage.getItem('preAuthLoc')
                    // window.history.replaceState({}, "", locationToPush)
                    history.push(locationToPush ?? '/')
                    //          window.history.go(0)
                    localStorage.removeItem('preAuthLoc')
                })
                .catch(() => {
                    window.location = ("/" as any)
                })
        }
    }, [])

    return <></>
}

export default Auth