import React, { useReducer, useState } from 'react'
import { Paper, TextInput, Text } from '@mantine/core'

function translationReducer(state: any, action: any) {

    switch (action.type) {
        case 'ADD': {
            const index = action.payload.index
            const subIndex = action.payload.subIndex
            const value = action.payload.value
            return {
                ...state,
                [index]: {
                    ...state[index],
                    [subIndex]: value
                }
            }
        }
        default: {
            return state
        }
    }
}
const LyricNotePad = ({ lyrics, rows, setTranslatorInput, backupId }: { lyrics: string, rows: number, setTranslatorInput: any, backupId: string }) => {

    const [translationState, dispatch] = useReducer(translationReducer, JSON.parse(localStorage.getItem(backupId) ?? '{}'))

    const [isOver, setIsOver] = useState(false)

    const selectionHandler = () => {
        if (isOver) {
            const selection = document.getSelection()
            const range = selection?.getRangeAt(0)
            const selectedText = selection?.anchorNode?.textContent?.slice(range?.startOffset, range?.endOffset) ?? ''
            setTranslatorInput(selectedText)
        }
    }
    const saveBackup = () => localStorage.setItem(backupId, JSON.stringify(translationState))


    return (
        <Paper>
            {lyrics.split('\n').filter(line => line.length > 0).map((lyricLine, index) => {
                return (
                    <div key={index}>
                        <Text
                            onMouseUp={selectionHandler} onMouseEnter={() => setIsOver(true)} onMouseLeave={() => setIsOver(false)}
                            style={{ textAlign: 'center', whiteSpace: "pre" }}
                        >{lyricLine}</Text>
                        <SingleLineHolder saveBackup={saveBackup} initValue={translationState} dispatch={dispatch} rows={rows} index={index} />
                    </div>
                )
            })}
        </Paper>

    )
}

export default LyricNotePad

const SingleLineHolder = ({ rows, dispatch, index, initValue, saveBackup }: { saveBackup: () => void, rows: number, dispatch: any, index: number, initValue: any }) => {

    return (
        <>
            {[...Array(rows).fill(1)].map((_, i) => (
                <TextInput
                    onBlur={saveBackup}
                    key={i}
                    size={'xs'}
                    value={initValue[`lyr${index}`]?.[`row${i}`] ?? ''}
                    variant='default'
                    styles={{ input: { textAlign: 'center', fontStyle: 'italic' } }}
                    onChange={(e) => {
                        dispatch({
                            type: 'ADD', payload: {
                                index: `lyr${index}`,
                                subIndex: `row${i}`,
                                value: e.target.value,
                            }
                        })
                    }} />
            ))}
        </>
    )
}