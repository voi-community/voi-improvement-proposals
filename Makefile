.PHONY: build

all: install

build:
	hugo

install:
	@go install github.com/conventionalcommit/commitlint@latest
	@go install github.com/gohugoio/hugo@v0.134.0

start:
	hugo server --buildDrafts --port 8080
