import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const v_2_8_2_3 = VersionInfo.of({
  version: '2.8.2:3',
  releaseNotes: {
    en_US: `- The JSON-RPC network interface left behind by the StartOS 0.3.5 version of this package is removed and its ports freed. A domain or .onion address you had added to it no longer reaches Wasabi; add one to the JSON-RPC interface instead.
- Bitcoin Node's description explains each option.
- Bitcoin must be at least 28.4:29, 29.4:16, 30.3:16 or 31.1:16, depending on its major version. Bitcoin Knots (pre-RDTS) 29.3:29 or later also works.`,
    es_ES: `- Se elimina la interfaz de red JSON-RPC que dejó la versión de este paquete para StartOS 0.3.5 y se liberan sus puertos. Un dominio o una dirección .onion que hubieras añadido a ella ya no llega a Wasabi; añade uno a la interfaz JSON-RPC.
- La descripción de Nodo de Bitcoin explica cada opción.
- Bitcoin debe ser al menos la versión 28.4:29, 29.4:16, 30.3:16 o 31.1:16, según su versión principal. También funciona Bitcoin Knots (pre-RDTS) 29.3:29 o posterior.`,
    de_DE: `- Die JSON-RPC-Netzwerkschnittstelle, die die StartOS-0.3.5-Version dieses Pakets hinterlassen hat, wird entfernt und ihre Ports werden freigegeben. Eine Domain oder .onion-Adresse, die Sie ihr hinzugefügt hatten, erreicht Wasabi nicht mehr; fügen Sie stattdessen eine zur JSON-RPC-Schnittstelle hinzu.
- Die Beschreibung von Bitcoin-Knoten erklärt jede Option.
- Bitcoin muss je nach Hauptversion mindestens 28.4:29, 29.4:16, 30.3:16 oder 31.1:16 sein. Bitcoin Knots (pre-RDTS) ab 29.3:29 funktioniert ebenfalls.`,
    pl_PL: `- Interfejs sieciowy JSON-RPC pozostawiony przez wersję tego pakietu dla StartOS 0.3.5 zostaje usunięty, a jego porty zwolnione. Domena lub adres .onion dodany do niego nie prowadzi już do Wasabi; dodaj go do interfejsu JSON-RPC.
- Opis pola Węzeł Bitcoin wyjaśnia każdą opcję.
- Bitcoin musi być co najmniej w wersji 28.4:29, 29.4:16, 30.3:16 lub 31.1:16, zależnie od wersji głównej. Działa też Bitcoin Knots (pre-RDTS) 29.3:29 lub nowszy.`,
    fr_FR: `- L’interface réseau JSON-RPC laissée par la version de ce paquet pour StartOS 0.3.5 est supprimée et ses ports sont libérés. Un domaine ou une adresse .onion que vous y aviez ajouté ne mène plus à Wasabi ; ajoutez-en un à l’interface JSON-RPC.
- La description de Nœud Bitcoin explique chaque option.
- Bitcoin doit être au moins en version 28.4:29, 29.4:16, 30.3:16 ou 31.1:16, selon sa version majeure. Bitcoin Knots (pre-RDTS) 29.3:29 ou plus récent fonctionne aussi.`,
  },
  migrations: {
    up: async ({ effects }) => {
      await sdk.MultiHost.of(effects, 'rpc').retire()
    },
    down: IMPOSSIBLE,
  },
})
