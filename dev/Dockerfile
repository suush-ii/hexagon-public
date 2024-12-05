FROM node:lts-alpine AS base
WORKDIR /usr/src/app

COPY  package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY ./dev/init.sh /docker-entrypoint-initdb.d

COPY . .

CMD ["npm", "run", "dev", "--host", "0.0.0.0"]