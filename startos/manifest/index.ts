import { setupManifest } from '@start9labs/start-sdk'
import { WASABI_VERSION } from '../versions'

export const manifest = setupManifest({
  id: 'wasabi-webtop',
  title: 'Wasabi Wallet',
  license: 'MIT',
  packageRepo: 'https://github.com/remcoros/wasabi-webtop-startos',
  upstreamRepo: 'https://github.com/WalletWasabi/WalletWasabi',
  marketingUrl: 'https://wasabiwallet.io/',
  donationUrl: 'https://docs.wasabiwallet.io/FAQ/FAQ-Contribution.html',
  description: {
    short: {
      en_US: 'Wasabi Wallet - The Privacy focused Bitcoin wallet',
      es_ES: 'Wasabi Wallet - La billetera Bitcoin enfocada en privacidad',
      de_DE: 'Wasabi Wallet - Die datenschutzorientierte Bitcoin-Wallet',
      pl_PL: 'Wasabi Wallet - Portfel Bitcoin skupiony na prywatności',
      fr_FR:
        'Wasabi Wallet - Le portefeuille Bitcoin axé sur la confidentialité',
    },
    long: {
      en_US:
        "Wasabi on Webtop is a stripped down version of 'Webtop' (a Linux Desktop Environment) running the Wasabi wallet. This allows users to access a simple Linux desktop with Wasabi pre-installed directly from their web browser.",
      es_ES:
        "Wasabi en Webtop es una versión simplificada de 'Webtop' (un entorno de escritorio Linux) que ejecuta la billetera Wasabi. Esto permite a los usuarios acceder a un escritorio Linux simple con Wasabi preinstalado directamente desde su navegador web.",
      de_DE:
        "Wasabi auf Webtop ist eine abgespeckte Version von 'Webtop' (einer Linux-Desktop-Umgebung), die die Wasabi-Wallet ausführt. Dies ermöglicht es Benutzern, direkt über ihren Webbrowser auf einen einfachen Linux-Desktop mit vorinstalliertem Wasabi zuzugreifen.",
      pl_PL:
        "Wasabi na Webtop to okrojona wersja 'Webtop' (środowiska pulpitu Linux) uruchamiająca portfel Wasabi. Umożliwia to użytkownikom dostęp do prostego pulpitu Linux ze wstępnie zainstalowanym Wasabi bezpośrednio z ich przeglądarki internetowej.",
      fr_FR:
        "Wasabi sur Webtop est une version allégée de 'Webtop' (un environnement de bureau Linux) exécutant le portefeuille Wasabi. Cela permet aux utilisateurs d'accéder à un bureau Linux simple avec Wasabi préinstallé directement depuis leur navigateur web.",
    },
  },
  volumes: ['main', 'userdir'],
  images: {
    main: {
      source: {
        dockerBuild: {
          dockerfile: 'Dockerfile',
          buildArgs: {
            WASABIWEBTOP_VERSION: WASABI_VERSION,
          },
        },
      },
      arch: ['x86_64'],
      nvidiaContainer: true,
    },
  },
  hardwareAcceleration: true,
  dependencies: {
    bitcoind: {
      description: 'Used to connect to your Bitcoin node.',
      optional: true,
      metadata: {
        title: 'A Bitcoin Full Node',
        icon: 'https://bitcoin.org/img/icons/opengraph.png',
      },
    },
  },
})
