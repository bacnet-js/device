#
# BUILD STAGE
#

FROM alpine AS build-env
RUN apk add --no-cache build-base curl git linux-headers
WORKDIR /app
RUN git clone https://github.com/bacnet-stack/bacnet-stack.git --depth 1 --branch bacnet-stack-1.4.1
RUN cd bacnet-stack && make clean all

#
# RUN STAGE
#

FROM alpine
COPY --from=build-env /app/bacnet-stack /app/bacnet-stack
WORKDIR /app/bacnet-stack/bin
# at last run the program
# CMD ["/app/hello"]
