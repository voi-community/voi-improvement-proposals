<h1 align="center">
  Voi Improvement Proposals (VIP)
</h1>

### Table of contents

* [1. Overview](#-1-overview)
* [2. Documentation](#-2-documentation)
* [3. Development](#-3-development)
  - [3.1. Requirements](#31-requirements)
  - [3.2. Setup](#32-setup)
  - [3.3. Run Locally](#33-run-locally)
* [4. Appendix](#-4-appendix)
  - [4.1. Useful Commands](#41-useful-commands)
* [5. How To Contribute](#-5-how-to-contribute)
* [6. License](#-6-license)

## 🗂️ 1. Overview

Coming soon...

<sup>[Back to top ^][table-of-contents]</sup>

## 📚 2. Documentation

The VIP documentation is hosted [here][documentation].

<sup>[Back to top ^][table-of-contents]</sup>

## 🛠 3. Development

### 3.1. Requirements

* Install [Go v1.22.6+][go-install]
* Install [Make][make]

### 3.2. Setup

1. A few Go dependencies are required which can simply be installed using:
```shell
make install
```

<sup>[Back to top ^][table-of-contents]</sup>

### 3.3. Run Locally

1. To run a local build, you can simply use:
```shell
make start
```

2. Navigate to [`http://localhost:8080`][localhost].

<sup>[Back to top ^][table-of-contents]</sup>

## 📑 4. Appendix

### 4.1. Useful Commands

| Command        | Description                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------|
| `make install` | Installs the required dependencies.                                                              |
| `make build`   | Builds the docs to the `public/` directory.                                                      |
| `make start`   | Starts a local server, using `hugo`, that is accessible at [`http://localhost:8080`][localhost]. |

<sup>[Back to top ^][table-of-contents]</sup>

## 👏 5. How To Contribute

Please read the [**Contributing Guide**][contribute] to learn about the development process.

<sup>[Back to top ^][table-of-contents]</sup>

## 📄 6. License

Please refer to the [LICENSE][license] file.

<sup>[Back to top ^][table-of-contents]</sup>

<!-- Links -->
[contribute]: ./CONTRIBUTING.md
[documentation]: https://vip.voi.network
[go-install]: https://go.dev/doc/install
[license]: ./LICENSE
[localhost]: http://localhost:8080
[make]: https://www.gnu.org/software/make/
[table-of-contents]: #table-of-contents
