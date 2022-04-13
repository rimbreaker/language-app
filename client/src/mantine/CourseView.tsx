import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, NumberInput, Popover, ScrollArea, Text, Tooltip, SimpleGrid, Group, Title, Modal, LoadingOverlay, RingProgress } from '@mantine/core';
import musicGenres from '../musicGenres.json'
import { useHistory } from 'react-router';
import { useFirebaseContext } from '../contexts/FireBaseContextProvider';
import { useStateContext } from '../contexts/StateContextProvider';
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../contexts/AuthContextProvider';
import { extractParamFromHashUrl } from '../util/extractHashUrlParam';

const calculateCompletion = (playlist: any) => {
    const songIds: string[] = playlist.songs.map((song: any) => song.youtubeId)

    const keys = Object.entries(playlist).filter(([_, v]: any) => !!v).map(([key]) => key)
    const completeSong = songIds.filter(id => keys.includes(id))
    return parseInt(((completeSong.length / (songIds.length ?? 1)) * 100).toFixed(0))
}

const CourseView = () => {

    const { playlists, fetchPlaylists, setSinglePlaylist, setPlaylists, deleteCourse, courses } = useFirebaseContext()
    const { createPlaylist, courseLanguage, setCourseLanguage, handleBackground, playlistStatus } = useStateContext()
    const { currentUser } = useAuthContext()

    const currentWordsCounter = courses?.find((course: any) => course.language === courseLanguage)?.wordsLearned ?? 0

    const history = useHistory()

    useEffect(() => {
        if (!courseLanguage) {
            const languageFromUrl = extractParamFromHashUrl("lang")
            if (languageFromUrl)
                setCourseLanguage(languageFromUrl)
            else
                history.push('/')
        }
        else {
            fetchPlaylists(`${currentUser.email}${courseLanguage}`)
        }
        handleBackground(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseLanguage])

    const [daysAmount, setDaysAmount] = useState(10)
    const [genre, setGenre] = useState<any>()
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const disabled = () => playlists?.map(calculateCompletion).some((comp: number) => comp !== 100)

    const { t } = useTranslation()

    const navigateToPlaylist = (playlist: any) => {
        setSinglePlaylist(playlist);
        history.push(`/playlist?id=${playlist.id}`)
    }

    const handlePlaylistCreate = () => {

        setPopoverOpen(false)
        createPlaylist(courseLanguage, currentUser.email, daysAmount, genre)
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
                            onChange={setGenre}
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
                        rightIcon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-trash" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <line x1="4" y1="7" x2="20" y2="7"></line>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                            </svg>
                        }
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
                    {(playlists ?? []).map((playlist: any, index: number) => {
                        const buttonLoading = !playlist?.index ?? true
                        return (
                            <Button
                                key={index}
                                color={calculateCompletion(playlist) === 100 ? 'green' : 'yellow'}
                                onClick={() => buttonLoading ? undefined : navigateToPlaylist(playlist)}
                                style={{ textTransform: 'capitalize' }}
                            >
                                <LoadingOverlay
                                    overlayOpacity={0.8}
                                    visible={buttonLoading}
                                    loader={
                                        <RingProgress
                                            size={50}
                                            sections={[{
                                                value: (Number.isNaN(playlistStatus) ? 0 : playlistStatus) * 100,
                                                color: 'blue'
                                            }]}
                                        />
                                    } />
                                {t(`language.${playlist.language}`)} {playlist?.index}
                            </Button>
                        )
                    })}
                </SimpleGrid>
            </ScrollArea>
        </div >
    )
}

export default CourseView
