# REST API

## Authentication

### Get session

Retrieves the session of the user.

#### Request

```shell
GET /api/me/session
```

#### Response, session already exists:

```shell
HTTP/1.1 200 Ok
Access-Control-Allow-Origin: <ORIGIN>
Access-Control-Allow-Credentials: true
Set-Cookie: keystone.uid=<TOKEN>; Path=/; HttpOnly
Set-Cookie: keystone.sid=<TOKEN>; Path=/; HttpOnly
```
```json
{
    "id": "53a984cca87b4b7d57a99858",
    "email": "john.doe@example.com",
    "name": {
        "first": "John",
        "last": "Doe"
    },
    "_csrf": "<CSFR TOKEN>",
}
```

#### Response, session doesn't exist:

```shell
HTTP/1.1 401 Unauthorized
```
```json
{
    "code": "401",
    "status": "401",
    "name": "Http401Error",
    "message": "Unauthorized",
    "reason": {
          "name"    : "AuthenticationError",
          "message" : "No session exists."
    }
}
```

### Signin

#### Request

(Re-)creates a session.

```shell
POST /api/me/session
```
```json
{
    "email": "john.doe@example.com",
    "password": "42"
}
```

* `email` [Required]
* `password` [Required]

#### Response: Success

```shell
HTTP/1.1 200 OK
Access-Control-Allow-Origin: <ORIGIN>
Access-Control-Allow-Credentials: true
Set-Cookie: keystone.uid=<TOKEN>; Path=/; HttpOnly
Set-Cookie: keystone.sid=<TOKEN>; Path=/; HttpOnly
```
```json
{
    "id": "53a984cca87b4b7d57a99858",
    "email": "john.doe@example.com",
    "name": {
        "first": "John",
        "last": "Doe"
    },
    "_csrf": "<CSRF TOKEN>"
}
```

#### Response: Failure

```shell
HTTP/1.1 401 Unauthorized
```
```json
{
    "code": "401",
    "status": "401",
    "name": "Http401Error",
    "message": "Unauthorized",
    "reason": {
          "name"    : "AuthenticationError",
          "message" : "Bad credentials."
    }
}
```

### Signout

#### Request

Destroys the current session.

```shell
DELETE /api/me/session
```

#### Response

```shell
HTTP/1.1 204 No Content
```

## Logged in user

### Retrieve

#### Request

```shell
GET /api/me/account
```

#### Response

```shell
HTTP/1.1 200 OK
```
```json
{
  "id": "53a984cca87b4b7d57a99858",
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
PUT /api/me/account
```
```json
{
  "email": "changedemail@example.com"
  "name": {
    "first": "John",
    "last": "Doe"
  },
  "password": "HolyShizzle!"
  "password_confirm": "HolyShizzle!"
}
```

* `email` **[Required]**
* `name.first` **[Required]**
* `name.last` **[Required]**
* `password` **[Required]**
* `password_confirm` **[Required]**

#### Response

```shell
HTTP/1.1 200 OK
```
```json
{
  "id": "53a984cca87b4b7d57a99858",
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
PATCH /api/me/account
```
```json
{
  "email": "changedemail@example.com"
}
```

* `email` **[Optional]**
* `name.first` **[optional]**
* `name.last` **[Optional]**
* `password` **[Optional]**
* `password_confirm` **[Optional/Required]** When `password` is provided this field is **[Required]**

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
  "id": "53a984cca87b4b7d57a99858",
  "email": "changedemail@example.com",
  "name": {
    "first": "John",
    "last": "Doe"
  }
}
```

## Mementos

### Retrieve current memento(s) for the logged in user

#### Request

```shell
GET /api/me/mementos
```

#### Response: found

```shell
HTTP/1.1 200 OK
```
```json
[{

}]
```

#### Response: not found

```shell
HTTP/1.1 200 OK
```
```json
[]
```

### Create a memento for the logged in user

#### Request

```shell
POST /api/me/mementos
```
```json
{
  "assessment" : "53a984cca87b4b7d57a99858"
}
```

* `assessment` **[Required]**

#### Response

```shell
HTTP/1.1 200 OK
```
```json
{

}
```

## Comparisons

### Retrieve comparison

#### Request

```shell
GET /api/comparisons/:id
```

#### Response

```json
{
    "_id": "542e5a07635e7121e9d3c68c",
    "_rid": 16,
    "assessor": "542bf92a03a305000015720f",
    "assessment": "5423f89677177065a0887ba1",
    "phase": "5423f87677177065a0887b99",
    "timelogs": [],
    "comparativeFeedback": "Nou!",
}
```

### Partial Update

```shell
PATCH /api/comparisons/:id
```
```json
{
  "comparativeFeedback": "Lorem ipsum dolor sit amet."
}
```

* `selected` {Representation._id} **[Optional]**
* `phase` {Phase._id} **[Optional]**
* `comparativeFeedback` **[Optional]**

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

### 403 Forbidden

> The request was a valid request, but the server is refusing to respond to it. Unlike a 401 Unauthorized response, authenticating will make no difference.

These errors include failure to comply due to a missing parameter.

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
