# Development log

* 2014-08-13:
    * Do not use original keystone initAPI middleware, since its error handler uses status 500 for everything
    * Do not use `errors.errorHandler` since it can't cope with express being an indirect dependency, i.e. relies on it as a direct dependency. See https://github.com/bodenr/errors/issues/6
* 2014-06-24: Removed keystone-rest, since the new API isn't backwards compatible and makes things worse
