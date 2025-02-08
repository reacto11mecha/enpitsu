# enpitsu

## dev

```sh
pnpm install
cp .env.example .env
pnpm dev:admin
pnpm dev:exam
```

## manual build

```sh
cd apps/admin
pnpm build

cd apps/exam-web
pnpm build
```

```sh
cd apps/admin
pnpm start

cd apps/exam-web
pnpm preview
```

## docker

```
cp docker-compose.yml ../somewhere-else/docker-compose.yml
cp .env.docker.example ../somewhere-else/.env
docker compose up -d
```
