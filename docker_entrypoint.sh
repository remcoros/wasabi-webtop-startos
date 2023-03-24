#!/bin/sh
echo
echo "Starting Webtop ..."
echo
export PUID=1000
export PGID=1000
export TZ=Etc/UTC
export TITLE="$(yq e .title /root/data/start9/config.yaml)"

exec /init
