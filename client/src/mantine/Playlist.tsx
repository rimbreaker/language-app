import React, { useEffect, useState } from 'react';
import { Space, Button, ScrollArea, Text, Group, Avatar, Title, List, Paper, Grid, Modal } from '@mantine/core';
import { BrandYoutube, BrandSpotify, CalendarEvent, Trash } from 'tabler-icons-react'
import { useHistory } from 'react-router';
import SpotifyLogin from './SpotifyLogin';
import { useFirebaseContext } from '../contexts/FireBaseContextProvider';
import { useAuthContext } from '../contexts/AuthContextProvider';
import { useTranslation } from 'react-i18next'

const Playlist = () => {
    const { accessToken } = useAuthContext()
    const { fetchSinglePlaylist } = useFirebaseContext()
    const [modalOpen, setModalOpen] = useState(false)
    const [playlist, setPlaylist] = useState<any>()
    const { t } = useTranslation()

    useEffect(() => {
        fetchSinglePlaylist('jjaaccekk@gmail.comNL8').then(
            (pl: any) => {
                console.log(pl);
                setPlaylist(pl)
            }
        )
    }, [])

    return (
        <  >
            <Modal
                transition={'rotate-left'}
                centered
                opened={modalOpen}
                onClose={() => setModalOpen(false)} title={t("playlist.deleteShould")}>
                <Group>
                    <Button color={'red'} >{t("playlist.yes")}</Button>
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
                            {(playlist?.songs ?? []).map((song: any) => <SongListElement key={song.youtubeId} song={song} />)}
                        </List>
                    </ScrollArea>
                </Grid.Col>
                <Grid.Col span={4}>
                    {accessToken ?
                        <Button
                            leftIcon={<BrandSpotify />}
                            style={{ width: '-webkit-fill-available', height: '8vh' }}
                            color={'green'}>{t("playlist.playOnSpotify")}</Button> :
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
                        href='https://calendar.google.com/calendar/event?action=TEMPLATE&dates=20211001/20211002&text=Time+for+translations&details=Description%0Adescription%0A+%0Adecription+description&location=https://google.com&recur=RRULE:FREQ%3DDAILY;INTERVAL%3D1;COUNT%3D10'
                    >{t("playlist.translationsReminder")}</Button>
                    <Space h="xs" />
                    <Button
                        leftIcon={<CalendarEvent />}
                        component='a'
                        target='_blank'
                        rel='noopener noreferrer'
                        href='https://calendar.google.com/calendar/event?action=TEMPLATE&dates=20211001/20211002&text=Time+for+translations&details=Description%0Adescription%0A+%0Adecription+description&location=https://google.com&recur=RRULE:FREQ%3DDAILY;INTERVAL%3D1;COUNT%3D10'
                    >{t("playlist.listeningReminder")}</Button>
                    {/* <button onClick={() => spotifyApi.createPlaylist('test playlist')}> add spotify playlist</button> */}
                </Grid.Col>
            </Grid>
            <Space h="xs" />
        </ >
    )
}

export default Playlist

const SongListElement = ({ song }: { song?: any }) => {
    const { t } = useTranslation()
    const history = useHistory()

    return (
        <List.Item >
            <Paper p='sm' style={{ cursor: 'pointer' }} onClick={() => history.push(`/song?songId${song.youtubeId ?? ''}`)}>
                <Group noWrap position='apart' >

                    <Group noWrap >
                        <Avatar src={song?.albumUrl ?? "https://i.scdn.co/image/ab67616d000048513bba6a5b7ed4477f2e8f90c7"} radius={'xs'} size={'xl'} />
                        <div>
                            <Text>{song?.title ?? 'Jelous'}</Text>
                            <Text size="xs" color="dimmed">
                                {song?.artist ?? 'Labirinth'}
                            </Text>
                        </div>
                    </Group>
                    <Text style={{ paddingRight: '10px' }}>{t("playlist.complete")}</Text>
                </Group>
            </Paper>
        </List.Item>)
}