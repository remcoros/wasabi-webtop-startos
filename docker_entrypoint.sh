#!/bin/sh
echo
echo "Initialising Webtop ..."
echo
export PUID=1000
export PGID=1000
export TZ=Etc/UTC
export TITLE="$(yq e .title /root/data/start9/config.yaml)"
export CUSTOM_USER="$(yq e .username /root/data/start9/config.yaml)"
export PASSWORD="$(yq e .password /root/data/start9/config.yaml)"

cat << EOF > /root/data/start9/stats.yaml
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

exec /init