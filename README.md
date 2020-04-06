# node-module-typescript-boilerplate

A boilerplate to develop node-modules in typescript, integrated with basic tools for linting, testing, and config.

- [Typescript 3.8](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/) for testing and code coverage
- [ESLint](https://github.com/eslint/eslint), [Prettier](https://prettier.io/) for linting and code style
- Support loading module config from `.{moduleName}rc.{json,yml,js}` file (like .eslintrc, .prettierrc)
- Sample of loading properties from package.json of parent project
- NPM scripts for lints, tests
- Basic example of typescript code and unit tests

## Requirements

- node.js `>= 8.9.0`
- npm `>= 5.5.1`

## Usage

### Setup new repository using template

- Use this [template link](https://github.com/jsynowiec/node-typescript-boilerplate/generate) to create new repository

### Or, setup by cloning repository

```bash
git clone https://github.com/prth/node-module-typescript-boilerplate.git
cd node-module-typescript-boilerplate
npm install
```

- Delete `.git` folder and initialize your own git project
- Update package.json, set the `name` property value

## Scripts

```bash
# Run tests
$ npm test
```

```bash
# Run lint scripts
$ npm run lint:test
$ npm run lint:fix
```

```bash
# Build
$ npm run build
```
