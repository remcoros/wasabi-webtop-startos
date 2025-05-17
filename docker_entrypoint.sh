#!/bin/sh

echo
echo "Initialising Wasabi on Webtop..."
echo

# Copy default files
cp /defaults/.backupignore /config/.backupignore

# always overwrite autostart in case we change it
mkdir -p /config/.config/openbox
cp /defaults/autostart /config/.config/openbox/autostart
chown -R $PUID:$PGID /config/.config/openbox

# remove reference to non-existing file, see: https://github.com/linuxserver/kclient/issues/8
sed -i '/<script src="public\/js\/pcm-player\.js"><\/script>/d' /kclient/public/index.html

# add '&reconnect=' setting to kclient html
sed -i "s/\(index\.html?autoconnect=1\)/&\&reconnect=$RECONNECT/" /kclient/public/index.html

# hack to disable systemd-inhibit, which Wasabi uses for sleep/shutdown detection
# we don't need it, since we run in a container and don't use systemd or sleep the system.
# this gets rid of a lot of repeated warning logs
mv /usr/bin/systemd-inhibit /usr/bin/systemd-inhibit.disabled

exec /init
