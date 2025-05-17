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

# Copy default Wasabi files
mkdir -p /config/.walletwasabi/client/
if [ ! -f /config/.walletwasabi/client/Config.json ]; then
  echo "No Wasabi config file found, creating default"
  cp /defaults/.walletwasabi/client/Config.json /config/.walletwasabi/client/Config.json
fi

if [ ! -f /config/.walletwasabi/client/UiConfig.json ]; then
  echo "No Wasabi UI config file found, creating default"
  cp /defaults/.walletwasabi/client/UiConfig.json /config/.walletwasabi/client/UiConfig.json
fi

chown -R $PUID:$PGID /config/.walletwasabi

# remove UTF8 BOM character, because yq does not like this
sed -i '1s/^\xEF\xBB\xBF//' /config/.walletwasabi/client/UiConfig.json

# Force windowstate to full-screen. We used to do this through the openbox rc.xml config, but this causes graphical glitches in Wasabi.
yq e -i '.WindowState = "FullScreen"' -o=json /config/.walletwasabi/client/UiConfig.json

# Manage Wasabi settings?
if [ $(yq e '.wasabi.managesettings' /root/data/start9/config.yaml) = "true" ]; then
  # remove UTF8 BOM character, because yq does not like this
  sed -i '1s/^\xEF\xBB\xBF//' /config/.walletwasabi/client/Config.json

  # Force enable GPU rendering
  yq e -i '.EnableGpu = true' -o=json /config/.walletwasabi/client/Config.json

  # Update config version so Wasabi will not try to migrate it
  yq e -i '.ConfigVersion = 2' -o=json /config/.walletwasabi/client/Config.json

  # private bitcoin server
  case "$(yq e '.wasabi.server.type' /root/data/start9/config.yaml)" in
  "bitcoind")
    echo "Configuring Wasabi for private Bitcoin node"
    BITCOIND_IP=$(getent hosts bitcoind.embassy | awk '{print $1}')
    BITCOIND_USER=$(yq e '.wasabi.server.user' /root/data/start9/config.yaml)
    BITCOIND_PASS=$(yq e '.wasabi.server.password' /root/data/start9/config.yaml)
    yq e -i "
      .UseBitcoinRpc = true |
      .MainNetBitcoinRpcEndPoint = \"$BITCOIND_IP:8332\" |
      .MainNetBitcoinRpcCredentialString = \"$BITCOIND_USER:$BITCOIND_PASS\"" -o=json /config/.walletwasabi/client/Config.json
    ;;
  "none")
    echo "Configuring Wasabi for public Bitcoin nodes"
    # reset it to default (127.0.0.1:8332), an empty string is not allowed
    yq e -i "
      .UseBitcoinRpc = false |
      .MainNetBitcoinRpcEndPoint = \"127.0.0.1:8332\" |
      .MainNetBitcoinRpcCredentialString = \"\"" -o=json /config/.walletwasabi/client/Config.json
    ;;
  *)
    echo "Unknown server selected, not configuring Wasabi"
    ;;
  esac

  # Use Tor?
  if [ $(yq e '.wasabi.useTor' /root/data/start9/config.yaml) = "true" ]; then
    echo "Configuring Wasabi for Tor"
    yq e -i '.UseTor = "Enabled"' -o=json /config/.walletwasabi/client/Config.json
  else
    echo "Disabling Tor in Wasabi"
    yq e -i '.UseTor = "Disabled"' -o=json /config/.walletwasabi/client/Config.json
  fi

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

    cat <<EOF >>/root/data/start9/stats.yaml
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

# remove reference to non-existing file, see: https://github.com/linuxserver/kclient/issues/8
sed -i '/<script src="public\/js\/pcm-player\.js"><\/script>/d' /kclient/public/index.html

# add '&reconnect=' setting to kclient html
RECONNECT=$(yq e '.reconnect' /root/data/start9/config.yaml)
sed -i "s/\(index\.html?autoconnect=1\)/&\&reconnect=$RECONNECT/" /kclient/public/index.html

# hack to disable systemd-inhibit, which Wasabi uses for sleep/shutdown detection
# we don't need it, since we run in a container and don't use systemd or sleep the system.
# this gets rid of a lot of repeated warning logs
mv /usr/bin/systemd-inhibit /usr/bin/systemd-inhibit.disabled

exec /init
