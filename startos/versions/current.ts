import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const WASABI_VERSION = '2.8.5'

export const current = VersionInfo.of({
  version: '2.8.5:0',
  releaseNotes: {
    en_US: `Updates Wasabi Wallet to 2.8.5 with security fixes and improved coinjoin stability. Removes BIP78 payjoin support and refreshes the desktop runtime and StartOS SDK. If Wasabi warns that a compatibility passphrase was used, follow its guidance to create a new wallet to ensure recoverability.

[Wasabi 2.8.5 release notes](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.5)`,
    es_ES: `Actualiza Wasabi Wallet a 2.8.5 con correcciones de seguridad y mayor estabilidad de coinjoin. Elimina la compatibilidad con payjoin BIP78 y actualiza el entorno del escritorio y el SDK de StartOS. Si Wasabi avisa de una contraseña de compatibilidad, sigue sus indicaciones para crear una cartera nueva y garantizar su recuperación.

[Notas de Wasabi 2.8.5](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.5)`,
    de_DE: `Aktualisiert Wasabi Wallet auf 2.8.5 mit Sicherheitskorrekturen und verbesserter Coinjoin-Stabilität. Entfernt die Unterstützung für BIP78-Payjoin und aktualisiert die Desktop-Laufzeit und das StartOS-SDK. Falls Wasabi vor einer Kompatibilitätspassphrase warnt, folgen Sie der Anleitung zum Erstellen einer neuen Wallet, um die Wiederherstellbarkeit sicherzustellen.

[Versionshinweise zu Wasabi 2.8.5](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.5)`,
    pl_PL: `Aktualizuje Wasabi Wallet do 2.8.5 z poprawkami bezpieczeństwa i stabilności coinjoin. Usuwa obsługę payjoin BIP78 oraz aktualizuje środowisko pulpitu i SDK StartOS. Jeśli Wasabi ostrzega o użyciu hasła zgodności, wykonaj jego zalecenia i utwórz nowy portfel, aby zapewnić możliwość odzyskania środków.

[Informacje o Wasabi 2.8.5](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.5)`,
    fr_FR: `Met à jour Wasabi Wallet vers 2.8.5 avec des correctifs de sécurité et une meilleure stabilité des coinjoins. Supprime la prise en charge de payjoin BIP78 et actualise l’environnement du bureau et le SDK StartOS. Si Wasabi signale une phrase secrète de compatibilité, suivez ses instructions pour créer un nouveau portefeuille et garantir sa récupération.

[Notes de Wasabi 2.8.5](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.5)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
