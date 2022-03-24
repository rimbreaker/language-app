import React, { useEffect } from 'react'
import { Textarea, Grid } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useStateContext } from '../contexts/StateContextProvider'

const Translator = ({ input, setInput }: { input: string, setInput: (a: string) => void }) => {

    const [phraseToTranslate] = useDebouncedValue(input, 500)

    const { fetchTranslation, translation } = useStateContext()

    useEffect(() => {
        fetchTranslation(phraseToTranslate, 'en', 'pl')
    }, [phraseToTranslate])

    return <div style={{ width: '-webkit-fill-available' }}>
        <Grid grow >
            <Grid.Col span={6}>

                <Textarea label='english' value={input} onChange={(e) => setInput(e.target.value)} />
            </Grid.Col>
            <Grid.Col span={6}>

                <Textarea defaultValue={translation?.translation ?? ''} variant='default' label='polish' />
            </Grid.Col>
        </Grid>
    </div>
}

export default Translator