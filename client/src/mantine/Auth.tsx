import axios from 'axios'
import React, { useEffect } from 'react'
import { useHistory } from 'react-router'
import { useStateContext } from '../contexts/StateContextProvider'


const code = new URLSearchParams(window.location.search).get("code")

const Auth = () => {

    const { accessToken, setAccessToken, setRefreshToken, setExpiresIn } = useStateContext()

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

                })
                .then(() => {
                    const locationToPush = localStorage.getItem('preAuthLoc') ?? '/'
                    localStorage.removeItem('preAuthLoc')
                    history.push(locationToPush)
                })
                .catch(() => {
                    window.location = ("/" as any)
                })
        }
    }, [])

    return <></>
}

export default Auth