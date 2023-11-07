import React from 'react'

import {
    Box,
    CellRenderer,
    FormField,
} from '@airtable/blocks/ui'

import { CellDisplayOpts } from './types'



export function CellDisplay({ label, active, cell }: CellDisplayOpts): JSX.Element {
    const { record, field } = cell || { record: null, field: null }

    let loaded = true
    try {
        record.getCellValue(cell.field)
    } catch {
        loaded = false
    }

    return (
        <FormField
            label={label}
            description={loaded
                ? `${record?.name} / ${field?.name}${active ? ' 👈' : ''}`
                : '❔ No cell'}
        >
            <Box
                border='default'
                borderRadius='large'
                height={58 + 11}
                overflow='hidden'
                padding='1'
            >
                {loaded
                    ? <CellRenderer field={field} record={record} />
                    : ''}
            </Box>
        </FormField>
    )
}