import React, { useEffect, useState } from 'react';
import { Space, Button, ScrollArea, Text, Group, Avatar, Title, List, Paper, Grid, Modal } from '@mantine/core';
import { BrandYoutube, BrandSpotify, CalendarEvent, Trash } from 'tabler-icons-react'
import { useHistory } from 'react-router';
import SpotifyLogin from './SpotifyLogin';
import { useFirebaseContext } from '../contexts/FireBaseContextProvider';
import { useAuthContext } from '../contexts/AuthContextProvider';
import { useTranslation } from 'react-i18next'

const Playlist = () => {
    const { accessToken, createSpotifyPlaylist, deletePlaylist } = useAuthContext()
    const { fetchSinglePlaylist, singlePlaylist } = useFirebaseContext()
    const [modalOpen, setModalOpen] = useState(false)
    const [playlist, setPlaylist] = useState<any>()
    const { t } = useTranslation()
    const history = useHistory()

    useEffect(() => {
        const playlistIdFromUrl = new URLSearchParams(window.location.search).get("id");
        if (!playlistIdFromUrl && !singlePlaylist)
            history.push("/")
        if (!singlePlaylist || singlePlaylist.id !== playlistIdFromUrl) {
            fetchSinglePlaylist(playlistIdFromUrl).then(
                (pl: any) => {
                    setPlaylist(pl);
                }
            )
        }
    }, [singlePlaylist])

    const getDateForCalendar = () => {
        const dateObject = new Date()
        const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
        const hours = dateObject.getHours()
        const startDate = dateObject.getFullYear() + months[dateObject.getMonth()] + dateObject.getUTCDate() + 'T'
        return startDate + (hours < 10 ? '0' + hours : hours) + '00Z/' + startDate + (hours + 1 < 10 ? '0' + (hours + 1) : (hours + 1)) + '00Z'
    }

    return (
        <  >
            <Modal
                transition={'rotate-left'}
                centered
                opened={modalOpen}
                onClose={() => setModalOpen(false)} title={t("playlist.deleteShould")}>
                <Group>
                    <Button onClick={() => deletePlaylist(playlist)} color={'red'} >{t("playlist.yes")}</Button>
                    <Button
                        data-autoFocus
                        onClick={() => setModalOpen(false)}>
                        {t("playlist.no")}
                    </Button>
                </Group>
            </Modal>
            <Group position='apart'>
                <Title >
                    {playlist?.id ?? 'Playlist 1'}
                </Title>
                <Group>
                    <Text>{playlist?.completionPercentage ?? '0'}% {t("playlist.completion")}</Text>
                    <Button color={"violet"} onClick={() => setModalOpen(true)} rightIcon={<Trash />}>
                        {t("playlist.deletePlaylist")}
                    </Button>
                </Group>
            </Group>
            <Space h="xs" />
            <Grid grow>
                <Grid.Col span={8}>
                    <ScrollArea type='always' style={{ height: '75vh' }} offsetScrollbars>
                        <List spacing={'xs'} icon={<></>}
                            styles={{
                                itemIcon: { display: 'none' },
                                itemWrapper: { display: 'block !important' },
                            }}>
                            {(playlist?.songs ?? []).map((song: any, i: number) => <SongListElement key={song.youtubeId + i} song={song} playlist={playlist} />)}
                        </List>
                    </ScrollArea>
                </Grid.Col>
                <Grid.Col span={4}>
                    {accessToken ?
                        (playlist?.spotifyLink ?
                            <Button
                                leftIcon={<BrandSpotify />} component='a'
                                rel="noopener noreferrer"
                                href={playlist?.spotifyLink}
                                style={{ width: '-webkit-fill-available', height: '8vh' }}
                                color={'green'}>{t("playlist.playOnSpotify")}
                            </Button>
                            : <Button
                                leftIcon={<BrandSpotify />}
                                onClick={() => createSpotifyPlaylist(playlist)}
                                style={{ width: '-webkit-fill-available', height: '8vh' }}
                                color={'green'}>{t("playlist.addToSpotify")}
                            </Button>
                        ) :
                        <SpotifyLogin />
                    }
                    <Space h="xs" />
                    <Button
                        leftIcon={<BrandYoutube />}
                        component='a'
                        target="_blank"
                        rel="noopener noreferrer"
                        href={playlist?.youtubeLink ?? "https://www.youtube.com/watch_videos?video_ids=50VWOBi0VFs,7J_qcttfnJA&title=english1"}
                        style={{ width: '-webkit-fill-available', height: '8vh' }}
                        color={'red'}>{t("playlist.playOnYoutue")}</Button>
                    <Space h="xs" />
                    <Button
                        leftIcon={<CalendarEvent />}
                        component='a'
                        target='_blank'
                        rel='noopener noreferrer'
                        href={`https://calendar.google.com/calendar/event?action=TEMPLATE&dates=${getDateForCalendar()}&text=${t("playlist.reminderTranslateTitle", { language: 'Dutch' })}&details=${t("playlist.translationRemDesc")}&location=${window.location.href}&recur=RRULE:FREQ%3DDAILY;INTERVAL%3D1;COUNT%3D${playlist?.songs?.length ?? 10}`}//TODO: 
                    >{t("playlist.translationsReminder")}</Button>
                    <Space h="xs" />
                    <Button
                        leftIcon={<CalendarEvent />}
                        component='a'
                        target='_blank'
                        rel='noopener noreferrer'
                        href={`https://calendar.google.com/calendar/event?action=TEMPLATE&dates=${getDateForCalendar()}&text=${t("playlist.reminderListenTitle", { language: 'Dutch' })}&details=${t("playlist.translationRemDesc")}&location=${window.location.href}&recur=RRULE:FREQ%3DDAILY;INTERVAL%3D1;COUNT%3D${playlist?.songs?.length ?? 10}`}
                    >{t("playlist.listeningReminder")}</Button>
                    {/* <button onClick={() => spotifyApi.createPlaylist('test playlist')}> add spotify playlist</button> */}
                </Grid.Col>
            </Grid>
            <Space h="xs" />
        </ >
    )
}

export default Playlist

const SongListElement = ({ song, playlist }: any) => {
    const { t } = useTranslation()
    const history = useHistory()

    const { setCurrentSong } = useFirebaseContext()

    const songRedirect = (song: any) => {
        setCurrentSong(song);
        history.push(`/song?id=${song.youtubeId ?? ''}&playlist=${playlist.id}`)
    }

    return (
        <List.Item >
            <Paper p='sm' style={{ cursor: 'pointer' }} onClick={() => songRedirect(song)}>
                <Group noWrap position='apart' >

                    <Group noWrap >
                        <Avatar src={song?.albumUrl} radius={'xs'} size={'xl'} />
                        <div>
                            <Text>{song?.title ?? ''}</Text>
                            <Text size="xs" color="dimmed">
                                {song?.artist ?? ''}
                            </Text>
                        </div>
                    </Group>
                    <Text style={{ paddingRight: '10px' }}>{t("playlist.complete")}</Text>
                </Group>
            </Paper>
        </List.Item>)
}