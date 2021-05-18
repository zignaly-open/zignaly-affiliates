docker run --rm -p 65432:5432 --name zignaly-test-postgres -e POSTGRES_PASSWORD=xfuturum -d postgres
NODE_ENV=test npx mocha --es-module-specifier-resolution=node --no-deprecation --no-timeouts --exit test/flows.js
docker ps | grep zignaly-test-postgres | awk '{print $1}' | xargs docker stop
