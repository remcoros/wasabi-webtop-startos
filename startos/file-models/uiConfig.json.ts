import { matches, FileHelper, T } from '@start9labs/start-sdk'
const { object, string, oneOf, literal } = matches

/*
 * UiConfig.json
 */

// not all possible fields of Wasabi config are included, so
// so do not write a new file, use 'merge' instead
const UiConfigShape = object({
  WindowState: oneOf(
    literal('Normal'),
    literal('Minimized'),
    literal('Maximized'),
    literal('FullScreen'),
  ),
})

export type UiConfigFileType = typeof UiConfigShape._TYPE

export const uiConfigFile = FileHelper.json(
  '/media/startos/volumes/userdir/.walletwasabi/client/UiConfig.json',
  UiConfigShape,
)
