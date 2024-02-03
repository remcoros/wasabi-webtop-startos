FROM ghcr.io/linuxserver/baseimage-kasmvnc:debianbookworm

# these are specified in Makefile
ARG ARCH
ARG SPARROW_VERSION
ARG SPARROW_DEBVERSION

ARG SPARROW_PGP_SIG=E94618334C674B40

RUN \
  echo "**** install packages ****" && \
  apt-get update && \
  DEBIAN_FRONTEND=noninteractive \
  apt-get install -y --no-install-recommends \
    exo-utils \
    mousepad \
    xfce4-terminal \
    tumbler \
    thunar \
    python3-xdg \
    yq \
    wget \
    gnupg && \
  echo "**** xfce tweaks ****" && \
  rm -f /etc/xdg/autostart/xscreensaver.desktop && \
  sed -i 's|</applications>|  <application title="Sparrow" type="normal">\n    <maximized>yes</maximized>\n  </application>\n</applications>|' /etc/xdg/openbox/rc.xml && \
  # StartOS branding
  echo "Starting Sparrow on Webtop for StartOS..." > /etc/s6-overlay/s6-rc.d/init-adduser/branding; sed -i '/run_branding() {/,/}/d' /docker-mods && \
  echo "**** cleanup ****" && \
  apt-get autoclean && \
  rm -rf \
    /config/.cache \
    /var/lib/apt/lists/* \
    /var/tmp/* \
    /tmp/*

# Sparrow
RUN \
  echo "**** install Sparrow ****" && \
  case ${ARCH:-x86_64} in \
    "aarch64") SPARROW_ARCH="arm64";; \
    "x86_64") SPARROW_ARCH="amd64";; \
    *) echo "Dockerfile does not support this platform"; exit 1 ;; \
    esac && \
    # sparrow requires this directory to exist
    mkdir -p /usr/share/desktop-directories/ && \
    # Download and install Sparrow (todo: gpg sig verification)
    wget --quiet https://github.com/sparrowwallet/sparrow/releases/download/${SPARROW_VERSION}/sparrow_${SPARROW_DEBVERSION}_${SPARROW_ARCH}.deb \
                 https://github.com/sparrowwallet/sparrow/releases/download/${SPARROW_VERSION}/sparrow-${SPARROW_VERSION}-manifest.txt \
                 https://github.com/sparrowwallet/sparrow/releases/download/${SPARROW_VERSION}/sparrow-${SPARROW_VERSION}-manifest.txt.asc \
                 https://keybase.io/craigraw/pgp_keys.asc && \
    # verify pgp and sha signatures
    gpg --import pgp_keys.asc && \
    gpg --status-fd 1 --verify sparrow-${SPARROW_VERSION}-manifest.txt.asc | grep -q "GOODSIG ${PGP_SIG}" || exit 1 && \
    sha256sum --check sparrow-${SPARROW_VERSION}-manifest.txt --ignore-missing || exit 1 && \
    apt-get install -y ./sparrow_${SPARROW_DEBVERSION}_${SPARROW_ARCH}.deb && \
    # cleanup
    rm ./sparrow* ./pgp_keys.asc

# add local files
COPY /root /
COPY --chmod=a+x ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY --chmod=664 icon.png /kclient/public/icon.png
COPY --chmod=664 icon.png /kclient/public/favicon.ico

# ports and volumes
EXPOSE 3000
VOLUME /config
