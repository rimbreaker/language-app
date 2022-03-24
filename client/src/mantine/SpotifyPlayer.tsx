import React from "react"
import playingTrack from './mockSong.json'
import Player from "../spotifyWebPlayer/Player"


export default function Dashboard({ accessToken }: { accessToken: string }) {

    return (
        <div>
            <Player accessToken={accessToken} trackUri={playingTrack?.uri} />

        </div>
    )
}