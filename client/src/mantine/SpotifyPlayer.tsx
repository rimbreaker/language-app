import React from "react"
import playingTrack from './mockSong.json'
import Player from "../spotifyWebPlayer/Player"
import { useAuthContext } from "../contexts/AuthContextProvider"



export default function SpotifyPlayer() {

    const { accessToken } = useAuthContext()
    return (
        <div>
            <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
        </div>
    )
}