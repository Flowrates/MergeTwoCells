
import React from 'react'
import { useState } from 'react'

import { cursor } from '@airtable/blocks'
import {
    Box,
    Button,
    useBase,
    useLoadable,
    useRecordById,
    useWatchable,
} from '@airtable/blocks/ui'

import { CellDisplay } from './CellDisplay'
import { Cell } from './types'
import {
    canMerge,
    cellsEqual,
    doCheckAndMerge,
    doSortCell,
    doUndo,
} from './utils'



const SRC = 'src'
const DST = 'dst'


export function App() : JSX.Element {
    const base = useBase()
    const [prevCell, setPrevCell] = useState(null as Cell)
    const [current, setCurrent] = useState(SRC)
    const [sortAscending, setSortsortAscending] = useState(true)
    const [src, setSrc] = useState(null as Cell)
    const [dst, setDst] = useState(null as Cell)
    const [undoHistory, setUndoHistory] = useState([] as {cell: Cell, value: unknown}[])

    useWatchable(cursor, [  // Re-render on table / view / cursor change
        'activeTableId',
        'selectedFieldIds',
        'selectedRecordIds',
    ])
    useLoadable(cursor)  // Re-render with currently selected record

    const table = base.getTableByIdIfExists(cursor.activeTableId)
    const field = table?.getFieldById(cursor.selectedFieldIds[0] || table.primaryField.id)
    const record = useRecordById(table, cursor.selectedRecordIds[0] || '')
    const cell = { record, field } as Cell

    if (cell.record && cell.field && !cellsEqual(prevCell, cell)) {
        setCurrent(current === SRC ? DST : SRC)
        if (current === SRC)
            setSrc(cell)
        if (current === DST)
            setDst(cell)
        setPrevCell(cell)
    }

    return (
        <Box padding='3'>
            <CellDisplay label={`🏹 Source${current === SRC ? ' ◀️' : ''}`} cell={src} />
            <CellDisplay label={`🎯 Destination${current === DST ? ' ◀️' : ''}`} cell={dst} />
            <Box
                display={'flex'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
                width={232}
            >
                <Button
                    onClick={() => { doCheckAndMerge(table, src, dst, undoHistory, setUndoHistory) }}
                    variant='primary'
                    size='large'
                    icon='cursor'
                    disabled={!canMerge(table, src, dst)}
                >Merge</Button>
                <Button
                    icon={'sort'}
                    onClick={() => { setSrc(dst); setDst(src) }}
                    aria-label={'Invert'}
                />
                <Button
                    icon={sortAscending ? 'ascending' : 'descending'}
                    onClick={() => {
                        doSortCell(table, dst, sortAscending, undoHistory, setUndoHistory)
                        setSortsortAscending(!sortAscending)
                    }}
                    aria-label={'Sort'}
                />
                <Button
                    aria-label={'Undo'}
                    icon={'undo'}
                    variant={'secondary'}
                    onClick={() => { doUndo(table, undoHistory, setUndoHistory) }}
                    disabled={undoHistory.length === 0}
                />
            </Box>
        </Box>
    )
}
