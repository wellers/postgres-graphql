FROM node:20.11.0
WORKDIR /app
EXPOSE 80

COPY .eslintrc.json .eslintrc.json

COPY .yarn /app/.yarn

RUN corepack enable && yarn set version 3.1.1

# yarn install in a way that allows caching
COPY package.json /app/package.json

COPY yarn.lock /app/yarn.lock
COPY .yarnrc.yml /app/.yarnrc.yml
RUN yarn install

COPY lib /app/lib
COPY tsconfig.json tsconfig.json

CMD ["yarn", "start"]