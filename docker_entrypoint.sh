#!/bin/sh
echo
echo "Initialising Sparrow on Webtop..."
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

if [ ! -f /config/.sparrow/config ]; then
  echo "No Sparrow config file found, creating default"
  mkdir -p /config/.sparrow
  cp /defaults/.sparrow/config /config/.sparrow/config
  chown -R 1000:1000 /config/.sparrow
fi

case "$(yq e '.server.type' /root/data/start9/config.yaml)" in
"bitcoind")
  echo "Configuring Sparrow for Bitcoin Core"
  export BITCOIND_USER=$(yq e '.server.user' /root/data/start9/config.yaml)
  export BITCOIND_PASS=$(yq e '.server.password' /root/data/start9/config.yaml)
  yq e -i '
    .serverType = "BITCOIN_CORE" |
    .coreServer = "http://127.0.0.1:8332" |
    .coreAuthType = "USERPASS" |
    .coreAuth = strenv(BITCOIND_USER) + ":" + strenv(BITCOIND_PASS)' -o=json /config/.sparrow/config
  ;;
"electrs")
  echo "Configuring Sparrow for Electrs"
  yq e -i '
    .serverType = "ELECTRUM_SERVER" |
    .coreServer = "tcp://127.0.0.1:50001"' -o=json /config/.sparrow/config
  ;;
"public")
  echo "Configuring Sparrow for Public electrum server"
  yq e -i '.serverType = "PUBLIC_ELECTRUM_SERVER"' -o=json /config/.sparrow/config
  ;;
*)
  echo "Custom server selected, not configuring Sparrow"
  ;;
esac

case "$(yq e '.proxy.type' /root/data/start9/config.yaml)" in
"tor")
  echo "Configuring Sparrow for Tor"
  export EMBASSY_IP=$(ip -4 route list match 0/0 | awk '{print $3}')
  yq e -i '
    .useProxy = true |
    .proxyServer = strenv(EMBASSY_IP) + ":9050"' -o=json /config/.sparrow/config
  ;;
"none")
  echo "Configuring Sparrow for 'no proxy'"
  yq e -i '.useProxy = false' -o=json /config/.sparrow/config
  ;;
*)
  echo "Custom proxy selected, not configuring Sparrow"
  ;;
esac

exec /init
