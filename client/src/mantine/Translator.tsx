import React, { useEffect } from 'react'
import { Textarea, Grid } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useStateContext } from '../contexts/StateContextProvider'
import { useTranslation } from 'react-i18next'

const Translator = ({ input, setInput }: { input: string, setInput: (a: string) => void }) => {

    const [phraseToTranslate] = useDebouncedValue(input, 500)

    const { courseLanguage } = useStateContext()

    const { fetchTranslation, translation } = useStateContext()

    const { t, i18n } = useTranslation()

    const currentLanuage = i18n.language
    useEffect(() => {
        fetchTranslation(phraseToTranslate, 'en', currentLanuage)
    }, [phraseToTranslate])


    return <div style={{ width: '-webkit-fill-available' }}>
        <Grid grow >
            <Grid.Col span={6}>

                <Textarea label={t(`language.${courseLanguage}`)} value={input} onChange={(e) => setInput(e.target.value)} />
            </Grid.Col>
            <Grid.Col span={6}>

                <Textarea defaultValue={translation?.translation ?? ''} variant='default' label={t(`language.${currentLanuage.toUpperCase()}`)} />
            </Grid.Col>
        </Grid>
    </div>
}

export default Translator