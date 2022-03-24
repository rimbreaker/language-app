import React, { useEffect, useState } from 'react'
import { ActionIcon, Grid, ScrollArea, MediaQuery, AspectRatio, Checkbox, Space, Title } from '@mantine/core'
import Translator from './Translator'
import SpotifyLogin from './SpotifyLogin'
import SpotifyPlayer from './SpotifyPlayer'
import playingTrack from './mockSong.json'
import axios from 'axios'
import LyricNotePad from './LyricNotePad'
import { ArrowBack } from 'tabler-icons-react'
import { useAuthContext } from '../contexts/AuthContextProvider'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'

const SongView = () => {

    const { t } = useTranslation()
    const [translatorInput, setTranslatorInput] = useState('')

    const [ytId, setYtId] = useState('')
    const [lyrics, setLyrics] = useState('')

    const { accessToken } = useAuthContext()

    const history = useHistory()

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
    }, [])

    return (
        <>
            <ActionIcon
                component='a'
                onClick={() => history.push('/playlist')}
            >
                <ArrowBack />
            </ActionIcon>
            <Grid grow  >
                <Grid.Col span={8}>
                    <Title align='center' >
                        {`${playingTrack.artist} - ${playingTrack.title}`}
                    </Title>
                    <ScrollArea type='always' offsetScrollbars style={{ height: '70vh' }}>
                        <LyricNotePad backupId={`${playingTrack.artist}-${playingTrack.title}`} rows={2} lyrics={lyrics} setTranslatorInput={setTranslatorInput} />
                    </ScrollArea>
                </Grid.Col>
                <Grid.Col span={4} >
                    <MediaQuery smallerThan={'sm'} styles={{ display: 'none' }}>
                        <>
                            <Translator input={translatorInput} setInput={setTranslatorInput} />
                            <Space h='xs' />
                            {accessToken
                                ?
                                <SpotifyPlayer />
                                :
                                <SpotifyLogin />
                            }
                            <Space h='xs' />
                            <AspectRatio ratio={16 / 9}>
                                <iframe
                                    src={`https://www.youtube.com/embed/0PQWwzgkVBg?cc_load_policy=1`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
                                    allowFullScreen
                                />
                            </AspectRatio>
                            <Space h='xs' />
                            <Checkbox label={t("song.markReady")} styles={{
                                input: { backgroundColor: 'aliceBlue' },
                            }} />
                        </>
                    </MediaQuery>
                </Grid.Col>
            </Grid>
        </>
    )
}

export default SongView