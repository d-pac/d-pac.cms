# REST API

## Logged in user

### Retrieve

#### Request

```shell
GET /api/users/me
```

#### Response

```shell
HTTP/1.1 200 OK
```
```json
{
  "_id": "53a984cca87b4b7d57a99858",
  "email": "john.doe@example.com",
  "name": {
    "first": "John",
    "last": "Doe"
  }
}
```

### Full Update

#### Request

```shell
PUT /api/users/me
```
```json
{
  "email": "changedemail@example.com"
  "name": {
    "first": "John",
    "last": "Doe"
  },
  "password": "$2a$10$oHOoaOUZG9tuXpHlsTY9DOH.3Swtg4YZQjBXk5U1wblPsNVyNcz6i"
}
```

#### Response

```shell
HTTP/1.1 200 OK
```
```json
{
  "_id": "53a984cca87b4b7d57a99858",
  "email": "changedemail@example.com",
  "name": {
    "first": "John",
    "last": "Doe"
  }
}
```

### Partial Update

#### Request

```shell
PATCH /api/users/me
```
```json
{
  "email": "changedemail@example.com"
}
```

N.B.: though `password` is never returned as a user object, it can be updated too. It does however need an additional value: `password_confirm`.

E.g.:

```json
{
    "password": "HolyShizzle!"
    "password_confirm": "HolyShizzle!"
}
```

#### Response

```shell
HTTP/1.1 200 OK
```
```json
{
  "_id": "53a984cca87b4b7d57a99858",
  "email": "changedemail@example.com",
  "name": {
    "first": "John",
    "last": "Doe"
  }
}
```


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

(Quotes taken from [wikipedia](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes))
Depending on the requested operation and largely based on the guidelines as laid out in the [HTTP API Design Guide](https://github.com/interagent/http-api-design), following status codes are returned by the API methods:

### 401 Unauthorized

> Authentication is required and has failed or has not yet been provided.

### 404 Not Found

> The requested resource could not be found but may be available again in the future. Subsequent requests by the client are permissible.

### 405 Method Not Allowed

> A request was made of a resource using a request method not supported by that resource; for example, using GET on a form which requires data to be presented via POST, or using PUT on a read-only resource.

### 422 Unprocessable Entity

> The request was well-formed but was unable to be followed due to semantic errors.

These errors occur when an operation on an entity fails, not due to malformed syntax, but because of a missing operator or operand, incorrect data type, et cetera.
422 errors provide an extra field `reason` with a machine and human readable explanation on what went wrong.

E.g.:

```json
{
  "code": "422",
  "status": "422",
  "name": "Http422Error",
  "message": "Unprocessable Entity",
  "reason": {
    "message": "Validation failed",
    "name": "ValidationError",
    "errors": {
      "password": {
        "name": "ValidatorError",
        "path": "password",
        "message": "Passwords must match",
        "type": "required"
      }
    }
  }
}
```

### 500 Internal Server Error

> A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
