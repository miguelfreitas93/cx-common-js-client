FROM node:latest

WORKDIR /opt/cx-common-js-client

COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
COPY src ./src
COPY tests ./tests
COPY README.md ./README.md

RUN npm install && \
    npm run build && \
    npm run test && \
    rm -rf src && \
    rm -rf tests

CMD ["node"]