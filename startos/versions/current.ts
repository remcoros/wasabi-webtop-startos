import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { removeLegacyProotApps } from '../utils'

export const WASABI_VERSION = '2.8.4'

export const current = VersionInfo.of({
  version: '2.8.4:0',
  releaseNotes: {
    en_US: `Updates Wasabi to 2.8.4: Taproot Payjoin support, stronger coinjoin checks, a private-funds-only payment option, clearer fee details, adjustable recovery gap limits, and fixes for stuck rates and Receive crashes. If Wasabi warns that a compatibility passphrase was used, follow its guidance to create a new wallet to ensure recoverability.

[Wasabi 2.8.3 release notes](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.3) · [Wasabi 2.8.4 release notes](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.4)

- Updates the streamed desktop to Selkies 2, including support for browsers without WebCodecs.
- Defaults streaming to 30 fps with Turbo off. Frame rate remains adjustable from 8–120 fps and Turbo remains adjustable; saved browser preferences are retained.
- Adds on-demand browser camera forwarding for QR scanning. Use a supported browser over trusted HTTPS; Tor Browser does not provide camera access.
- Removes the third-party application gallery and its unmodified bundled tools from existing homes. Other desktop tools and user files are preserved.
- Disables and locks desktop audio output and microphone forwarding.`,
    es_ES: `Actualiza Wasabi a 2.8.4: Payjoin con Taproot, verificaciones más estrictas de coinjoin, opción de pagar solo con fondos privados, desglose de comisiones, límite de direcciones sin usar ajustable en la recuperación y correcciones de tasas bloqueadas y fallos al recibir. Si Wasabi avisa de una contraseña de compatibilidad, sigue sus indicaciones para crear una cartera nueva y garantizar su recuperación.

[Notas de Wasabi 2.8.3](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.3) · [Notas de Wasabi 2.8.4](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.4)

- Actualiza el escritorio remoto a Selkies 2, con compatibilidad para navegadores sin WebCodecs.
- Establece 30 fps con Turbo desactivado como valores predeterminados. La frecuencia se puede ajustar entre 8 y 120 fps y Turbo sigue siendo configurable; se conservan las preferencias guardadas en el navegador.
- Añade el reenvío de la cámara del navegador bajo demanda para escanear códigos QR. Usa un navegador compatible mediante HTTPS de confianza; Tor Browser no permite acceder a la cámara.
- Elimina la galería de aplicaciones de terceros y sus herramientas incluidas sin modificar de las carpetas personales existentes. Conserva las demás herramientas del escritorio y los archivos del usuario.
- Desactiva y bloquea el audio del escritorio y el reenvío del micrófono.`,
    de_DE: `Aktualisiert Wasabi auf 2.8.4: Taproot-Payjoin, strengere Coinjoin-Prüfungen, Zahlungen nur mit privaten Guthaben, detailliertere Gebühren, einstellbare Adresslücken bei der Wiederherstellung sowie Korrekturen für festhängende Kurse und Abstürze beim Empfangen. Falls Wasabi vor einer Kompatibilitätspassphrase warnt, folgen Sie der Anleitung zum Erstellen einer neuen Wallet, um die Wiederherstellbarkeit sicherzustellen.

[Versionshinweise zu Wasabi 2.8.3](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.3) · [Versionshinweise zu Wasabi 2.8.4](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.4)

- Aktualisiert den übertragenen Desktop auf Selkies 2, einschließlich Unterstützung für Browser ohne WebCodecs.
- Überträgt standardmäßig mit 30 fps und deaktiviertem Turbo. Die Bildrate bleibt zwischen 8 und 120 fps einstellbar und Turbo kann weiterhin umgeschaltet werden; gespeicherte Browsereinstellungen bleiben erhalten.
- Ergänzt die bedarfsgesteuerte Weiterleitung der Browserkamera zum Scannen von QR-Codes. Verwenden Sie einen unterstützten Browser über vertrauenswürdiges HTTPS; Tor Browser bietet keinen Kamerazugriff.
- Entfernt den Anwendungskatalog von Drittanbietern und dessen unveränderte mitgelieferte Werkzeuge aus bestehenden Benutzerverzeichnissen. Andere Desktop-Werkzeuge und Benutzerdateien bleiben erhalten.
- Deaktiviert und sperrt Desktop-Audio und Mikrofonweiterleitung.`,
    pl_PL: `Aktualizuje Wasabi do 2.8.4: Payjoin z Taproot, dokładniejsze kontrole coinjoin, płatności wyłącznie prywatnymi środkami, szczegółowe opłaty, regulowany limit nieużywanych adresów przy odzyskiwaniu oraz poprawki zawieszonych kursów i awarii przy odbieraniu. Jeśli Wasabi ostrzega o użyciu hasła zgodności, wykonaj jego zalecenia i utwórz nowy portfel, aby zapewnić możliwość odzyskania środków.

[Informacje o Wasabi 2.8.3](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.3) · [Informacje o Wasabi 2.8.4](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.4)

- Aktualizuje przesyłany pulpit do Selkies 2, dodając obsługę przeglądarek bez WebCodecs.
- Ustawia domyślnie 30 kl./s z wyłączonym Turbo. Liczbę klatek można nadal regulować w zakresie 8–120 kl./s i przełączać Turbo; zapisane preferencje przeglądarki zostają zachowane.
- Dodaje przekazywanie kamery przeglądarki na żądanie do skanowania kodów QR. Użyj obsługiwanej przeglądarki przez zaufane HTTPS; Tor Browser nie udostępnia kamery.
- Usuwa galerię aplikacji innych firm i jej niezmodyfikowane narzędzia z istniejących katalogów domowych. Pozostałe narzędzia pulpitu i pliki użytkownika zostają zachowane.
- Wyłącza i blokuje dźwięk pulpitu oraz przekazywanie mikrofonu.`,
    fr_FR: `Met à jour Wasabi vers 2.8.4 : Payjoin avec Taproot, vérifications coinjoin renforcées, paiements limités aux fonds privés, détail des frais, limite d’adresses inutilisées réglable à la récupération et corrections des taux figés et des plantages à la réception. Si Wasabi signale une phrase secrète de compatibilité, suivez ses instructions pour créer un nouveau portefeuille et garantir sa récupération.

[Notes de Wasabi 2.8.3](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.3) · [Notes de Wasabi 2.8.4](https://github.com/WalletWasabi/WalletWasabi/releases/tag/v2.8.4)

- Met à jour le bureau distant vers Selkies 2, avec la prise en charge des navigateurs sans WebCodecs.
- Diffuse par défaut à 30 images/s avec Turbo désactivé. La fréquence reste réglable de 8 à 120 images/s et Turbo peut toujours être activé ou désactivé ; les préférences enregistrées dans le navigateur sont conservées.
- Ajoute le transfert à la demande de la caméra du navigateur pour scanner les codes QR. Utilisez un navigateur compatible via une connexion HTTPS de confiance ; Tor Browser ne donne pas accès à la caméra.
- Supprime la galerie d’applications tierces et ses outils fournis non modifiés des dossiers personnels existants. Les autres outils du bureau et les fichiers de l’utilisateur sont conservés.
- Désactive et verrouille le son du bureau et le transfert du microphone.`,
  },
  migrations: {
    up: async () => {
      await removeLegacyProotApps(sdk.volumes.userdir.subpath(''))
    },
    down: IMPOSSIBLE,
  },
})
