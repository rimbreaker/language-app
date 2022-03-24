import { ActionIcon, Avatar, Burger, Button, Group, Header, MediaQuery, Popover, Text, Title, useMantineTheme } from '@mantine/core'
import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { useStateContext } from '../contexts/StateContextProvider'
import LazyFlag from './LazyLoadFlag'

const HeaderMain = () => {

    const { navbarOpen, setNavbarOpen } = useStateContext()

    const [profilePopoverOpen, setProfilePopoverOpen] = useState(false)

    const theme = useMantineTheme()

    const { loggedIn } = useStateContext()
    const history = useHistory()

    return (
        <Header height={70} p="md">
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'space-between' }}>
                <div>
                    {loggedIn &&
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
                    <Title style={{ cursor: 'pointer' }} onClick={() => history.push('/')}>
                        Language app
                    </Title>
                </div>
                <Group spacing={'xs'} >
                    <ActionIcon>
                        <LazyFlag countryCode='GB' />
                    </ActionIcon>
                    {loggedIn ?
                        <Popover
                            withArrow
                            position='bottom'
                            opened={profilePopoverOpen}
                            onClose={() => setProfilePopoverOpen(false)}
                            target={
                                <Avatar style={{ cursor: 'pointer' }} onClick={() => setProfilePopoverOpen((o) => !o)} radius={'xl'} />
                            }
                        >
                            <Button>logout</Button>
                        </Popover> :
                        <Button>login</Button>
                    }
                </Group>
            </div>

        </Header>)
}

export default HeaderMain