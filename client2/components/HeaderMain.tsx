import React, { useState } from 'react'
import { ActionIcon, Avatar, Burger, Button, Group, Header, MediaQuery, Modal, Popover, Title, useMantineTheme } from '@mantine/core'
import { useStateContext } from '../contexts/StateContextProvider'
import LazyFlag from './LazyLoadFlag'
import SpotifyLogin from './SpotifyLogin'
import { BrandGoogle } from 'tabler-icons-react'
import { useAuthContext } from '../contexts/AuthContextProvider'
import { useTranslation } from 'react-i18next'

const HeaderMain = () => {

    const { navbarOpen, setNavbarOpen } = useStateContext()
    const { googleLogin, isLoggedIn, logout, currentUser } = useAuthContext()

    const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)

    const theme = useMantineTheme()

    const [modalOpen, setModalOpen] = useState(false)

    const { t, i18n } = useTranslation()

    return (
        <>
            <Modal
                transition={'pop'}
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('header.login')}>
                <Group position='center'>
                    <SpotifyLogin isMainLogin />
                    <Button
                        leftIcon={<BrandGoogle />}
                        style={{ height: '8vh', background: 'black' }}
                        color={'black'}
                        onClick={() => { setModalOpen(false); googleLogin() }}>
                        {t('header.googleLogin')}
                    </Button>
                </Group>
            </Modal>
            <Header height={70} p="md">
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>
                    <div>
                        {isLoggedIn &&
                            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                                <Burger
                                    opened={navbarOpen}
                                    onClick={() => setNavbarOpen((o: boolean) => !o)}
                                    size="sm"
                                    color={theme.colors.gray[6]}
                                    mr="xl"
                                />
                            </MediaQuery>
                        }
                        <Title style={{ cursor: 'pointer' }} onClick={() => {
                            //history.push('/')TODO:
                        }}>
                            {t('header.title')}
                        </Title>
                    </div>
                    <Group spacing={'xs'} >
                        <ActionIcon onClick={() => i18n.changeLanguage(i18n.language === 'pl' ? 'en' : 'pl')}>
                            <LazyFlag countryCode={i18n.language === 'en' ? 'GB' : 'PL'} />
                        </ActionIcon>
                        {isLoggedIn ?
                            <Popover
                                withArrow
                                position='bottom'
                                opened={profilePopoverOpen}
                                onClose={() => setProfilePopoverOpen(false)}
                                target={
                                    <Avatar src={currentUser.photoURL} style={{ cursor: 'pointer' }} onClick={() => setProfilePopoverOpen((o) => !o)} radius={'xl'} />
                                }
                            >
                                <Button onClick={logout}>{t('header.logout')}</Button>
                            </Popover> :
                            <Button onClick={() => setModalOpen(true)}>{t('header.login')}</Button>
                        }
                    </Group>
                </div>

            </Header>
        </>)
}

export default HeaderMain