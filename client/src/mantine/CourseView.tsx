import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, NumberInput, Popover, ScrollArea, Text, Tooltip, SimpleGrid, Group, Title, Modal } from '@mantine/core';
import musicGenres from '../musicGenres.json'
import { useHistory } from 'react-router';
import { Trash } from 'tabler-icons-react';
import { useFirebaseContext } from '../contexts/FireBaseContext';
import { useStateContext } from '../contexts/StateContextProvider';

const CourseView = () => {

    const { playlists, fetchPlaylists } = useFirebaseContext()
    const { createPlaylist } = useStateContext()

    const [daysAmount, setDaysAmount] = useState(10)
    const [open, setOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const disabled = false


    useEffect(() => {
        console.log(playlists)
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
                onClose={() => setModalOpen(false)} title='Are you sure you want to delete this course?'>
                <Group>
                    <Button color={'red'} >yes</Button>
                    <Button
                        data-autoFocus
                        onClick={() => setModalOpen(false)}>
                        No
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
                                label="can't create a new playlist if there is one incomplete"
                            >
                                <Button
                                    disabled={disabled}
                                    variant='outline'
                                    onClick={() => setOpen((o) => !o)}
                                >add a playlist</Button>
                            </Tooltip>}
                        position="bottom"
                    >
                        <NumberInput
                            value={daysAmount}
                            onChange={(e) => setDaysAmount(e ?? 10)}
                            label="how long do you want your next playlist?"
                            description="Number of songs/days. minimum is 10, maximum is 30"
                            max={30}
                            min={10}
                        />
                        <Autocomplete
                            label="music genre"
                            description='we can try to adjust playlist to your music genre prefenrence'
                            placeholder='optional'
                            limit={musicGenres.length}
                            data={musicGenres}
                            styles={{ dropdown: { overflowY: 'scroll', maxHeight: '20vh' } }}
                        />
                        <Button
                            //TODO: put real values her
                            onClick={() => { createPlaylist('NL', 'jjaaccekk@gmail.com', 10) }}>create</Button>
                    </Popover>
                </Group>
                <Group>
                    <Text>0 words learned</Text>
                    <Button
                        color={"violet"}
                        onClick={() => setModalOpen(true)}
                        rightIcon={<Trash />}
                    >
                        Delete course
                    </Button>
                </Group>
            </Group>
            <Text>your playlists:</Text>
            <ScrollArea style={{ height: '50vh' }}>
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
