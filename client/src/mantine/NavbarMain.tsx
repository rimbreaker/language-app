import React, { useEffect, useState } from 'react'
import { Navbar, Text, ScrollArea, Group, Space, Popover, Button, Autocomplete } from '@mantine/core'
import availableLangs from '../encoding.json'
import { useStateContext } from '../contexts/StateContextProvider'
import LazyFlag from './LazyLoadFlag'
import { useHistory } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useFirebaseContext } from '../contexts/FireBaseContextProvider'
import { useAuthContext } from '../contexts/AuthContextProvider'


const NavbarMain = () => {

    const { setCourseLanguage, navbarOpen } = useStateContext()
    const {
        fetchCourses,
        courses,
        createNewCourse
    } = useFirebaseContext()

    const { currentUser } = useAuthContext()


    const [newCourseLanguageInput, setNewCourseLanguageInput] = useState('')
    const [newCourseOpen, setNewCourseOpen] = useState(false)
    const [languageCourse, setLanguageCourse] = useState<any>()


    const history = useHistory()
    const { t } = useTranslation()

    const handleCourseSelect = (lang: string) => {
        setCourseLanguage(lang);
        history.push(`/courseview?lang=${lang}`)
    }

    useEffect(() => {
        fetchCourses(currentUser)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const languageInputError = () => newCourseLanguageInput && !Object.keys(availableLangs).map((regCode: string) => t("language." + regCode)).includes(newCourseLanguageInput)

    const handleCourseCreate = () => {
        createNewCourse(currentUser, languageCourse)
        setNewCourseOpen(false);
        setNewCourseLanguageInput('')
    }

    return (
        <Navbar width={{ sm: 80, lg: 150 }} p="md" hiddenBreakpoint={"sm"} hidden={!navbarOpen} >
            <Navbar.Section
                grow
                component={ScrollArea} mx='-xs' px='xs' >
                {courses && courses.map(({ language }: any) => (
                    <div key={language}>
                        <Group
                            style={{ cursor: 'pointer' }}
                            spacing={"xs"}
                            onClick={() => handleCourseSelect(language)}
                        >
                            <LazyFlag countryCode={language} />
                            <Text key={language} style={{ textTransform: 'capitalize' }}>
                                {t(`language.${language}`)}
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
                    <>
                        <Autocomplete
                            label={t("navbar.availableLangs")}
                            description={t("navbar.avLangDes")}
                            value={newCourseLanguageInput}
                            onChange={setNewCourseLanguageInput}
                            error={languageInputError()}
                            onItemSubmit={setLanguageCourse}
                            placeholder={t('navbar.language')}
                            limit={Object.keys(availableLangs).length}
                            style={{ maxHeight: '30vh' }}
                            styles={{ dropdown: { overflowY: 'scroll', maxHeight: '30vh' } }}
                            height='30vh'
                            data={Object.keys(availableLangs).map((key: string) => (
                                {
                                    value: t(`language.${key}`),
                                    encode: key,
                                }
                            ))} />

                        <Button onClick={handleCourseCreate} disabled={!newCourseLanguageInput || !!languageInputError()} mt={6}>
                            {t('navbar.startCourse')}
                        </Button>
                    </>
                </Popover>
            </Navbar.Section>
        </Navbar>)
}

export default NavbarMain