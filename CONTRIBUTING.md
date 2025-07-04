
# How to contribute to @bacnet-js/device

## Standards

We try to adhere to the following conventions:

- [semver](https://semver.org/)
- [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/)
- [conventional changelog](https://github.com/conventional-changelog/conventional-changelog)

## Cocogitto

This project uses [cocogitto](https://github.com/cocogitto/cocogitto) to manage
commit messages, release tags and generate the changelog automatically.

### Initialize cocogitto

```sh
cog install-hook --all
```

### Bump version and release

```sh
cog bump --auto
```
