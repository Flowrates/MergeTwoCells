
import { Field, Record } from '@airtable/blocks/models'



export type Cell = {
    record: Record
    field: Field
}


export type UndoHistory = {
    cell: Cell
    value: unknown
}


export type CellDisplayOpts = { label: string, active: boolean, cell: Cell }