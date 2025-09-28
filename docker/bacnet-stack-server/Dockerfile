
FROM node:20-alpine AS build-env
RUN apk add --no-cache build-base curl git linux-headers
WORKDIR /
RUN git clone https://github.com/bacnet-stack/bacnet-stack.git --depth 1 --branch bacnet-stack-1.4.1
RUN cd bacnet-stack && make clean all

FROM node:20-alpine
COPY --from=build-env /bacnet-stack /bacnet-stack
WORKDIR /bacnet-stack
COPY ./server.js /server.js
CMD ["node", "/server.js"]
