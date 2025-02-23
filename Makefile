.PHONY: build

all: install

build:
	hugo

install:
	git submodule update --init --recursive
	@go install github.com/conventionalcommit/commitlint@latest
	@go install -tags extended github.com/gohugoio/hugo@v0.134.0

start:
	hugo server --buildDrafts --port 8080
