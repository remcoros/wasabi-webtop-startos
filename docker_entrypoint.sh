#!/bin/sh

echo
echo "Initialising Wasabi on Webtop..."
echo

export PUID=1000
export PGID=1000
export TZ=Etc/UTC
export TITLE="$(yq e '.title' /root/data/start9/config.yaml)"
CUSTOM_USER="$(yq e '.username' /root/data/start9/config.yaml)"
PASSWORD="$(yq e '.password' /root/data/start9/config.yaml)"

cat <<EOF >/root/data/start9/stats.yaml
version: 2
data:
  "UI Username":
    type: string
    value: "$CUSTOM_USER"
    description: "Username for logging into your Webtop."
    copyable: true
    qr: false
    masked: false
  "UI Password":
    type: string
    value: "$PASSWORD"
    description: "Password for logging into your Webtop."
    copyable: true
    qr: false
    masked: true
EOF

# Copy default files
cp /defaults/.backupignore /config/.backupignore

# always overwrite autostart in case we change it
mkdir -p /config/.config/openbox
cp /defaults/autostart /config/.config/openbox/autostart
chown -R $PUID:$PGID /config/.config/openbox

if [ ! -f /config/.walletwasabi/client/Config.json ]; then
  echo "No Wasabi config file found, creating default"
  mkdir -p /config/.walletwasabi/client/
  cp /defaults/.walletwasabi/client/Config.json /config/.walletwasabi/client/Config.json
  chown -R $PUID:$PGID /config/.walletwasabi
fi

# Manage Wasabi settings?
if [ $(yq e '.wasabi.managesettings' /root/data/start9/config.yaml) = "true" ]; then
  # remove UTF8 BOM character, because yq does not like this
  sed -i '1s/^\xEF\xBB\xBF//' /config/.walletwasabi/client/Config.json

  # Force enable GPU rendering
  yq e -i '.EnableGpu = true' -o=json /config/.walletwasabi/client/Config.json    

  # private bitcoin server
  case "$(yq e '.wasabi.server.type' /root/data/start9/config.yaml)" in
  "bitcoind")
    echo "Configuring Wasabi for private Bitcoin Core node"
    yq e -i '.MainNetBitcoinP2pEndPoint = "bitcoind.embassy:8333"' -o=json /config/.walletwasabi/client/Config.json    
    ;;
  "none")
    echo "Configuring Wasabi for public Bitcoin nodes"
    # reset it to default (127.0.0.1:8333), an empty string is not allowed
    yq e -i '.MainNetBitcoinP2pEndPoint = "127.0.0.1:8333"' -o=json /config/.walletwasabi/client/Config.json
    ;;
  *)
    echo "Unknown server selected, not configuring Wasabi"
    ;;
  esac

  # Use Tor?
  if [ $(yq e '.wasabi.useTor' /root/data/start9/config.yaml) = "true" ]; then
    echo "Configuring Wasabi for Tor"
    yq e -i '.UseTor = true' -o=json /config/.walletwasabi/client/Config.json
  else
    echo "Disabling Tor in Wasabi"
    yq e -i '.UseTor = false' -o=json /config/.walletwasabi/client/Config.json
  fi

  # Wasabi Backend URI
  MainNetBackendUri="$(yq e '.wasabi.mainNetBackendUri' /root/data/start9/config.yaml)"
  yq e -i ".MainNetBackendUri = \"$MainNetBackendUri\"" -o=json /config/.walletwasabi/client/Config.json

  # Json RPC server
  if [ $(yq e '.wasabi.rpc.enable' /root/data/start9/config.yaml) = "true" ]; then
    echo "Configuring Wasabi Json RPC server"

    RPC_TOR_ADDRESS="$(yq e '.wasabi.rpc.rpc-tor-address' /root/data/start9/config.yaml)"
    RPC_ADDRESS=${RPC_TOR_ADDRESS%".onion"}.local
    RPC_USER=$(yq e '.wasabi.rpc.username' /root/data/start9/config.yaml)
    RPC_PASS=$(yq e '.wasabi.rpc.password' /root/data/start9/config.yaml)
    
    yq e -i "
      .JsonRpcServerEnabled = true |
      .JsonRpcUser = \"$RPC_USER\" |
      .JsonRpcPassword = \"$RPC_PASS\" |
      .JsonRpcServerPrefixes = [\"http://+:37128/\"]" -o=json /config/.walletwasabi/client/Config.json
    
cat << EOF >>/root/data/start9/stats.yaml
  "Tor RPC Url":
    type: string
    value: "http://$RPC_TOR_ADDRESS"
    description: "Tor Json RPC Url"
    copyable: true
    qr: false
    masked: false
  "LAN RPC Url":
    type: string
    value: "https://$RPC_ADDRESS"
    description: "LAN Json RPC Url"
    copyable: true
    qr: false
    masked: false
  "RPC Username":
    type: string
    value: "$RPC_USER"
    description: "Username for logging into RPC Server."
    copyable: true
    qr: false
    masked: false
  "RPC Password":
    type: string
    value: "$RPC_PASS"
    description: "Password for logging into RPC Server."
    copyable: true
    qr: false
    masked: true
EOF

    unset RPC_USER
    unset RPC_PASS
  else
    echo "Disabling Wasabi Json RPC server"
    yq e -i '.JsonRpcServerEnabled = false' -o=json /config/.walletwasabi/client/Config.json
  fi
fi

# hack to disable systemd-inhibit, which Wasabi uses for sleep/shutdown detection
# we don't need it, since we run in a container and don't use systemd or sleep the system.
# this gets rid of a lot of repeated warning logs
mv /usr/bin/systemd-inhibit /usr/bin/systemd-inhibit.disabled

exec /init
