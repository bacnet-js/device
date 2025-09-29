

docker network create bacnet-js

docker run -d --platform linux/amd64 --network bacnet-js --name bacnet-stack-server bacnet-stack-server
