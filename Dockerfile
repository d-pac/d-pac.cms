
FROM node:6.9.5
MAINTAINER Camille Reynders

ENV DOCKERIZE_VERSION 0.2.0
ENV YARN_VERSION 0.19.1
ENV PATH=/home/dpac/node_modules/.bin:/usr/bin:/usr/local/bin:$PATH

ADD .ssh /root/.ssh
RUN ssh-keyscan -t rsa bitbucket.org >> /root/.ssh/known_hosts

# Solves "Unable to locally verify the issuer's authority." with github.com
# See https://bugs.alpinelinux.org/issues/5376
# Also installs other necessary dependencies
RUN apt-get update && apt-get install apt-transport-https \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update && apt-get install yarn \
    && wget https://github.com/jwilder/dockerize/releases/download/v$DOCKERIZE_VERSION/dockerize-linux-amd64-v$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-v$DOCKERIZE_VERSION.tar.gz

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp \
    && yarn config set color false \
    && yarn config set loglevel verbose \
    && yarn install --production \
    && yarn cache clean

RUN mkdir -p /home/dpac && mv /tmp/node_modules /home/dpac/
RUN mv /tmp/package.json /home/dpac/package.json
RUN mv /tmp/yarn.lock /home/dpac/yarn.lock

ADD app /home/dpac/app/
WORKDIR /home/dpac
ENTRYPOINT ["yarn", "start"]
