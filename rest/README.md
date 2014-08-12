# REST API

## Logged in user

### Retrieve

#### Request

```shell
GET /api/me
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
PUT /api/me
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
PATCH /api/me
```
```json
{
  "email": "changedemail@example.com"
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
