<p align="center">
  <img src="icon.png" alt="Project Logo" width="21%">
</p>

# Wasabi on Webtop for StartOS

[Webtop](https://docs.linuxserver.io/images/docker-webtop/) is an innovative Linux desktop environment that allows users to access a complete Linux desktop directly from their web browser. This repository creates the `s9pk` package that is installed to run the [Wasabi desktop wallet](https://wasabiwallet.io/) on a stripped down version of `Webtop` on [StartOS](https://github.com/Start9Labs/start-os/). Learn more about service packaging in the [Developer Docs](https://start9.com/latest/developer-docs/).

## Dependencies

Install the system dependencies below to build this project by following the instructions in the provided links. You can also find detailed steps to setup your environment in the service packaging [documentation](https://docs.start9.com/latest/developer-docs/packaging#development-environment).

- [docker](https://docs.docker.com/get-docker)
- [docker-buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [yq](https://mikefarah.gitbook.io/yq)
- [deno](https://deno.land/)
- [make](https://www.gnu.org/software/make/)
- [start-sdk](https://github.com/Start9Labs/start-os/tree/sdk)

## Cloning

Clone the Webtop package repository locally.

```
git clone git@github.com:remcoros/wasabi-webtop-startos.git
cd wasabi-webtop-startos
```

## Building

To build the **Wasabi** service as a universal package, run the following command:

```
make
```

## Installing (on StartOS)

Before installation, define `host: https://server-name.local` in your `~/.embassy/config.yaml` config file then run the following commands to determine successful install:

> Change server-name.local to your Start9 server address

```
start-cli auth login
#Enter your StartOS password
make install
```

**Tip:** You can also install the wasabi-webtop.s9pk by sideloading it under the **StartOS > System > Sideload a Service** section.

## Verify Install

Go to your StartOS Services page, select **Wasabi**, configure and start the service.

**Done!**
