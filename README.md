# d-pac

[![Dependency Status](https://david-dm.org/d-pac/d-pac.cms.png?style=flat)](https://david-dm.org/d-pac/d-pac.cms)
[![devDependency Status](https://david-dm.org/d-pac/d-pac.cms/dev-status.png?style=flat)](https://david-dm.org/d-pac/d-pac.cms#info=devDependencies)

> Digital platform for assessment of competences

**NOT PRODUCTION READY**

Not by a long shot.

Please visit [http://www.d-pac.be](http://www.d-pac.be) for more information.

If you want to contribute you can [start here](http://d-pac.github.io/d-pac.docs/)

## Installation

You need [node](https://nodejs.org/en/) and [mongodb](https://www.mongodb.org/), then go to the directory you cloned this repo to and run:

```sh
$ npm install
```

## Setup

You need to provide the system with some configuration details before it can run.

All mandatory settings are listed in [`EXAMPLE.env`](/d-pac/d-pac.cms/blob/master/EXAMPLE.env)
Just copy the file, rename it to `.env` and fill in all necessary details.

You'll have to [setup an account with cloudinary](http://keystonejs.com/docs/configuration/#services-cloudinary) and [mandrill](http://keystonejs.com/docs/configuration/#services-mandrill), both provide free plans.

## Environment specific settings

If you want to run this in various environments you can override the base environment settings by providing environment specific `.env` files:

```
# file: .env.staging
MONGO_URI=mongodb://localhost/d-pac-staging
PORT=3030
```
```
# file: .env.production
debug=none
```

## Starting the application

Run the application as any node app

```
$ node app/server.js
```

Or in a specific environment (by default a "development" environment is assumed)

```
$ NODE_ENV=staging node app/server.js
```

Obviously you can use process managers too e.g. [nodemon](https://www.npmjs.com/package/nodemon) or [pm2](https://www.npmjs.com/package/pm2)


[D-PAC  Copyright (C) 2014-2016  d-pac](LICENSE)
[http://www.d-pac.be](http://www.d-pac.be)
