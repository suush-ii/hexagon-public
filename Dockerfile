FROM oven/bun:alpine AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json package-lock.json /temp/dev/
COPY ./meshconvert /temp/dev/meshconvert
COPY ./rbxmconvert /temp/dev/rbxmconvert
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY ./meshconvert /temp/prod/meshconvert
COPY ./rbxmconvert /temp/prod/rbxmconvert
COPY package.json package-lock.json /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --omit=dev

FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun run build

FROM base AS release
COPY ./drizzle ./drizzle
COPY ./meshconvert ./meshconvert
COPY ./rbxmconvert ./rbxmconvert
COPY --from=install /temp/prod/node_modules ./node_modules
COPY --from=build /usr/src/app/build/ ./
COPY --from=build /usr/src/app/package.json ./

EXPOSE 3000/tcp
CMD [ "bun", "index.js" ]