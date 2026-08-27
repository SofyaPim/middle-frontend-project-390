APP_URL ?= http://localhost:5173

install:
	npm ci

build:
	npm run build

test:
	npx playwright test