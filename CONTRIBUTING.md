# Contributing guide

### Table of contents

* [1. Commit messages](#1-commit-messages)
  * [1.1. Type](#11-type)
  * [1.2. Scope](#12-scope)
  * [1.3. Subject](#13-subject)
* [2. Pull requests](#2-pull-requests)
  * [2.1. Branching strategy](#21-branching-strategy)
  * [2.2. Merge to main](#22-merge-to-main)

## 1. Commit messages

Commit messages lean heavily towards the convention set out by [conventional commits][conventional-commits].

Each commit message must be in the format that includes a **type**, an optional **scope** and a **subject**:
```
type(scope?): subject  #scope is optional
```

Limit the whole message to 72 characters or less!

Example:

```
feat(vip-03-0027): drop network fees
```

<sup>[Back to top ^](#table-of-contents)</sup>

### 1.1. Type

Must be one of the following:

* **build**: Changes that affect the build system or external dependencies.
* **chore**: Changes that don't really fall under any other type.
* **ci**: Changes to the CI configuration files and scripts.
* **docs**: Documentation only changes.
* **feat**: A new feature.
* **fix**: A bug fix.
* **perf**: A code change that improves performance.
* **refactor**: A code change that neither fixes a bug nor adds a feature.
* **revert**: Revert a previous commit.

<sup>[Back to top ^](#table-of-contents)</sup>

### 1.2. Scope

A scope may be provided to a commit's type, to provide additional contextual information and is contained within a parenthesis

<sup>[Back to top ^](#table-of-contents)</sup>

### 1.3. Subject

The subject contains a succinct description of the change:

* use the present tense ("Add feature" not "Added feature")
* use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* don't capitalise the first letter
* don't use a fullstop (.) at the end. <- Not this

<sup>[Back to top ^](#table-of-contents)</sup>

## 2. Pull requests

### 2.1. Branching strategy

This repo uses a [trunk-based][trunk-based] development workflow. There is one permanent branch, the `main` branch, which contains stable code and all releases are based off of any commits to this branch.

In order to make updates, a feature branch is made from the `main` branch and when it is ready to be merged, it can be brought back into the `main` branch which trigger a release (if necessary).

<sup>[Back to top ^](#table-of-contents)</sup>

### 2.2. Merge to main

1. Create a branch from the `main` branch and use the convention: `vip-<category>-<index>-title`, e.g. `vip-03-0200-fungible-tokens`.
2. Once the code is ready to be merged into `main`, open a pull request.
> ⚠️ **NOTE:** The pull request title must be in the format: `VIP-##-####: Title`, e.g. `VIP-03-0200: Fungible Tokens`. Ensure the title is capitalized.
3. To merge the PR, use the "Squash and merge" option. This is to keep the commit history clean and keep the commits on `main` with a 1:1 ratio with previous PRs.

<sup>[Back to top ^](#table-of-contents)</sup>

[conventional-commits]: https://www.conventionalcommits.org
[trunk-based]: https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development
