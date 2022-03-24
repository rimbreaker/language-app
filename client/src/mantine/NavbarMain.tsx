import React, { useState } from 'react'
import { Navbar, Text, ScrollArea, Group, Space, Popover, Button, Autocomplete } from '@mantine/core'
import availableLangs from '../encoding.json'
import { useStateContext } from '../contexts/StateContextProvider'
import LazyFlag from './LazyLoadFlag'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'


const NavbarMain = () => {


    const [newCourseLanguage, setNewCourseLanguage] = useState('')
    const [newCourseOpen, setNewCourseOpen] = useState(false)

    const { navbarOpen } = useStateContext()

    const history = useHistory()
    const { t } = useTranslation()
    return (
        <Navbar width={{ sm: 80, lg: 150 }} p="md" hiddenBreakpoint={"sm"} hidden={!navbarOpen} >
            <Navbar.Section
                grow
                component={ScrollArea} mx='-xs' px='xs' >
                {['GB', 'DE', 'FR', 'NL'].map((lang) => (
                    <div key={lang}>
                        <Group
                            style={{ cursor: 'pointer' }}
                            spacing={"xs"}
                            onClick={() => history.push('/courseview')}
                        >
                            <LazyFlag countryCode={lang} />
                            <Text key={lang}>
                                {lang}
                            </Text>
                        </Group>
                        <Space h='xs' />
                    </div>
                ))}
                <Space h="xs" />
                <Popover
                    onClose={() => setNewCourseOpen(false)}
                    withArrow
                    opened={newCourseOpen}
                    target={
                        <Button onClick={() => setNewCourseOpen((o => !o))} >{t('navbar.newCourse')}</Button>
                    }
                    position="bottom"
                >
                    <Autocomplete
                        label={t("navbar.availableLangs")}
                        description={t("navbar.avLangDes")}
                        value={newCourseLanguage}
                        onChange={setNewCourseLanguage}
                        error={newCourseLanguage && !Object.values(availableLangs).map(({ name }: any) => name).includes(newCourseLanguage)}
                        placeholder={t('navbar.language')}
                        limit={Object.keys(availableLangs).length}
                        style={{ maxHeight: '30vh' }}
                        styles={{ dropdown: { overflowY: 'scroll', maxHeight: '30vh' } }}
                        height='30vh'
                        data={Object.values(availableLangs).map(({ name }: any) => (
                            name
                        ))} />
                </Popover>

            </Navbar.Section>
        </Navbar>)
}

export default NavbarMain