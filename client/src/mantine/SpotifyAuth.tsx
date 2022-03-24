import axios from 'axios'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
import { useAuthContext } from '../contexts/AuthContextProvider'


const code = new URLSearchParams(window.location.search).get("code")

const Auth = () => {

    const { spotifyLogin, accessToken, setAccessToken, setRefreshToken, setExpiresIn } = useAuthContext()
    const history = useHistory()

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
                    const locationToPush = localStorage.getItem('preAuthLoc') ?? '/'
                    localStorage.removeItem('preAuthLoc')
                    history.push(locationToPush)
                })
                .catch((e) => {
                    window.location = ("/" as any)
                })
        }
    }, [])

    return <></>
}

export default Auth