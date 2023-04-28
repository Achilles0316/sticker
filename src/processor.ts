import { lookupArchive } from "@subsquid/archive-registry"
import { SubstrateProcessor } from "@subsquid/substrate-processor"
import { FullTypeormDatabase as Database } from '@subsquid/typeorm-store'
import { Event } from './processable'

import * as mappings from './mappings/uniques';

const database = new Database();
const processor = new SubstrateProcessor(database);

const STARTING_BLOCK = 778425; // 6000 or 1790000 for Prod

processor.setTypesBundle('statemine')
processor.setBlockRange({ from: STARTING_BLOCK });

// const ARCHIVE = 'https://statemine.archive.subsquid.io/graphql';
const archive = lookupArchive('statemine', {release: 'FireSquid'} )
const chain = 'wss://statemine-rpc.polkadot.io'

processor.setDataSource({
    archive,
    chain,
});

processor.addEventHandler(Event.createClass, mappings.handleCollectionCreate);