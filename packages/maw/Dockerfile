FROM node:20-alpine AS base

WORKDIR /app

FROM base AS dependencies

# Node requirements
COPY package.json /app/

# Yarn requirements
COPY yarn.lock .yarnrc.yml /app/
COPY .yarn /app/.yarn

# Local dependencies
COPY packages/common/package.json /app/packages/common/
COPY packages/koa-api/package.json /app/packages/koa-api/
COPY packages/lib/package.json /app/packages/lib/
COPY packages/maw/package.json /app/packages/maw/
RUN yarn workspaces focus @trezystudios/bsky-maw

FROM dependencies AS application

# Load application and local dependencies
COPY packages/common/ /app/packages/common/
COPY packages/koa-api/ /app/packages/koa-api/
COPY packages/lib/ /app/packages/lib/
COPY packages/maw/ /app/packages/maw/

# Build the common lib
RUN yarn build:common

# Start the application
CMD [ "yarn", "start:maw" ]
