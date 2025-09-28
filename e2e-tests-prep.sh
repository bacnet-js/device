
cd docker/bacnet-stack-server
docker build -t bacnet-stack-server --platform linux/amd64 .
cd ../..

docker network create bacnet-js

docker run -d --platform linux/amd64 --network bacnet-js --name bacnet-stack-server bacnet-stack-server
