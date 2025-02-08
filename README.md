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
pnpm build:admin

pnpm build:exam
```

```sh
cd apps/admin
pnpm start

cd apps/exam-web
pnpm preview
```

## docker

```
cp docker-compose.yml ../somewhere-else/docker-compose.yaml
cp .env.docker.example ../somewhere-else/.env
docker compose up -d
```
