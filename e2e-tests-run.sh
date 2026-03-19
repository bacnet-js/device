
docker run \
  --rm \
  --volume ./:/app \
  --workdir /app \
  --network bacnet-js \
  "node:$(node -e "process.stdout.write(process.version.slice(1,3))")-alpine" \
  node --enable-source-maps --test dist
