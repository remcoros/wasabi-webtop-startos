import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const WASABI_VERSION = '2.8.5'

export const current = VersionInfo.of({
  version: '2.8.5:2',
  releaseNotes: {
    en_US:
      'Wasabi no longer reads Bitcoin\'s configuration. It checks its RPC credentials with Bitcoin directly, and if Bitcoin rejects them the "Create RPC credentials for Wasabi" task reappears on Bitcoin\'s page, including after Bitcoin is reinstalled or reset. Wasabi Wallet remains at version 2.8.5.',
    es_ES:
      'Wasabi ya no lee la configuración de Bitcoin. Comprueba sus credenciales RPC directamente con Bitcoin y, si Bitcoin las rechaza, la tarea "Crear credenciales RPC para Wasabi" vuelve a aparecer en la página de Bitcoin, también después de reinstalar o restablecer Bitcoin. Wasabi Wallet permanece en la versión 2.8.5.',
    de_DE:
      'Wasabi liest die Konfiguration von Bitcoin nicht mehr. Es prüft seine RPC-Zugangsdaten direkt bei Bitcoin, und wenn Bitcoin sie ablehnt, erscheint die Aufgabe „RPC-Zugangsdaten für Wasabi erstellen“ erneut auf der Seite von Bitcoin, auch nachdem Bitcoin neu installiert oder zurückgesetzt wurde. Wasabi Wallet bleibt auf Version 2.8.5.',
    pl_PL:
      'Wasabi nie odczytuje już konfiguracji Bitcoin. Sprawdza swoje dane logowania RPC bezpośrednio w Bitcoin, a jeśli Bitcoin je odrzuci, zadanie „Utwórz dane logowania RPC dla Wasabi” pojawia się ponownie na stronie Bitcoin, także po ponownej instalacji lub zresetowaniu Bitcoin. Wasabi Wallet pozostaje w wersji 2.8.5.',
    fr_FR:
      'Wasabi ne lit plus la configuration de Bitcoin. Il vérifie ses identifiants RPC directement auprès de Bitcoin et, si Bitcoin les refuse, la tâche « Créer les identifiants RPC pour Wasabi » réapparaît sur la page de Bitcoin, y compris après une réinstallation ou une réinitialisation de Bitcoin. Wasabi Wallet reste en version 2.8.5.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
