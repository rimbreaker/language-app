import React, { useEffect } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router'
import { useAuthContext } from '../contexts/AuthContextProvider'
import { extractParamFromHashUrl } from '../util/extractHashUrlParam'
import config from '../util/getConfig'

const code = extractParamFromHashUrl("code")

const Auth = () => {

    const history = useHistory()
    const { spotifyLogin, accessToken, setAccessToken, setRefreshToken, setExpiresIn } = useAuthContext()


    useEffect(() => {
        if (!accessToken) {
            axios
                .post(`${config.SERVER_URI}/login`, {
                    code, redirect: config.REDIRECT_URI
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <></>
}

export default Auth