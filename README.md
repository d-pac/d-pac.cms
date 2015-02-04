# d-pac [![Dependency Status](https://david-dm.org/d-pac/d-pac.cms.png?style=flat)](https://david-dm.org/d-pac/d-pac.cms)[![devDependency Status](https://david-dm.org/d-pac/d-pac.cms/dev-status.png?style=flat)](https://david-dm.org/d-pac/d-pac.cms#info=devDependencies)

> Digitaal platform voor het assessment van competenties

**NOT PRODUCTION READY**

Not by a long shot.

## Getting started

### Installation

```shell
$ npm install
```

### Configuration

d-pac.cms uses .env files to configure your environment. At the very least a single `.env` file should be present, but it's advisable to use separate files for each environment. The `.env` files are excluded from git, since they contain sensitive information, but a  `.EXAMPLE.env` file is provided which contains sample settings. You can copy this file and rename it to `.env` and modify the settings as needed.

#### Settings

E.g.

```sh
CLOUDINARY_URL=cloudinary://aaaaaaaaaaaaaaaaaaaaaaaaaaaa@keystone-demo
MONGO_URI=mongodb://localhost/d-pac-tool
PORT = 3020
LOGGER = [:date] - :remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
DEBUG = dpac:*
CORS_ALLOWED_ORIGINS = http://localhost:9000
CORS_ALLOWED_METHODS = GET,POST,PATCH,OPTIONS,DELETE,PUT
CORS_ALLOWED_HEADERS = X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-Type, Date, Request-UUID, Accept-Encoding
CORS_EXPOSED_HEADERS = Request-UUID
CORS_DISABLED = true
```

A large number of settings are necessary to allow a proper functioning of the underlying KeystoneJS framework, see [Keystone demo documentation](https://github.com/JedWatson/keystone-demo) for an explanation of `CLOUDINARY_URL`, `MANDRILL_APIKEY`, `MANDRILL_USERNAME`, `EMBEDLY_APIKEY`, `COOKIE_SECRET`, `MONGO_URI`, `GA_DOMAIN`, `GA_PROPERTY`, `PORT`

However, a number of custom settings are optionally set as well:

* `LOGGER`: Configures the [Morgan logger instance, see documentation](https://www.npmjs.com/package/morgan) for logger formats.
* `DEBUG`: Configures the [debug instance, see documentation](https://www.npmjs.com/package/debug) on usage.
* `CORS_DISABLED`: Enables/disables [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) for your d-pac.csm instance.
* `CORS_ALLOWED_ORIGINS`: Provide a **space-delimited** list of URL's that are allowed to execute CORS requests.
* `CORS_ALLOWED_METHODS`: Restrict which methods are allowed in CORS requests.
* `CORS_ALLOWED_HEADERS`: Restrict which headers are allowed in CORS requests.
* `CORS_EXPOSED_HEADERS`: Restrict which headers will be exposed in CORS request responses.

#### Multiple Environments

As mentioned before generally it's a good idea to have a `.env` file for each environment d-pac.cms will be running on.
Set all default options in your plain `.env file` and provide environment-specific settings in the various other env files.

E.g.

```sh
# file: .env
CLOUDINARY_URL=cloudinary://aaaaaaaaaaaaaaaaaaaaaaaaaaaa@keystone-demo
PORT = 3020
```
```sh
# file: .env.staging
MONGO_URI=mongodb://localhost/d-pac-tool-staging
```
```sh
# file: .env.production
MONGO_URI=mongodb://localhost/d-pac-tool
```

Use the `NODE_ENV` environment variable to define which settings will be used. This can be done in a number of ways, either:

1. Export the `NODE_ENV` variable in your `.bashrc` (or `.profile` or...) file, e.g.

  ```sh
  # file: .bashrc (or similar)
  export NODE_ENV=production
  ```
  
2. Set it on the CLI when starting d-pac.cms

  ```sh
  $ NODE_ENV=production node server.js
  ```
  
3. Pass it as a flag to grunt, when using grunt to run the various tasks:

  ```sh
  $ grunt deploy --env=staging
  ```
  
### Deployment

D-pac uses [flightplan](https://github.com/pstadler/flightplan) to separate deployment automation from other automated tasks, see documentation for a detailed explanation.

#### Configuration

Flight manifests are automatically loaded from a `flights` directory. A `flights/example.js` file is provided to show how to set it up. You need a flight manifest file for each deployment target.

E.g. let's say we have a "staging" and "production" server we want to deploy to, then the `flights` directory needs to contain a file for each: `staging.js` and `production.js`.

#### Usage

```shell
$ fly staging
```

Will do a full deployment to whatever server you configured in `staging.js`.

Sub-targets:

```shell
$ fly qa:staging
```

Runs some quality assurance tools


### Contributing

#### Testing

TBD

#### Previewing

```shell
$ grunt serve
```

#### Publishing the docs

```shell
$ grunt publish
```


[D-PAC  Copyright (C) 2014  d-pac](LICENSE)
[http://www.d-pac.be](http://www.d-pac.be)
