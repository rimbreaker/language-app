import React, { useEffect } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router'
import { useAuthContext } from '../contexts/AuthContextProvider'
import { extractParamFromHashUrl } from '../util/extractHashUrlParam'
import config from '../util/getConfig'

const code = extractParamFromHashUrl("code")

const Auth = () => {

    const history = useHistory()
    const { spotifyLogin, accessToken, setAccessToken, setRefreshToken, setExpiresIn, setSpotifyLoginTime } = useAuthContext()


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
                    spotifyLogin(res.data.accessToken, res.data.expiresIn, res.data.refreshToken)
                    setSpotifyLoginTime(Date.now())
                })
                .then(() => {
                    // const locationToPush = localStorage.getItem('preAuthLoc')
                    localStorage.removeItem('preAuthLoc')
                    //   history.push(locationToPush ?? '/')
                })
                .catch(() => {
                    // const locationToPush = localStorage.getItem('preAuthLoc')
                    localStorage.removeItem('preAuthLoc')
                    //   history.push(locationToPush ?? "/" as any)
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return <></>
}

export default Auth