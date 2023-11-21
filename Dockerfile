FROM ghcr.io/linuxserver/baseimage-kasmvnc:alpine318

ARG BUILD_DATE
ARG VERSION
ARG XFCE_VERSION

ENV LANG=C.UTF-8

RUN \
  echo "**** install packages ****" && \
  apk add --no-cache \
    firefox \
    libpcap \
    yq \
    faenza-icon-theme \
    faenza-icon-theme-xfce4-appfinder \
    faenza-icon-theme-xfce4-panel \
    mousepad \
    ristretto \
    thunar \
    util-linux-misc \
    xfce4 \
    xfce4-terminal && \
  echo "**** cleanup ****" && \
  rm -f \
    /etc/xdg/autostart/xfce4-power-manager.desktop \
    /etc/xdg/autostart/xscreensaver.desktop \
    /usr/share/xfce4/panel/plugins/power-manager-plugin.desktop && \
  rm -rf \
    /config/.cache \
    /tmp/*

COPY /root /
RUN mkdir -p /root/data
VOLUME /config

RUN echo -e "\nStarting Webtop for StartOS ..." > /etc/s6-overlay/s6-rc.d/init-adduser/branding; sed -i '/run_branding() {/,/}/d' /docker-mods
COPY --chmod=a+x ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY --chmod=664 icon.png /kclient/public/icon.png
COPY --chmod=664 icon.png /kclient/public/favicon.ico
