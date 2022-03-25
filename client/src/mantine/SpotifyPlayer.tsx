import React, { useEffect, useRef, useState } from "react"
import Player from "../spotifyWebPlayer/Player"
import { useAuthContext } from "../contexts/AuthContextProvider"



export default function SpotifyPlayer({ trackUri }: { trackUri: string }) {

    const [hoverTrigger, setHoverTrigger] = useState<any>()

    const { accessToken } = useAuthContext()

    const initWrapperRef = useRef<any>()

    return (
        <>{hoverTrigger ?
            <div id='player-wrapper' style={{ maxWidth: `${hoverTrigger}px` }}   >
                <Player accessToken={accessToken} trackUri={trackUri} />
            </div>
            : <div ref={initWrapperRef} id='player-wrapper' onMouseOver={() => setHoverTrigger(initWrapperRef.current.getBoundingClientRect().width)}   >
                <Player accessToken={accessToken} trackUri={trackUri} />
            </div>}</>
    )
}