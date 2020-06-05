## Launch Strapi dev env

`docker-compose -f docker-compose.dev.yml up -d`

`docker run --entrypoint '/bin/sh' --rm --name strapi-develop --network strapi_default -d -v $(pwd):/src -p 1337:1337 -p 4000:4000 node:12-alpine -c "tail -f /dev/null"`

window 1:

```bash
docker exec -it strapi-develop /bin/sh
apk update && apk upgrade && apk add build-base gcc autoconf automake zlib-dev libpng-dev nasm bash && bash
yarn setup
cd /src/packages/strapi-admin; yarn develop -- --host 0.0.0.0
```

window2: 

```bash
docker exec -it strapi-develop /bin/bash
cd /src/examples/getstarted
modify config/databases so that mongo's host is "strapi_mongo_1" from the docker compose file
yarn build
DB=mongo yarn develop
```