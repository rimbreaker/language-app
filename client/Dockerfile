FROM node:alpine as build
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/build .
CMD ["nginx", "-g", "daemon off;"]
