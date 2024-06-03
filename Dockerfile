FROM ghcr.io/linuxserver/baseimage-kasmvnc:debianbookworm-94e8f989-ls61 AS buildstage

# these are specified in Makefile
ARG ARCH
ARG PLATFORM
ARG WASABI_VERSION
ARG WASABI_PGP_SIG
ARG YQ_VERSION
ARG YQ_SHA

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
    # from 'recommended packages', solves a few warnings
    thunar-archive-plugin \
    librsvg2-common \
    python3-xdg \
    # dark theme
    hsetroot \
    gnome-themes-extra \
    compton \
    # desktop notifications
    xfce4-notifyd \
    libnotify-bin \
    notification-daemon \
    xclip \
    # other
    policykit-1 \
    wget \
    gnupg && \
  # remove unused packages from base image
  DEBIAN_FRONTEND=noninteractive \
  apt-get remove --purge --autoremove -y \
    containerd.io \
    cpp \
    cpp-12 \
    docker-ce \
    docker-ce-cli \
    docker-buildx-plugin \
    docker-compose-plugin \
    fonts-noto-color-emoji \
    fonts-noto-core \
    intel-media-va-driver \
    libvulkan1 \
    mesa-va-drivers \
    mesa-vulkan-drivers \
    vulkan-tools \
    xserver-xorg-video-amdgpu \
    xserver-xorg-video-ati \
    xserver-xorg-video-intel \
    xserver-xorg-video-nouveau \
    xserver-xorg-video-qxl \
    xserver-xorg-video-radeon \
    perl \
    locales-all && \
  # remove left-over locales and generate default
  rm -rf $(ls -d /usr/share/locale/* | grep -vw /usr/share/locale/en) && \
  localedef -i en_US -f UTF-8 en_US.UTF-8 && \
  # upgrade remaining packages
  DEBIAN_FRONTEND=noninteractive \
  apt-get upgrade -y && \
  # install yq
  wget -qO /tmp/yq https://github.com/mikefarah/yq/releases/download/v${YQ_VERSION}/yq_linux_${PLATFORM} && \
  echo "${YQ_SHA} /tmp/yq" | sha256sum --check || exit 1 && \ 
  mv /tmp/yq /usr/local/bin/yq && chmod +x /usr/local/bin/yq && \
  echo "**** xfce tweaks ****" && \
  rm -f /etc/xdg/autostart/xscreensaver.desktop && \
  # StartOS branding
  echo "Starting Wasabi on Webtop for StartOS..." > /etc/s6-overlay/s6-rc.d/init-adduser/branding; sed -i '/run_branding() {/,/}/d' /docker-mods && \
  # cleanup and remove some unneeded large binaries
  echo "**** cleanup ****" && \
  rm /kasmbins/kasm_webcam_server && \
  apt-get autoclean && \
  rm -rf \
    /config/.cache \
    /var/lib/apt/lists/* \
    /var/tmp/* \
    /tmp/*

# Wasabi
RUN \
  echo "**** install Wasabi ****" && \
  # Wasabi requires this directory to exist
  mkdir -p /usr/share/desktop-directories/ && \
  # Download and install Wasabi
  wget --quiet https://github.com/WalletWasabi/WalletWasabi/releases/download/v${WASABI_VERSION}/Wasabi-${WASABI_VERSION}.deb \
               https://github.com/WalletWasabi/WalletWasabi/releases/download/v${WASABI_VERSION}/Wasabi-${WASABI_VERSION}.deb.asc \
               https://github.com/WalletWasabi/WalletWasabi/releases/download/v${WASABI_VERSION}/SHA256SUMS.asc \
               https://raw.githubusercontent.com/WalletWasabi/WalletWasabi/master/PGP.txt && \
  # verify pgp and sha signatures
  gpg --import PGP.txt && \
  gpg --status-fd 1 --verify Wasabi-${WASABI_VERSION}.deb.asc | grep -q "GOODSIG ${WASABI_PGP_SIG} zkSNACKs <zksnacks@gmail.com>" || exit 1 && \
  sha256sum --check SHA256SUMS.asc --ignore-missing || exit 1 && \
  DEBIAN_FRONTEND=noninteractive \
  apt-get install -y ./Wasabi-${WASABI_VERSION}.deb && \
  # cleanup
  rm ./Wasabi* ./PGP.txt ./SHA256SUMS.asc

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
  NVIDIA_DRIVER_CAPABILITIES=all \
  # set dark theme
  GTK_THEME=Adwaita:dark \
  GTK2_RC_FILES=/usr/share/themes/Adwaita-dark/gtk-2.0/gtkrc \
  # prevent kasm from touching our rc.xml
  NO_FULL=1

# add local files
COPY /root /
COPY --chmod=a+x ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY --chmod=664 icon.png /kclient/public/icon.png
COPY --chmod=664 icon.png /kclient/public/favicon.ico

# ports and volumes
EXPOSE 3000
VOLUME /config
