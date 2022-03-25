import React, { useEffect, useRef, useState } from 'react'
import { ActionIcon, Grid, ScrollArea, MediaQuery, AspectRatio, Checkbox, Space, Title } from '@mantine/core'
import Translator from './Translator'
import SpotifyLogin from './SpotifyLogin'
import SpotifyPlayer from './SpotifyPlayer'
import LyricNotePad from './LyricNotePad'
import { ArrowBack } from 'tabler-icons-react'
import { useAuthContext } from '../contexts/AuthContextProvider'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { useFirebaseContext } from '../contexts/FireBaseContextProvider'

const SongView = () => {

    const { t } = useTranslation()
    const [translatorInput, setTranslatorInput] = useState('')
    const { currentSong, fetchCurrentSong, singlePlaylist,
        markSongAsTranslated,
        unmarkTranslation } = useFirebaseContext()

    const { accessToken } = useAuthContext()

    const history = useHistory()

    useEffect(() => {

        const songIdFromUrl = new URLSearchParams(window.location.search).get("id")
        if (!songIdFromUrl && !currentSong) {
            history.push('/')
        } if (!(currentSong?.lyrics ?? false) || currentSong.youtubeId !== songIdFromUrl) {
            if (songIdFromUrl) {
                fetchCurrentSong(songIdFromUrl)
            }
            else {
                history.push('/')
            }
        }
    }, [currentSong])

    const playlistLink = new URLSearchParams(window.location.search).get("playlist")

    const handleTranslationMark = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.checked ? markSongAsTranslated(currentSong?.youtubeId, (singlePlaylist?.id ?? playlistLink)) :
            unmarkTranslation(currentSong?.youtubeId, (singlePlaylist?.id ?? playlistLink))
    }

    return (
        <>
            {playlistLink && <ActionIcon
                component='a'
                onClick={() => history.push(`/playlist?id=${singlePlaylist?.id ?? playlistLink}`)}
            >

                <ArrowBack />
            </ActionIcon>
            }
            <Grid grow  >
                <Grid.Col span={8}>
                    <Title align='center' >
                        {`${currentSong?.artist ?? ''} - ${currentSong?.title ?? ''}`}
                    </Title>
                    <ScrollArea type='always' offsetScrollbars style={{ height: '70vh' }}>
                        <LyricNotePad backupId={currentSong?.youtubeId ?? ''} rows={2} lyrics={currentSong?.lyrics ?? ''} setTranslatorInput={setTranslatorInput} />
                    </ScrollArea>
                </Grid.Col>
                <Grid.Col span={4}   >
                    <MediaQuery smallerThan={'sm'} styles={{ display: 'none' }}>
                        <>
                            <Translator input={translatorInput} setInput={setTranslatorInput} />
                            <Space h='xs' />
                            {accessToken
                                ?
                                <SpotifyPlayer trackUri={currentSong?.uri ?? ''} />
                                :
                                <SpotifyLogin />
                            }
                            <Space h='xs' />
                            <AspectRatio ratio={16 / 9}>
                                <iframe
                                    src={`https://www.youtube.com/embed/${currentSong?.youtubeId ?? ''}?cc_load_policy=1`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
                                    allowFullScreen
                                />
                            </AspectRatio>
                            <Space h='xs' />
                            <Checkbox onChange={handleTranslationMark} label={t("song.markReady")} styles={{
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