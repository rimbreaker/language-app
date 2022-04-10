import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, NumberInput, Popover, ScrollArea, Text, Tooltip, SimpleGrid, Group, Title, Modal } from '@mantine/core';
import musicGenres from '../musicGenres.json'
import { useHistory } from 'react-router';
import { Trash } from 'tabler-icons-react';
import { useFirebaseContext } from '../contexts/FireBaseContextProvider';
import { useStateContext } from '../contexts/StateContextProvider';
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../contexts/AuthContextProvider';
import encoding from '../encoding.json'
import { onSnapshot } from 'firebase/firestore';

const calculateCompletion = (playlist: any) => {
    const songIds: string[] = playlist.songs.map((song: any) => song.youtubeId)

    const keys = Object.entries(playlist).filter(([_, v]: any) => !!v).map(([key]) => key)
    const completeSong = songIds.filter(id => keys.includes(id))
    return parseInt(((completeSong.length / (songIds.length ?? 1)) * 100).toFixed(0))
}

const CourseView = () => {

    const { playlists,/* fetchPlaylists,*/ setSinglePlaylist, setPlaylists, deleteCourse, courses } = useFirebaseContext()
    const { createPlaylist, courseLanguage, setCourseLanguage, handleBackground } = useStateContext()
    const { currentUser, playlistQuery } = useAuthContext()

    const currentWordsCounter = courses.find((course: any) => course.language === courseLanguage)?.wordsLearned ?? 0

    useEffect(() => {
        onSnapshot(playlistQuery, (snapshot: any) => {
            setPlaylists(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })))
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseLanguage])



    const history = useHistory()

    useEffect(() => {
        if (!courseLanguage) {
            const languageFromUrl = new URLSearchParams(window.location.search).get("lang")
            if (languageFromUrl)
                setCourseLanguage(languageFromUrl)
            else
                history.push('/')
        }
        //   else {
        //       fetchPlaylists(`${currentUser.email}${courseLanguage}`)
        //   }
        handleBackground(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseLanguage])

    const [daysAmount, setDaysAmount] = useState(10)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const disabled = () => playlists?.map(calculateCompletion).some((comp: number) => comp !== 100)

    const { t } = useTranslation()

    const navigateToPlaylist = (playlist: any) => {
        setSinglePlaylist(playlist);
        history.push(`/playlist?id=${playlist.id}`)
    }

    const handlePlaylistCreate = () => {
        const rgCode = (encoding[courseLanguage as keyof typeof encoding] as any)?.regionCode ?? courseLanguage;

        setPopoverOpen(false)
        createPlaylist(rgCode, currentUser.email, daysAmount)
        setPlaylists((prev: any) => [...prev, { language: courseLanguage, songs: [] }])
    }

    const handleDeleteCourse = () => {
        deleteCourse(courseLanguage, currentUser);
        setModalOpen(false)
        history.push('/')
    }

    return (
        <div >
            <Modal
                transition={'rotate-left'}
                centered
                opened={modalOpen}
                onClose={() => setModalOpen(false)} title={t('course.shouldDeleteCourse')}>
                <Group>
                    <Button
                        onClick={handleDeleteCourse}
                        color={'red'} >{t("course.yes")}</Button>
                    <Button
                        data-autoFocus
                        onClick={() => setModalOpen(false)}>
                        {t("course.no")}
                    </Button>
                </Group>
            </Modal>
            <Group position='apart'>
                <Group>
                    <Title style={{ textTransform: 'capitalize' }} >
                        {t('course.courseName', { languageName: t(`language.${courseLanguage}`) })}
                    </Title>
                    <Popover
                        onClose={() => setPopoverOpen(false)}
                        withArrow
                        opened={popoverOpen}
                        target={
                            <Tooltip
                                disabled={!disabled()}
                                withArrow
                                style={{ maxWidth: '90vw' }}
                                transition="fade"
                                transitionDuration={200}
                                position='bottom'
                                placement='start'
                                wrapLines
                                label={t("course.playlistAddBlocked")}
                            >
                                <Button
                                    disabled={disabled()}
                                    variant='outline'
                                    onClick={() => setPopoverOpen((o) => !o)}
                                >{t('course.playlistAdd')}</Button>
                            </Tooltip>}
                        position="bottom"
                    >
                        <NumberInput
                            value={daysAmount}
                            onChange={(e) => e && setDaysAmount(e)}
                            label={t("course.playlistLengthQuestion")}
                            description={t("course.playlistLengthInfo")}
                            max={30}
                            min={10}
                        />
                        <Autocomplete
                            label={t("course.genre")}
                            description={t('course.genreInfo')}
                            placeholder={t('course.optional')}
                            limit={musicGenres.length}
                            data={musicGenres}
                            styles={{ dropdown: { overflowY: 'scroll', maxHeight: '20vh' } }}
                        />
                        <Button
                            mt={6}
                            onClick={handlePlaylistCreate}>
                            {t("course.create")}
                        </Button>
                    </Popover>
                </Group>
                <Group>
                    <Text>{currentWordsCounter}/1000 {t("course.wordsLearned")}</Text>
                    <Button
                        color={"violet"}
                        onClick={() => setModalOpen(true)}
                        rightIcon={<Trash />}
                    >
                        {t("course.delete")}
                    </Button>
                </Group>
            </Group>
            <Text>{t("course.playlists")}</Text>
            <ScrollArea mt={6} style={{ height: '50vh' }}>
                <SimpleGrid breakpoints={[
                    { minWidth: 200, cols: 1, spacing: 'md' },
                    { minWidth: 450, cols: 2, spacing: 'sm' },
                    { minWidth: 650, cols: 3, spacing: 'sm' },
                    { minWidth: 980, cols: 4, spacing: 'md' },
                ]}>
                    {(playlists ?? []).map((playlist: any) => (
                        <Button
                            loading={!playlist?.index ?? true}
                            key={playlist.id}
                            color={calculateCompletion(playlist) === 100 ? 'green' : 'yellow'}
                            onClick={() => navigateToPlaylist(playlist)}
                            style={{ textTransform: 'capitalize' }}
                        >{t(`language.${playlist.language}`)} {playlist?.index}</Button>
                    ))}
                </SimpleGrid>
            </ScrollArea>
        </div >
    )
}

export default CourseView
