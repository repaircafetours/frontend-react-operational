FROM node:20.9.0-alpine

WORKDIR /front

COPY . .

RUN npm install -g bun

RUN bun install
RUN bun run build

ARG PORT=3000
ENV PORT=${PORT}

CMD ["bun", "start"]

EXPOSE ${PORT}