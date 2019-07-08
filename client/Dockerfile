FROM node:12-alpine as build

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY . .

RUN yarn install --production && \
  yarn build

FROM nginx

# Expose the port for the client app
EXPOSE 3000

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
