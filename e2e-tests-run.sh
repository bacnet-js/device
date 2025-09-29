
docker run \
  --rm \
  --volume ./:/app \
  --workdir /app \
  --network bacnet-js \
  node:20-alpine \
  node --enable-source-maps --test dist
