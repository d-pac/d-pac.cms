# d-pac [![Dependency Status](https://david-dm.org/d-pac/d-pac.cms.png?style=flat)](https://david-dm.org/d-pac/d-pac.cms)[![devDependency Status](https://david-dm.org/d-pac/d-pac.cms/dev-status.png?style=flat)](https://david-dm.org/d-pac/d-pac.cms#info=devDependencies)

> Digitaal platform voor het assessment van competenties

**NOT PRODUCTION READY**

Not by a long shot.

## Installation

```shell
$ npm install && bower install
```

## Testing

A two-step process, first run keystone in a test environment with:

```shell
$ grunt serve --env=tests
```

This will create a separate database, add some data to it and wait for connections.

Once keystone's bootstrapped run (in a separate process):

```shell
$ grunt test --env=tests
```

## Previewing

```shell
$ grunt serve
```

## Publishing the docs

```shell
$ grunt publish
```

### Deployment

```shell
$ grunt deploy
```

[D-PAC  Copyright (C) 2014  d-pac](LICENSE)
[http://www.d-pac.be](http://www.d-pac.be)
