import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const WASABI_VERSION = '2.8.4.1'

export const current = VersionInfo.of({
  version: '2.8.4:2',
  releaseNotes: {
    en_US: `Updates the desktop to Selkies 2.1.0. Uses the upstream image's updated CA stores directly, preserving the eMudhra certificate fix and removing the temporary package layer. Wasabi Wallet remains at 2.8.4.

[Container release notes](https://github.com/remcoros/wasabi-webtop/releases/tag/v2.8.4.1)`,
    es_ES: `Actualiza el escritorio a Selkies 2.1.0. Usa directamente los almacenes de certificados actualizados de la imagen original, conserva la corrección de los certificados eMudhra y elimina la capa temporal del paquete. Wasabi Wallet se mantiene en la versión 2.8.4.

[Notas de la versión del contenedor](https://github.com/remcoros/wasabi-webtop/releases/tag/v2.8.4.1)`,
    de_DE: `Aktualisiert den Desktop auf Selkies 2.1.0. Verwendet direkt die aktualisierten Zertifikatsspeicher des Upstream-Images, behält die eMudhra-Zertifikatskorrektur bei und entfernt die temporäre Paketschicht. Wasabi Wallet bleibt auf Version 2.8.4.

[Versionshinweise zum Container](https://github.com/remcoros/wasabi-webtop/releases/tag/v2.8.4.1)`,
    pl_PL: `Aktualizuje pulpit do Selkies 2.1.0. Korzysta bezpośrednio ze zaktualizowanych magazynów certyfikatów obrazu źródłowego, zachowując poprawkę dotyczącą certyfikatów eMudhra i usuwając tymczasową warstwę pakietu. Wasabi Wallet pozostaje w wersji 2.8.4.

[Informacje o wydaniu kontenera](https://github.com/remcoros/wasabi-webtop/releases/tag/v2.8.4.1)`,
    fr_FR: `Met à jour le bureau vers Selkies 2.1.0. Utilise directement les magasins de certificats actualisés de l’image amont, conserve la correction des certificats eMudhra et supprime la couche temporaire du paquet. Wasabi Wallet reste en version 2.8.4.

[Notes de version du conteneur](https://github.com/remcoros/wasabi-webtop/releases/tag/v2.8.4.1)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
