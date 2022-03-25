import React, { useEffect, useRef, useState } from "react"
import Player from "../spotifyWebPlayer/Player"
import { useAuthContext } from "../contexts/AuthContextProvider"



export default function SpotifyPlayer({ trackUri }: { trackUri: string }) {

    const { accessToken } = useAuthContext()

    const [maxWidth, setMaxWidth] = useState()

    const wrapperRef = useRef<any>()

    useEffect(() => {
        setMaxWidth(wrapperRef.current.getBoundingClientRect().width)
    }, [])

    return (
        <div ref={wrapperRef} style={{ maxWidth: `${maxWidth}px` }}   >
            <Player accessToken={accessToken} trackUri={trackUri} />
        </div>
    )
}