import React from 'react';
import { Center, Title } from '@mantine/core';
import { useAuthContext } from '../contexts/AuthContextProvider';
import { useTranslation } from 'react-i18next'


const LandingPage = () => {
    const { currentUser, isLoggedIn } = useAuthContext()
    const { t } = useTranslation()

    return (
        <Center style={{ textAlign: 'center', marginTop: '10vh' }}>{
            isLoggedIn ?
                <Title>{t('landingPage.welcomeLog', { userName: currentUser.displayName.split(' ')[0] })}</Title> :
                <Title >{t('landingPage.welcomeDef')}</Title>
        }
        </ Center>
    )
}

export default LandingPage
