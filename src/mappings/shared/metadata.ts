import { create, get } from '@kodadot1/metasquid/entity'
import { Optional, TokenMetadata } from '@kodadot1/metasquid/types'

import { logger } from '@kodadot1/metasquid/logger'
import { MetadataEntity as Metadata } from '../../model/generated'
import { fetchMetadata } from '../utils/metadata'
import { Store } from '../utils/types'
import { isEmpty } from '../utils/helper'

export async function handleMetadata(id: string, store: Store): Promise<Optional<Metadata>> {
  const meta = await get<Metadata>(store, Metadata, id)
  if (meta) {
    return meta
  }

  const start = Date.now()
  const logId = id.split('/').slice(-1).at(0)
  logger.info(`▶️ [META] ${logId}`)
  const metadata = await fetchMetadata<TokenMetadata>(id)
  if (isEmpty(metadata)) {
    return undefined
  }

  const partial: Partial<Metadata> = {
    id,
    description: metadata.description || '',
    image: metadata.image || metadata.thumbnailUri || metadata.mediaUri,
    animationUrl: metadata.animation_url || metadata.mediaUri,
    attributes: [], //metadata.attributes?.map(attributeFrom) || [],
    name: metadata.name || '',
    type: metadata.type || '',
  }

  const final = create<Metadata>(Metadata, id, partial)
  await store.save(final)
  const elapsed = (Date.now() - start) / 1000
  const message = `⏱ [META] ${logId} ${elapsed}s`
  if (elapsed >= 30) {
    logger.warn(message)
  } else {
    logger.info(message)
  }
  return final
}
