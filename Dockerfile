FROM ghcr.io/linuxserver/baseimage-kasmvnc:debianbookworm AS buildstage

# these are specified in Makefile
ARG ARCH
ARG PLATFORM
ARG SPARROW_VERSION
ARG SPARROW_DEBVERSION
ARG SPARROW_PGP_SIG
ARG YQ_VERSION
ARG YQ_SHA

RUN \
  echo "**** install packages ****" && \
  apt-get update && \
  apt-get upgrade -y && \
  DEBIAN_FRONTEND=noninteractive \
  apt-get install -y --no-install-recommends \
    exo-utils \
    mousepad \
    xfce4-terminal \
    tumbler \
    thunar \
    # fix warnings in thunar about loading svg files
    libgdk-pixbuf2.0-0 \
    python3-xdg \
    wget \
    socat \
    gnupg && \
  # remove unused packages from base image
  apt-get remove --purge --autoremove -y \
    containerd.io \
    docker-ce \
    docker-ce-cli \
    docker-buildx-plugin \
    docker-compose-plugin \
    x11-apps \
    locales-all && \
  # remove left-over locales and generate default
  rm -rf /usr/share/locale/* && \
  localedef -i en_US -f UTF-8 en_US.UTF-8 && \
  # install yq
  wget -qO /tmp/yq https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_${PLATFORM} && \
  echo "${YQ_SHA} /tmp/yq" | sha256sum --check || exit 1 && \ 
  mv /tmp/yq /usr/local/bin/yq && chmod +x /usr/local/bin/yq && \
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
  # sparrow requires this directory to exist
  mkdir -p /usr/share/desktop-directories/ && \
  # Download and install Sparrow (todo: gpg sig verification)
  wget --quiet https://github.com/sparrowwallet/sparrow/releases/download/${SPARROW_VERSION}/sparrow_${SPARROW_DEBVERSION}_${PLATFORM}.deb \
                https://github.com/sparrowwallet/sparrow/releases/download/${SPARROW_VERSION}/sparrow-${SPARROW_VERSION}-manifest.txt \
                https://github.com/sparrowwallet/sparrow/releases/download/${SPARROW_VERSION}/sparrow-${SPARROW_VERSION}-manifest.txt.asc \
                https://keybase.io/craigraw/pgp_keys.asc && \
  # verify pgp and sha signatures
  gpg --import pgp_keys.asc && \
  gpg --status-fd 1 --verify sparrow-${SPARROW_VERSION}-manifest.txt.asc | grep -q "GOODSIG ${SPARROW_PGP_SIG} Craig Raw <craig@sparrowwallet.com>" || exit 1 && \
  sha256sum --check sparrow-${SPARROW_VERSION}-manifest.txt --ignore-missing || exit 1 && \
  apt-get install -y ./sparrow_${SPARROW_DEBVERSION}_${PLATFORM}.deb && \
  # cleanup
  rm ./sparrow* ./pgp_keys.asc

# start from scratch so we create smaller layers in the resulting image
FROM scratch

COPY --from=buildstage / .

# since we start from scratch, we need these env variables from the base images
ENV \
  # from ghcr.io/linuxserver/baseimage-debian:bookworm (https://github.com/linuxserver/docker-baseimage-debian/blob/master/Dockerfile)
  HOME="/root" \
  LANGUAGE="en_US.UTF-8" \
  LANG="en_US.UTF-8" \
  TERM="xterm" \
  S6_CMD_WAIT_FOR_SERVICES_MAXTIME="0" \
  S6_VERBOSITY=1 \
  S6_STAGE2_HOOK=/docker-mods \
  VIRTUAL_ENV=/lsiopy \
  PATH="/lsiopy/bin:$PATH" \
  # from ghcr.io/linuxserver/baseimage-kasmvnc:debianbookworm (https://github.com/linuxserver/docker-baseimage-kasmvnc/blob/debianbookworm/Dockerfile)
  DISPLAY=:1 \
  PERL5LIB=/usr/local/bin \
  OMP_WAIT_POLICY=PASSIVE \
  GOMP_SPINCOUNT=0 \
  HOME=/config \
  # base container starts docker by default, but we removed it, so set to false
  START_DOCKER=false \
  PULSE_RUNTIME_PATH=/defaults \
  NVIDIA_DRIVER_CAPABILITIES=all

# add local files
COPY /root /
COPY --chmod=a+x ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY --chmod=664 icon.png /kclient/public/icon.png
COPY --chmod=664 icon.png /kclient/public/favicon.ico

# ports and volumes
EXPOSE 3000
VOLUME /config

ENTRYPOINT ["/init"]
