import React, { useEffect, useState } from 'react'
import { ActionIcon, Grid, ScrollArea, MediaQuery, AspectRatio, Space, Title, Button } from '@mantine/core'
import Translator from './Translator'
import SpotifyLogin from './SpotifyLogin'
import SpotifyPlayer from './SpotifyPlayer'
import LyricNotePad from './LyricNotePad'
import { ArrowBack } from 'tabler-icons-react'
import { useAuthContext } from '../contexts/AuthContextProvider'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router'
import { useFirebaseContext } from '../contexts/FireBaseContextProvider'
import { useStateContext } from '../contexts/StateContextProvider'
import { extractParamFromHashUrl } from '../util/extractHashUrlParam'

const SongView = () => {

    const { t } = useTranslation()
    const [translatorInput, setTranslatorInput] = useState('')
    const { currentSong,
        fetchCurrentSong,
        singlePlaylist,
        markSongAsTranslated,
        translation, loadingTranslation,
        fetchTranslation
    } = useFirebaseContext()

    const { accessToken, currentUser } = useAuthContext()
    const { ensureLanguageByPlaylist, setCourseLanguage, courseLanguage, handleBackground } = useStateContext()

    const history = useHistory()

    const [isReadyToBeSaved, setIsReadyToBeSaved] = useState(false)

    useEffect(() => {
        const songIdFromUrl = extractParamFromHashUrl("id")
        if (!songIdFromUrl && !currentSong) {
            history.push('/')
        } if (!(currentSong?.lyrics ?? false) || currentSong.youtubeId !== songIdFromUrl) {
            if (songIdFromUrl) {
                fetchCurrentSong(songIdFromUrl);
                fetchTranslation(songIdFromUrl, currentUser)
            }
            else {
                history.push('/')
            }
        }
        ensureLanguage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSong])

    useEffect(() => handleBackground(translation?.songId === currentSong?.youtubeId),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [translation, currentSong])

    const ensureLanguage = () => {
        ensureLanguageByPlaylist()
        if (!courseLanguage && currentSong)
            setCourseLanguage(currentSong.language)

    }

    const playlistLink = extractParamFromHashUrl("playlist")
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
                        {!loadingTranslation && <LyricNotePad setIsReadyToBeSaved={setIsReadyToBeSaved} backupId={currentSong?.youtubeId ?? ''} rows={2} lyrics={currentSong?.lyrics ?? ''} setTranslatorInput={setTranslatorInput} />}
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
                            {
                                translation?.songId !== currentSong?.youtubeId &&
                                <Button
                                    disabled={!isReadyToBeSaved}
                                    onClick={() => markSongAsTranslated(currentSong?.youtubeId, (singlePlaylist?.id ?? playlistLink))}
                                >{t("song.markReady")}</Button>}
                        </>
                    </MediaQuery>
                </Grid.Col>
            </Grid>
        </>
    )
}

export default SongView