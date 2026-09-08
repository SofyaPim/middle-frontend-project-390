APP_URL ?= http://localhost:5173

install:
	npm ci

build:
	npm run build

test:
	npx playwright test
start:
	pnpm build
	npx @hexlet/frontend-flight-booking-server start -s dist
