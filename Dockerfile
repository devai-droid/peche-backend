# dev
FROM node:20 AS development
RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY --chown=node:node pnpm-lock.yaml ./
RUN pnpm fetch --prod

COPY --chown=node:node . .
RUN CI=true pnpm install

USER node

# build
FROM node:20 AS build
RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY --chown=node:node pnpm-lock.yaml ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

RUN pnpm build

ENV NODE_ENV=production

#RUN pnpm install --prod
RUN pnpm install --prod --config.confirmModulesPurge=false

USER node

# production
FROM node:20-alpine AS production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
