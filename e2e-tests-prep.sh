

docker network create bacnet-js

docker run -d --platform linux/amd64 --network bacnet-js --name bacnet-stack-runner ghcr.io/bacnet-js/bacnet-stack-runner:f2894b2a0ede095e1fe19200c0f1cc137c5e0e48
