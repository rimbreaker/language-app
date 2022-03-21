import { useState, useEffect } from "react"
import useAuth from "./useAuth"
import Player from "./Player"
import TrackSearchResult from "./TrackSearchResult"
import { Container, Form } from "react-bootstrap"
import SpotifyWebApi from "spotify-web-api-node"
import axios from "axios"
import ReactPlayer from "react-player"
import config from '../config.env.json'

const spotifyApi = new SpotifyWebApi({
    clientId: config.CLIENT_ID,
})

export default function Dashboard({ code }: { code: string }) {
    const accessToken = useAuth(code)
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [playingTrack, setPlayingTrack] = useState<any>()
    const [lyrics, setLyrics] = useState("")
    const [ytId, setYtId] = useState("")

    function chooseTrack(track: any) {
        setPlayingTrack(track)
        setSearch("")
        setLyrics("")
        setYtId("")
    }

    useEffect(() => {
        if (!playingTrack) return

        axios
            .get("http://localhost:4000/youtube", {
                params: {
                    track: encodeURI(playingTrack.title),
                    artist: encodeURI(playingTrack.artist),
                },
            })
            .then(res => {
                setYtId(res.data.firstResultID)
            })

        axios
            .get("http://localhost:4000/lyrics", {
                params: {
                    track: encodeURI(playingTrack.title),
                    artist: encodeURI(playingTrack.artist),
                },
            })
            .then(res => {
                setLyrics(res.data.lyrics)
            })
    }, [playingTrack])

    useEffect(() => {
        if (!accessToken) return
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken])

    useEffect(() => {
        if (!search) return setSearchResults([]);
        if (!accessToken) return;

        let cancel = false
        spotifyApi.searchTracks(search).then(res => {
            if (cancel) return
            setSearchResults(
                (res.body as any).tracks.items.map((track: any) => {
                    const smallestAlbumImage = track.album.images.reduce(
                        (smallest: any, image: any) => {
                            if (image?.height < smallest?.height) return image
                            return smallest
                        },
                        track.album.images[0]
                    )

                    return {
                        artist: track.artists[0].name,
                        title: track.name,
                        uri: track.uri,
                        albumUrl: smallestAlbumImage.url,
                    }
                })
            )
        })

        return () => { cancel = true }
    }, [search, accessToken])

    return (
        <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
            <Form.Control
                type="search"
                placeholder="Search Songs/Artists"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
                {searchResults.map(track => (
                    <TrackSearchResult
                        track={track}
                        key={track.uri}
                        chooseTrack={chooseTrack}
                    />
                ))}
                {searchResults.length === 0 && (
                    <div className="text-center" style={{ whiteSpace: "pre" }}>
                        {lyrics}
                    </div>
                )}
            </div>
            <div>
                <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
            </div>
            {ytId && <ReactPlayer controls url={`https://www.youtube.com/watch?v=${ytId}`} />}
            {ytId && <button onClick={() => window.open(`https://www.youtube.com/watch_videos?video_ids=${ytId},7J_qcttfnJA&title=english1`, '_blank')}> open yt playlist</button>}
            <button onClick={() => spotifyApi.createPlaylist('test playlist')}> add spotify playlist</button>
            <button onClick={() => window.open('https://calendar.google.com/calendar/event?action=TEMPLATE&dates=20211001/20211002&text=Time+for+translations&details=Description%0Adescription%0A+%0Adecription+description&location=https://google.com&recur=RRULE:FREQ%3DDAILY;INTERVAL%3D1;COUNT%3D10', '_blank')}>add event to google calendar</button>
        </Container>
    )
}