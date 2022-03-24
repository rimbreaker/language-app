import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, NumberInput, Popover, ScrollArea, Text, Tooltip, SimpleGrid, Group, Title, Modal } from '@mantine/core';
import musicGenres from '../musicGenres.json'
import { useHistory } from 'react-router';
import { Trash } from 'tabler-icons-react';
import { useFirebaseContext } from '../contexts/FireBaseContextProvider';
import { useStateContext } from '../contexts/StateContextProvider';
import { useTranslation } from 'react-i18next'

const CourseView = () => {

    const { playlists, fetchPlaylists } = useFirebaseContext()
    const { createPlaylist } = useStateContext()

    const [daysAmount, setDaysAmount] = useState(10)
    const [open, setOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const disabled = false

    const { t } = useTranslation()


    useEffect(() => {
        //TODO: put real values here
        fetchPlaylists('jjaaccekk@gmail.comNL')
    }, [])

    const history = useHistory()
    return (
        <div >
            <Modal
                transition={'rotate-left'}
                centered
                opened={modalOpen}
                onClose={() => setModalOpen(false)} title={t('course.shouldDeleteCourse')}>
                <Group>
                    <Button color={'red'} >{t("course.yes")}</Button>
                    <Button
                        data-autoFocus
                        onClick={() => setModalOpen(false)}>
                        {t("course.no")}
                    </Button>
                </Group>
            </Modal>
            <Group position='apart'>
                <Group>
                    <Title >
                        English course
                    </Title>
                    <Popover
                        onClose={() => setOpen(false)}
                        withArrow
                        opened={open}
                        target={
                            <Tooltip
                                disabled={!disabled}
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
                                    disabled={disabled}
                                    variant='outline'
                                    onClick={() => setOpen((o) => !o)}
                                >{t('course.playlistAdd')}</Button>
                            </Tooltip>}
                        position="bottom"
                    >
                        <NumberInput
                            value={daysAmount}
                            onChange={(e) => setDaysAmount(e ?? 10)}
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
                            //TODO: put real values here
                            onClick={() => { createPlaylist('NL', 'jjaaccekk@gmail.com', 10) }}>{t("course.create")}</Button>
                    </Popover>
                </Group>
                <Group>
                    <Text>0 {t("course.wordsLearned")}</Text>
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
                            color={'yellow'}
                            onClick={() => history.push(`/playlist?playlistId=${playlist.id}`)}
                        >{playlist.id}</Button>
                    ))}
                    <Button loading color={'yellow'} >list2</Button>
                    <Button onClick={() => history.push('/playlist')} color={'green'} >list1</Button>
                </SimpleGrid>
            </ScrollArea>
        </div >
    )
}

export default CourseView
