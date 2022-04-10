import React from "react"
import { Button } from "@mantine/core"
import { BrandSpotify } from "tabler-icons-react"
import config from '../config.env.json'
import { useTranslation } from 'react-i18next'

const AUTH_URL =
    `https://accounts.spotify.com/authorize?client_id=${config.CLIENT_ID}&response_type=code&redirect_uri=https://lyrson-client.herokuapp.com/auth&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20playlist-modify-private%20playlist-modify-public%20playlist-read-collaborative%20playlist-read-private`

export default function SpotifyLogin({ isMainLogin }: { isMainLogin?: boolean }) {

    const { t } = useTranslation()

    return (
        <div
            onClick={() => { console.log(window.location); localStorage.setItem('preAuthLoc', window.location.hash.slice(1)) }}
        >
            <Button
                component='a'
                href={AUTH_URL}
                leftIcon={<BrandSpotify />}
                style={{ width: '-webkit-fill-available', height: '8vh', color: 'green', background: 'black' }} color={'black'}>{isMainLogin ? t('spotifyLogin.with') : t('spotifyLogin.to')}</Button>
        </div>
    )
}
