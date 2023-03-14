import React from 'react'

import {
    Box,
    CellRenderer,
    FormField,
} from '@airtable/blocks/ui'

import { CellDisplayOpts } from './types'



export function CellDisplay({ label, active, cell }: CellDisplayOpts): JSX.Element {
    const { record, field } = cell || { record: null, field: null }

    return (
        <FormField
            label={label}
            description={`${record?.name} / ${field?.name}${active ? ' 👈' : ''}`}
        >
            <Box
                border='default'
                borderRadius='large'
                height={58 + 11}
                overflow='hidden'
                padding='1'
            >
                {field && record ?
                    <CellRenderer field={field} record={record} />
                    :
                    ''
                }
            </Box>
        </FormField>
    )
}