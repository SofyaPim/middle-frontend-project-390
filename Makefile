APP_URL ?= http://localhost:5173

install:
	npm ci

build:
	npm run build

test:
	npx playwright test
start:
	PORT=$${PORT:-8080} ./node_modules/.bin/frontend-flight-booking-server start -s dist
# npx @hexlet/frontend-flight-booking-server start -s dist