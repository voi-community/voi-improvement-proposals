<h1 align="center">
  Voi Improvement Proposals (VIP)
</h1>

### Table of contents

* [1. Overview](#-1-overview)
* [2. Documentation](#-2-documentation)
* [3. Usage](#-3-usage)
  - [3.1. Create A New VIP](#31-create-a-new-vip)
  - [3.2. Open A PR](#32-open-a-pr)
* [4. Development](#-4-development)
  - [4.1. Requirements](#41-requirements)
  - [4.2. Setup](#42-setup)
  - [4.3. Run Locally](#43-run-locally)
* [5. Appendix](#-5-appendix)
  - [5.1. Useful Commands](#51-useful-commands)
* [6. How To Contribute](#-6-how-to-contribute)
* [7. License](#-7-license)

## 🗂️ 1. Overview

This serves as a repository for the Voi ecosystem proposals and a staging point (via GitHub issues) for discussion around said proposals.

<sup>[Back to top ^][table-of-contents]</sup>

## 📚 2. Documentation

The VIP documentation is hosted [here][documentation].

<sup>[Back to top ^][table-of-contents]</sup>

## 🪄 3. Usage

### 3.1. Create A New VIP

> ⚠️ **NOTE:** It is **RECOMMENDED** you read [VIP-00-0000][vip-00-0000] in order to understand the guidelines around VIPs.

When you have decided on the category and the indexing of your proposed VIP, copy the [vip-template.md](./vip-template.md) into the `vips/##` directory (where ## represents the category number referenced in [VIP-00-0000][vip-00-0000]).

Rename your file to the index you have chosen. This **MUST** use the form `####.md` and use padded zeroes if your index is below 1000, e.g. if your index is 27, the file to create will be `0027.md`.

<sup>[Back to top ^][table-of-contents]</sup>

### 3.2. Open A PR

Once you are ready for the VIP to be reviewed and open for discussion, open a PR and ensure the PR title is in the format:

````text
VIP-##-####: Title
````

The first digits (after `VIP-`), will be the number of category, followed by the index of your VIP, and then the capitalized title.

For example: `VIP-03-0200: Fungible Tokens`.

> 💡 TIP: For more information on contributing, see [here][contribute].

<sup>[Back to top ^][table-of-contents]</sup>

## 🛠 4. Development

### 4.1. Requirements

* Install [Go v1.22.6+][go-install]
* Install [Make][make]

### 4.2. Setup

1. A few Go dependencies are required which can simply be installed using:
```shell
make install
```

<sup>[Back to top ^][table-of-contents]</sup>

### 4.3. Run Locally

1. To run a local build, you can simply use:
```shell
make start
```

2. Navigate to [`http://localhost:8080`][localhost].

<sup>[Back to top ^][table-of-contents]</sup>

## 📑 5. Appendix

### 5.1. Useful Commands

| Command        | Description                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------|
| `make install` | Installs the required dependencies.                                                              |
| `make build`   | Builds the docs to the `public/` directory.                                                      |
| `make start`   | Starts a local server, using `hugo`, that is accessible at [`http://localhost:8080`][localhost]. |

<sup>[Back to top ^][table-of-contents]</sup>

## 👏 6. How To Contribute

Please read the [**Contributing Guide**][contribute] to learn about the development process.

<sup>[Back to top ^][table-of-contents]</sup>

## 📄 7. License

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
[vip-00-0000]: ./vips/00/0000.md
