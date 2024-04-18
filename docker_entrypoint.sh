#!/bin/sh

echo
echo "Initialising Wasabi on Webtop..."
echo

export PUID=1000
export PGID=1000
export TZ=Etc/UTC
export TITLE="$(yq e '.title' /root/data/start9/config.yaml)"
export CUSTOM_USER="$(yq e '.username' /root/data/start9/config.yaml)"
export PASSWORD="$(yq e '.password' /root/data/start9/config.yaml)"

cat <<EOF >/root/data/start9/stats.yaml
version: 2
data:
  "Username":
    type: string
    value: "$CUSTOM_USER"
    description: "Username for logging into your Webtop."
    copyable: true
    qr: false
    masked: false
  "Password":
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
chown -R abc:abc /config/.config/openbox

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
fi

# hack to disable systemd-inhibit, which Wasabi uses for sleep/shutdown detection
# we don't need it, since we run in a container and don't use systemd or sleep the system.
# this gets rid of a lot of repeated warning logs
mv /usr/bin/systemd-inhibit /usr/bin/systemd-inhibit.disabled

exec /init
