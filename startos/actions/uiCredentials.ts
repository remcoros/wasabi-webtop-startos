import { store } from '../fileModels/store.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const uiCredentials = sdk.Action.withoutInput(
  // id
  'ui-credentials',

  // metadata
  async ({ effects }) => ({
    name: i18n('Show UI Credentials'),
    description: i18n('Show the username and password for the desktop.'),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: (await store.read().const(effects)) ? 'enabled' : 'hidden',
  }),

  // execution function
  async ({ effects }) => {
    const conf = (await store.read().const(effects))!

    return {
      version: '1',
      title: i18n('Web UI Credentials'),
      message: null,
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: i18n('Username for the desktop'),
            value: conf.username,
            copyable: true,
            masked: false,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: i18n('Password for the desktop'),
            value: conf.password || '',
            copyable: true,
            masked: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
