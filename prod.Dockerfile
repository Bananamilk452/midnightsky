FROM node:22-alpine

WORKDIR /app
COPY . /app/

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

RUN pnpm build
CMD ["pnpm", "run", "migrateandstart"]