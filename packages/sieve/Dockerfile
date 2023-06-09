FROM node:20-alpine AS base

WORKDIR /app

FROM base AS dependencies

# Node requirements
COPY package.json /app/

# Yarn requirements
COPY yarn.lock .yarnrc.yml /app/
COPY .yarn /app/.yarn

# Local dependencies
COPY packages/lib/package.json /app/packages/lib/
COPY packages/common/package.json /app/packages/common/
COPY packages/sieve/package.json /app/packages/sieve/
RUN yarn workspaces focus @trezystudios/bsky-sieve

FROM dependencies AS application

# Load application and local dependencies
COPY packages/lib/ /app/packages/lib/
COPY packages/common/ /app/packages/common/
COPY packages/sieve/ /app/packages/sieve/

# Build the common lib
RUN yarn build:common

# Start the application
CMD [ "yarn", "start:sieve" ]
