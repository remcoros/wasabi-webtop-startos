FROM lscr.io/linuxserver/webtop:latest

RUN apk update
RUN apk add --no-cache yq && \
    rm -f /var/cache/apk/*

RUN echo -e "\nWebtop for embassyOS is starting ..." > /etc/s6-overlay/s6-rc.d/init-adduser/branding; sed -i '/run_branding() {/,/}/d' /docker-mods
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
RUN chmod a+x /usr/local/bin/docker_entrypoint.sh
