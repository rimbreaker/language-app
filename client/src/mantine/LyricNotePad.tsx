import React, { useEffect, useReducer, useState } from 'react'
import { Paper, TextInput, Text } from '@mantine/core'
import { useFirebaseContext } from '../contexts/FireBaseContextProvider'

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
        case 'FULL_IMPORT': {
            return { ...state, ...action.payload }
        }
        default: {
            return state
        }
    }
}
const LyricNotePad = ({ lyrics, rows, setTranslatorInput, backupId, setIsReadyToBeSaved }: { lyrics: string, rows: number, setTranslatorInput: any, backupId: string, setIsReadyToBeSaved: any }) => {
    const { translation } = useFirebaseContext()

    const [translationState, dispatch] = useReducer(translationReducer, JSON.parse(localStorage.getItem(backupId) ?? '{}'))

    const [isOver, setIsOver] = useState(false)

    useEffect(() => {
        console.log(translation?.songId, backupId)
        if (translation && translation?.songId === backupId && JSON.stringify(translationState) !== JSON.stringify(translation.lyrics)) {
            console.log('filling out')
            dispatch({ type: 'FULL_IMPORT', payload: translation.lyrics })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translation, backupId])

    const selectionHandler = () => {
        if (isOver) {
            const selection = document.getSelection()
            const range = selection?.getRangeAt(0)
            const selectedText = selection?.anchorNode?.textContent?.slice(range?.startOffset, range?.endOffset) ?? ''
            setTranslatorInput(selectedText)
        }
    }
    const saveBackup = () => {
        if (JSON.stringify(translationState) !== JSON.stringify(translation.lyrics)) localStorage.setItem(backupId, JSON.stringify(translationState))
    }
    const checkIfReadyToBeSaved = () => {
        console.log(Object.keys(translationState).length, lyrics.split('\n').filter(line => line.length > 0).length)
        if (Object.keys(translationState).length === lyrics.split('\n').filter(line => line.length > 0).length) {
            setIsReadyToBeSaved(true)
        }
    }
    const dispatchWithCheck = (value: any) => {
        checkIfReadyToBeSaved();
        dispatch(value)
    }
    return (
        <Paper>
            {lyrics.split('\n').filter(line => line.length > 0).map((lyricLine, index) => {
                return (
                    <div key={index}>
                        <Text
                            onMouseUp={selectionHandler} onMouseEnter={() => setIsOver(true)} onMouseLeave={() => setIsOver(false)}
                            style={{ textAlign: 'center', whiteSpace: "pre" }}
                        >{lyricLine}</Text>
                        <SingleLineHolder saveBackup={saveBackup} initValue={translationState} dispatch={dispatchWithCheck} rows={rows} index={index} />
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