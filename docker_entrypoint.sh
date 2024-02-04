#!/bin/sh
echo
echo "Initialising Sparrow on Webtop..."
echo
export PUID=1000
export PGID=1000
export TZ=Etc/UTC
export TITLE="$(yq -r '.title' /root/data/start9/config.yaml)"
export CUSTOM_USER="$(yq -r '.username' /root/data/start9/config.yaml)"
export PASSWORD="$(yq -r '.password' /root/data/start9/config.yaml)"

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

if [ ! -f /config/.sparrow/config ]; then
  echo "No Sparrow config file found, creating default"
  mkdir -p /config/.sparrow
  cp /defaults/.sparrow/config /config/.sparrow/config
  chown -R 1000:1000 /config/.sparrow
fi

case "$(yq -r '.server.type' /root/data/start9/config.yaml)" in
"bitcoind")
  echo "Configuring Sparrow for Bitcoin Core"
  BITCOIND_USER=$(yq -r '.server.user' /root/data/start9/config.yaml)
  BITCOIND_PASS=$(yq -r '.server.password' /root/data/start9/config.yaml)
  cat /config/.sparrow/config | jq '.serverType = "BITCOIN_CORE"' | tee /config/.sparrow/config 1>/dev/null
  cat /config/.sparrow/config | jq '.coreServer = "http://127.0.0.1:8332"' | tee /config/.sparrow/config 1>/dev/null
  cat /config/.sparrow/config | jq '.coreAuthType = "USERPASS"' | tee /config/.sparrow/config 1>/dev/null
  cat /config/.sparrow/config | jq ".coreAuth = \"${BITCOIND_USER}:${BITCOIND_PASS}\"" | tee /config/.sparrow/config 1>/dev/null
  ;;
"electrs")
  echo "Configuring Sparrow for Electrs"
  cat /config/.sparrow/config | jq '.serverType = "ELECTRUM_SERVER"' | tee /config/.sparrow/config 1>/dev/null
  cat /config/.sparrow/config | jq '.coreServer = "tcp://127.0.0.1:50001"' | tee /config/.sparrow/config 1>/dev/null
  ;;
"public")
  echo "Configuring Sparrow for Public electrum server"
  cat /config/.sparrow/config | jq '.serverType = "PUBLIC_ELECTRUM_SERVER"' | tee /config/.sparrow/config 1>/dev/null
  ;;
*)
  echo "Custom server selected, not configuring Sparrow"
  ;;
esac

case "$(yq -r '.proxy.type' /root/data/start9/config.yaml)" in
"tor")
  echo "Configuring Sparrow for Tor"
  EMBASSY_IP=$(ip -4 route list match 0/0 | awk '{print $3}')
  cat /config/.sparrow/config | jq '.useProxy = true' | tee /config/.sparrow/config 1>/dev/null
  cat /config/.sparrow/config | jq ".proxyServer = \"${EMBASSY_IP}:9050\"" | tee /config/.sparrow/config 1>/dev/null
  ;;
"none")
  echo "Configuring Sparrow for 'no proxy'"
  cat /config/.sparrow/config | jq '.useProxy = false' | tee /config/.sparrow/config 1>/dev/null
  ;;
*)
  echo "Custom proxy selected, not configuring Sparrow"
  ;;
esac

exec /init
