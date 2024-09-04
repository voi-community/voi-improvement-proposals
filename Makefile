all: install

install:
	@go install github.com/conventionalcommit/commitlint@latest
	@go install github.com/gohugoio/hugo@v0.134.0
