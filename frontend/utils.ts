import React from 'react'

import { FieldType, Table } from '@airtable/blocks/models'

import { Cell, UndoHistory } from './types'



const {
    MULTIPLE_ATTACHMENTS,
    MULTIPLE_LOOKUP_VALUES,
    MULTIPLE_RECORD_LINKS,
    MULTIPLE_SELECTS,
} = FieldType


export function cellsEqual(a: Cell, b: Cell): boolean {
    return (
        a?.record?.id === b?.record?.id
        && a?.field?.id === b?.field?.id
    )
}


export function canMerge(table: Table, src: Cell, dst: Cell): boolean {
    try {
        return (
            !!src
            && !!dst
            && (src.field?.type === dst.field?.type
                || (dst.field?.type === MULTIPLE_RECORD_LINKS
                    && src.field?.type === MULTIPLE_LOOKUP_VALUES))
            && !!table.hasPermissionToUpdateRecord(undefined, { [dst.field.id]: undefined })
        )
    } catch (error) {
        console.warn(error)

        return false
    }
}


export async function doUndo(
    table: Table,
    undoHistory: UndoHistory[],
    setUndoHistory: React.Dispatch<React.SetStateAction<UndoHistory[]>>,
): Promise<void> {
    await doSetCell(table, undoHistory[0].cell, undoHistory[0].value)
    setUndoHistory(undoHistory.slice(1))
}


export async function doMergeCells(
    table: Table,
    src: Cell,
    dst: Cell,
    undoHistory: UndoHistory[],
    setUndoHistory: React.Dispatch<React.SetStateAction<UndoHistory[]>>,
): Promise<void> {
    const srcType = src.field.type
    const dstType = dst.field.type

    if (!canMerge(table, src, dst)) {
        console.log('Cannot merge')

        return
    }

    setUndoHistory([{ cell: dst, value: dst.record.getCellValue(dst.field) }, ...undoHistory])

    switch (dstType) {
        case MULTIPLE_SELECTS: {
            if (srcType !== MULTIPLE_SELECTS) {
                console.log('Can only merge Multiple Records into Multiple Records')
                setUndoHistory(undoHistory.slice(-1))

                break
            }
            await doMerge(table, src, dst)

            break
        }

        case MULTIPLE_RECORD_LINKS: {
            if (
                srcType !== MULTIPLE_RECORD_LINKS
                && !(srcType === MULTIPLE_LOOKUP_VALUES
                    && (src.record.getCellValue(src.field) as { value: { id: string} }[])?.[0]?.value?.id)
            ) {
                console.log('Can only merge Linked Records or Record Lookups into Linked Records')
                setUndoHistory(undoHistory.slice(-1))

                break
            }
            await doMerge(table, src, dst)

            break
        }

        case MULTIPLE_ATTACHMENTS: {
            if (srcType !== MULTIPLE_ATTACHMENTS) {
                console.log('Can only merge Attachments into Attachments')
                setUndoHistory(undoHistory.slice(-1))

                break
            }
            await doMerge(table, src, dst)

            break
        }

        default:
            console.log('Destination type not mergeable')
            setUndoHistory(undoHistory.slice(-1))

            return
    }
}


async function doMerge(table: Table, src: Cell, dst: Cell) {
    const srcType = src.field.type
    const srcValue = src.record.getCellValue(src.field) as unknown[]
    const dstValue = dst.record.getCellValue(dst.field) as { id: string} []
    const merged = [...dstValue]

    for (const srcItem of srcValue) {
        let value: { id: string}

        if (
            srcType === MULTIPLE_SELECTS
            || srcType === MULTIPLE_RECORD_LINKS
            || srcType === MULTIPLE_ATTACHMENTS
        ) {
            value = srcItem as { id: string}
        } else if (
            srcType === MULTIPLE_LOOKUP_VALUES
            && (srcItem as { value: { id: string} } )?.value?.id
        ) {
            value = (srcItem as { value: { id: string} } ).value
        } else {
            console.warn('Wrong Source type')

            return
        }

        if (!containsId(dstValue, value)) {
            merged.push(value)
        }
    }

    await doSetCell(table, dst, merged)
}


async function doSetCell(table: Table, cell: Cell, value: unknown) {
    await table.updateRecordAsync(cell.record, { [cell.field.id]: value })
}


function containsId(collection: { id: string }[], item: { id: string }) {
    return item?.id && collection.filter(({ id }) => id === item.id).length !== 0
}