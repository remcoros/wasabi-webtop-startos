WASABI_VERSION := 2.0.8.1
WASABI_PGP_SIG := 856348328949861E
# sha256 hashes can be found in https://github.com/mikefarah/yq/releases/download/v4.40.7/checksums-bsd
YQ_VERSION := 4.40.7
YQ_SHA_AMD64 := 4f13ee9303a49f7e8f61e7d9c87402e07cc920ae8dfaaa8c10d7ea1b8f9f48ed

PKG_ID := $(shell yq e ".id" manifest.yaml)
PKG_VERSION := $(shell yq e ".version" manifest.yaml)
TS_FILES := $(shell find ./ -name \*.ts)
ROOT_FILES := $(shell find ./root)
ASSET_FILES := $(shell find ./assets/compat)

.DELETE_ON_ERROR:

all: verify

x86:
	@ARCH=x86_64 $(MAKE)

verify: $(PKG_ID).s9pk
	@start-sdk verify s9pk $(PKG_ID).s9pk
	@echo " Done!"
	@echo "   Filesize: $(shell du -h $(PKG_ID).s9pk) is ready"

install:
ifeq (,$(wildcard ~/.embassy/config.yaml))
	@echo; echo "You must define \"host: http://server-name.local\" in ~/.embassy/config.yaml config file first"; echo
else
	start-cli package install $(PKG_ID).s9pk
endif

clean:
	rm -rf docker-images
	rm -f $(PKG_ID).s9pk
	rm -f scripts/*.js

scripts/embassy.js: $(TS_FILES)
	deno bundle scripts/embassy.ts scripts/embassy.js

docker-images/x86_64.tar: manifest.yaml Dockerfile docker_entrypoint.sh $(ROOT_FILES)
	mkdir -p docker-images
	docker buildx build --tag start9/$(PKG_ID)/main:$(PKG_VERSION) \
		--build-arg ARCH=x86_64 \
		--build-arg PLATFORM=amd64 \
		--build-arg WASABI_VERSION=$(WASABI_VERSION) \
		--build-arg WASABI_PGP_SIG=$(WASABI_PGP_SIG) \
		--build-arg YQ_VERSION=$(YQ_VERSION) \
		--build-arg YQ_SHA=$(YQ_SHA_AMD64) \
		--platform=linux/amd64 -o type=docker,dest=docker-images/x86_64.tar .

$(PKG_ID).s9pk: manifest.yaml instructions.md icon.png LICENSE scripts/embassy.js docker-images/x86_64.tar $(ASSET_FILES)
ifeq ($(ARCH),x86_64)
	@echo "start-sdk: Preparing x86_64 package ..."
else
	@echo "start-sdk: Preparing Universal Package ..."
endif
	@start-sdk pack
