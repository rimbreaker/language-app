import { useEffect } from "react"
import axios from "axios"
import { useStateContext } from "../contexts/StateContextProvider"

export default function useAuth(code: string) {

    const { accessToken, setAccessToken, refreshToken, setRefreshToken, expiresIn, setExpiresIn } = useStateContext()

    useEffect(() => {
        if (!accessToken) {
            axios
                .post("http://localhost:4000/login", {
                    code,
                })
                .then(res => {
                    setAccessToken(res.data.accessToken)
                    setRefreshToken(res.data.refreshToken)
                    setExpiresIn(res.data.expiresIn)
                    window.history.pushState({}, "", "/")
                })
                .catch((e) => {
                    console.log(e)
                    alert('oops')
                    window.location = ("/" as any)
                })
        }
    }, [code])

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
                .catch((e) => {
                    console.log(e)
                    alert('oops')
                    window.location = ("/" as any)
                })
        }, (expiresIn - 60) * 1000)

        return () => clearInterval(interval)
    }, [refreshToken, expiresIn])

    return accessToken
}