# Introduction

The D-pac REST API attempts to follow best practices as laid out by [Interagent's HTTP API Design Guide][API Design Guide], however since the REST API runs on a KeystoneJS (i.e. Express) HTTP server, some principles are quite hard to adhere to, without jumping through hoops.

## Requests

### Parameters

All request parameters can be supplied either as query string arguments or as json body.

E.g.

```
POST //api/me/session?email=john.doe@example.com&password=foo&password_confirm=foo
```
Or
```
POST //api/me/session
{
	"email" : "john.doe@example.com",
	"password" : "foo",
	"password_confirm" : "foo" 
}

```

### Results

All successful requests return a status code of `200 OK` or `204 No Content`, as documented for each method.

## Errors

All error objects have a similar (base) structure:

```json
{
  "code": "404",
  "status": "404",
  "name": "Http404Error",
  "message": "Not Found"
}
```

(All subsequent quotes taken from [wikipedia](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes))

### 400 Bad Request

> The request was a valid request, but the server is refusing to respond to it. Unlike a 401 Unauthorized response, authenticating will make no difference.

These errors include failure to comply due to a missing parameter.

### 401 Unauthorized

> Authentication is required and has failed or has not yet been provided.

### 404 Not Found

> The requested resource could not be found but may be available again in the future. Subsequent requests by the client are permissible.

### 405 Method Not Allowed

> A request was made of a resource using a request method not supported by that resource; for example, using GET on a form which requires data to be presented via POST, or using PUT on a read-only resource.

### 422 Unprocessable Entity

> The request was well-formed but was unable to be followed due to semantic errors.

These errors occur when an operation on an entity fails, not due to malformed syntax, but because of a missing operator or operand, incorrect data type, et cetera.
422 errors provide an extra field `exaplanation` with a human readable explanation on what went wrong.

E.g.:

```json
{
  "code": "422",
  "status": "422",
  "name": "Http422Error",
  "message": "Validation failed",
  "explanation": [
  	"Passwords must match"
  ]
}
```

### 500 Internal Server Error

> A generic error message, given when an unexpected condition was encountered and no other, more specific message is suitable.


[API Design Guide]: https://github.com/interagent/http-api-design

# Methods
