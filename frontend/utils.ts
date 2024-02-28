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
                    && src.field?.type === MULTIPLE_LOOKUP_VALUES
                    && (src.field.options.result as { type: string }).type === 'multipleRecordLinks'
                    && src.field.options.fieldIdInLinkedTable === dst.field.id
                )
                || (dst.field?.type === MULTIPLE_ATTACHMENTS
                    && src.field?.type === MULTIPLE_LOOKUP_VALUES
                    && (src.field.options.result as { type: string }).type === 'multipleAttachments'
                )
            )
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
    try {
        await doSetCell(table, undoHistory[0].cell, undoHistory[0].value)
    } catch (error) {
        console.error(`Could not undo this one, moving on...\n${error}`)
    }
    setUndoHistory(undoHistory.slice(1))
}


export async function doCheckAndMerge(
    table: Table,
    src: Cell,
    dst: Cell,
    undoHistory: UndoHistory[],
    setUndoHistory: React.Dispatch<React.SetStateAction<UndoHistory[]>>,
): Promise<void> {

    if (!canMerge(table, src, dst)
        || !(
            dst.field.type === MULTIPLE_SELECTS
            || dst.field.type === MULTIPLE_RECORD_LINKS
            || dst.field.type === MULTIPLE_ATTACHMENTS
        )
    ) {
        console.log('Cannot merge')

        return
    }

    setUndoHistory([{ cell: dst, value: dst.record.getCellValue(dst.field) }, ...undoHistory])
    await doMerge(table, src, dst)
}


async function doMerge(table: Table, src: Cell, dst: Cell) {
    const srcType = src.field.type
    const srcValues = (src.record.getCellValue(src.field) || []) as unknown[]
    const dstValues = (dst.record.getCellValue(dst.field) || []) as { id: string} []
    const merged = [...dstValues]

    for (const srcValue of srcValues) {
        let item: { id: string}

        if (
            srcType === MULTIPLE_SELECTS
            || srcType === MULTIPLE_RECORD_LINKS
            || srcType === MULTIPLE_ATTACHMENTS
        ) {
            item = srcValue as { id: string}
        } else if (
            srcType === MULTIPLE_LOOKUP_VALUES
            && (srcValue as { value: { id: string} } )?.value?.id
        ) {
            item = (srcValue as { value: { id: string} } ).value
        } else {
            console.warn('Wrong Source type')

            return
        }

        if (!containsId(dstValues, item)) {
            merged.push(item)
        }
    }

    await doSetCell(table, dst, merged)


    function containsId(collection: { id: string }[], item: { id: string }) {
        return item?.id && collection.filter(({ id }) => id === item.id).length !== 0
    }
}


async function doSetCell(table: Table, cell: Cell, value: unknown) {
    await table.updateRecordAsync(cell.record, { [cell.field.id]: value })
}


export async function doSortCell(
    table: Table,
    cell: Cell,
    sortAscending: boolean,
    undoHistory: UndoHistory[],
    setUndoHistory: React.Dispatch<React.SetStateAction<UndoHistory[]>>,
): Promise<void> {
    if (!isLoaded(cell)) {
        console.warn('Not loaded')

        return
    }

    const type = cell.field.type

    if (!(
        type === MULTIPLE_SELECTS
        || type === MULTIPLE_RECORD_LINKS
        || type === MULTIPLE_ATTACHMENTS
    )) {
        console.warn('Not sortable')

        return
    }

    const values = (cell.record.getCellValue(cell.field) || []) as { id: string, name: string} []

    setUndoHistory([{ cell: cell, value: cell.record.getCellValue(cell.field) }, ...undoHistory])

    values.sort(
        (a, b) => (
            (sortAscending ? -1 : 1)
            * a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        ),
    )

    await doSetCell(table, cell, values)
}


export function isLoaded(cell: Cell): boolean {
    let loaded = true
    try {
        cell.record.getCellValue(cell.field)
    } catch {
        loaded = false
    }

    return loaded
}
