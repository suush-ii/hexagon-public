FROM node:lts-alpine AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json package-lock.json /temp/dev/
RUN cd /temp/dev && npm install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json package-lock.json /temp/prod/
RUN cd /temp/prod && npm install --frozen-lockfile --omit=dev

FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN npm run build

FROM base AS release
COPY ./drizzle ./drizzle
COPY ./meshconvert ./meshconvert
COPY ./rbxmconvert ./rbxmconvert
COPY --from=install /temp/prod/node_modules ./node_modules
COPY --from=build /usr/src/app/build/ ./
COPY --from=build /usr/src/app/package.json ./

EXPOSE 3000/tcp
CMD [ "node", "index.js" ]