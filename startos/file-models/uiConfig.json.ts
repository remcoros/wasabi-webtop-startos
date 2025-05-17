import { matches, FileHelper, T } from '@start9labs/start-sdk'
const { object, string } = matches

/*
 * UiConfig.json
 */

// not all possible fields of Wasabi config are included, so
// so do not write a new file, use 'merge' instead
const UiConfigShape = object({
  WindowState: string,
})

export type UiConfigFileType = typeof UiConfigShape._TYPE

export const uiConfigFile = FileHelper.json(
  '/media/startos/volumes/userdir/.walletwasabi/client/UiConfig.json',
  UiConfigShape,
)
