ARG WASABIWEBTOP_VERSION=latest
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    git \
    zip \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Invalidate the clone layer whenever WalletWasabi's master branch advances.
ADD https://api.github.com/repos/WalletWasabi/WalletWasabi/commits/master /tmp/wasabi-master.json

# The locked master dependency set currently triggers NU1903, which upstream
# promotes to an error. Preserve the lockfile and disable the restore audit.
RUN git clone https://github.com/WalletWasabi/WalletWasabi.git \
  && cd WalletWasabi \
  && git checkout master \
  && sed -i 's/--locked-mode/--locked-mode --property:NuGetAudit=false/' Contrib/release.sh \
  && bash ./Contrib/release.sh debian \
  && find ./packages \
    -maxdepth 1 \
    -type f \
    -name 'Wasabi-*.deb' \
    ! -name '*-arm64.deb' \
    -exec cp '{}' /tmp/wasabi-master.deb ';' \
  && test -f /tmp/wasabi-master.deb

FROM ghcr.io/remcoros/wasabi-webtop:${WASABIWEBTOP_VERSION}

COPY --from=build /tmp/wasabi-master.deb /tmp/wasabi-master.deb

RUN dpkg -i /tmp/wasabi-master.deb \
  && rm -f /tmp/wasabi-master.deb
