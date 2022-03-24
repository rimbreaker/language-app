import React, { useEffect, useState } from 'react';
import { Center, Title, Skeleton } from '@mantine/core';
import { useTranslation } from 'react-i18next'


const FallbackPage = () => {
    useEffect(() => {
        setTimeout(() => setSkeletonVisible(false), 1000)
    }, [])
    const { t } = useTranslation()

    const [skeletonVisible, setSkeletonVisible] = useState(true)
    return (
        <Center style={{ textAlign: 'center', marginTop: '10vh', }}>
            {skeletonVisible ? <Skeleton visible={skeletonVisible} height={'3em'} /> : <Title>{t('fallbackPage')}You need to login to view this page</Title>}
        </ Center>
    )
}

export default FallbackPage
