.PHONY: help install-hooks dev build data test test-fixtures test-integration smoke lint fmt fmt-check pages-preview clean hooks-pre-commit hooks-commit-msg hooks-pre-push docker-build docker-push release compose-up compose-down

VERSION := $(shell node -p "require('./package.json').version")

help:
	@printf "%s\n" \
		"make install-hooks     wire .githooks" \
		"make dev               run the Vite dev server" \
		"make build             build Pages-ready docs/" \
		"make data              Mode A no-op" \
		"make test              run unit tests" \
		"make test-fixtures     run deterministic real-data fixtures" \
		"make test-integration  Mode A no-op" \
		"make smoke             build and smoke test docs/" \
		"make lint              run eslint" \
		"make fmt               format files" \
		"make pages-preview     serve docs/ like Pages" \
		"make release           tag v$(VERSION)" \
		"make clean             remove generated local output"

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev:
	npm run dev

build:
	npm run build

data:
	@echo "Mode A: no static data pipeline."

test:
	npm run test

test-fixtures:
	npm run test:fixtures

test-integration:
	@echo "Mode A: no integration suite yet."

smoke:
	npm run smoke

lint:
	npm run lint
	npm run fmt:check

fmt:
	npm run fmt

fmt-check:
	npm run fmt:check

pages-preview:
	npm run build
	node scripts/serve-static.mjs docs 4173

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push

docker-build:
	@echo "Mode A: Docker image omitted."

docker-push:
	@echo "Mode A: Docker image omitted."

compose-up:
	@echo "Mode A: Docker Compose omitted."

compose-down:
	@echo "Mode A: Docker Compose omitted."

release:
	git tag "v$(VERSION)"
	git push origin "v$(VERSION)"

clean:
	rm -rf coverage .vite node_modules/.tmp
