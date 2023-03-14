
import React from 'react'

import { initializeBlock } from '@airtable/blocks/ui'


import { App } from './App'



// import { TableStructureApp } from './AppTableStructure';
// import { UpdateRecordsApp } from './AppUpdateRecords';


initializeBlock(() => <App />)
