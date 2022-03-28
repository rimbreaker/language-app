import React, { useEffect, useState } from 'react'
import { Textarea, Grid } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useStateContext } from '../contexts/StateContextProvider'
import { useTranslation } from 'react-i18next'

const Translator = ({ input, setInput }: { input: string, setInput: (a: string) => void }) => {

    const [phraseToTranslate] = useDebouncedValue(input, 500)

    const { fetchTranslation, courseLanguage } = useStateContext()

    const { t, i18n } = useTranslation()

    const currentLanuage = i18n.language

    const [translation, setTranslation] = useState()

    useEffect(() => {
        if (phraseToTranslate.length > 0)
            fetchTranslation(phraseToTranslate, courseLanguage, currentLanuage).then((res: any) => setTranslation(res))
    }, [phraseToTranslate])



    return <div style={{ width: '-webkit-fill-available' }}>
        <Grid grow >
            <Grid.Col span={6}>
                <Textarea label={t(`language.${courseLanguage}`)} value={input} onChange={(e) => setInput(e.target.value)} />
            </Grid.Col>
            <Grid.Col span={6}>
                <Textarea onChange={() => null} value={(translation as any)?.translation ?? ''} variant='default' label={t(`language.${currentLanuage.toUpperCase()}`)} />
            </Grid.Col>
        </Grid>
    </div>
}

export default Translator