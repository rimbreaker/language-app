import React, { useEffect } from 'react';
import { Center, Title } from '@mantine/core';
import { useAuthContext } from '../contexts/AuthContextProvider';
import { useTranslation } from 'react-i18next'
import { useStateContext } from '../contexts/StateContextProvider';
import { useHistory } from 'react-router';
import { landingPageAuthHandle } from '../util/landingPageAuthHandle';


const LandingPage = () => {
    const { currentUser, isLoggedIn } = useAuthContext()
    const { handleBackground } = useStateContext()
    const { t } = useTranslation()
    const history = useHistory()
    useEffect(() => {
        landingPageAuthHandle(history);
        handleBackground(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
