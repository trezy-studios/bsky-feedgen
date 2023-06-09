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
COPY packages/feeds/package.json /app/packages/feeds/
COPY packages/koa-api/package.json /app/packages/koa-api/
COPY packages/lib/package.json /app/packages/lib/
COPY packages/api/package.json /app/packages/api/
RUN yarn workspaces focus @trezystudios/bsky-api

FROM dependencies AS application

# Load application and local dependencies
COPY packages/common/ /app/packages/common/
COPY packages/feeds/ /app/packages/feeds/
COPY packages/koa-api/ /app/packages/koa-api/
COPY packages/lib/ /app/packages/lib/
COPY packages/api/ /app/packages/api/

# Build the common lib
RUN yarn build:common

# Start the application
CMD [ "yarn", "start:api" ]
