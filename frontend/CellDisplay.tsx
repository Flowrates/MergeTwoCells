import React from 'react'

import {
    Box,
    CellRenderer,
    FormField,
} from '@airtable/blocks/ui'

import { CellDisplayOpts } from './types'
import { isLoaded } from './utils'



export function CellDisplay({ label, cell }: CellDisplayOpts): JSX.Element {
    const { record, field } = cell || { record: null, field: null }

    const loaded = isLoaded(cell)

    return (
        <FormField
            label={label}
            description={loaded
                ? `${record?.name} / ${field?.name}`
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
