import { VersionGraph } from '@start9labs/start-sdk'
import { current, WASABI_VERSION } from './current'
import { v_2_8_2_3 } from './v2.8.2_3'
import { v_2_8_4_0 } from './v2.8.4_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_2_8_4_0, v_2_8_2_3],
})

export { WASABI_VERSION }
