## REST API v0.2.1

<!-- toc -->

### Intro

All resources contain a

- `type` field with the name of the collection they're a part of
- `links.self` field with a relative URL of the resource

e.g.

 ```js
 {
     "_id": "55113f1742ff1a0877242a39",
     "name": {
         "first": "Admin",
         "last": "User",
         "full": "Admin User"
     },
     "organization": "5512857ab22121c7cbd0af46",
     "email": "user@keystonejs.com",
     "assessments": [
         "5511410927f4401a785dff0b"
     ],
     "type": "users",
     "links": {
       "self": "/api/users/55113f1742ff1a0877242a39"
     }
 }
```

These fields are sometimes omitted from the examples.

### authorization

#### retrieve session

##### Request

```
GET 	/api/session
```

##### Response

```
200 OK
```
```json
{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": "5512857ab22121c7cbd0af46",
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}
```

#### create session

##### Request

```
POST 	/api/session
```
```json
{
	"password": "test",
	"password_confirm": "test",
	"email": "user@keystonejs.org"
}
```

##### Response

```
200 OK
```
```json
{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": "5512857ab22121c7cbd0af46",
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}
```

#### remove session

##### Request

```
DELETE 	/api/session
```

##### Response

```
204 No content
```

### current (i.e. logged-in) user

#### retrieve user details

##### Request

```
GET 	/api/user
```

##### Response

```
200 OK
```
```json
{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": "5512857ab22121c7cbd0af46",
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}
```

#### update user details

##### Request

```
PATCH /api/user
```
```json
{
    "name": {
        "first": "Admin",
        "last": "User"
    },
    "organization": "5512857ab22121c7cbd0af46",
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ],
    "password": "test",
    "password_confirm": "test"
}
```

##### Response

```
200 OK
```
```json
{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": "5512857ab22121c7cbd0af46",
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}
```

#### list assessments for user

##### Request

```
GET /api/user/assessments
```

##### Response

```
200 OK
```
```json
[
    {
        "_id": "5511410927f4401a785dff0b",
        "algorithm": "comparative-selection",
        "title": "Test Assessment",
        "assignments": {
            "assessor": "The assignment description directed to the assessor",
            "assessee": "The assignment as it was given to the assessee"
        },
        "parent": "5511410927f4401a785dff0a",
        "state": "published",
        "comparisonsNum": {
            "stage": [5],
            "total": 20
        },
        "stage": 0,
        "enableTimeLogging": true,
        "phases": [
            {
                "_id": "5423f87677177065a0887b99",
                "type": "select",
                "label": "Select best",
                "__v": 0
            }
        ],
        "uiCopy": {}
    }
]
```

`uiCopy` is truncated in the examples due to its length.

#### list comparisons for user

##### Request

```
GET /api/user/comparisons
```

##### Response

```
200 OK
```
```json
[
    {
        "_id": "551d1028f95f2d0465cb1b43",
        "_rid": 13,
        "phase": "551d1e1c2266922f78daf485",
        "assessor": "551d3152d7590713148eae0d",
        "assessment": "5511410927f4401a785dff0b",
        "data": {
            "comparative": "Feedback",
            "passfail": {
                "a": true,
                "b": true
            },
            "selection": "551141561d13789d78fff006"
        },
        "representations": {
            "a": "551141561d13789d78fff006",
            "b": "5511417f494157b8783984c5"
        },
        "completed": false,
        "type": "comparisons",
        "links": {
            "self": "/api/comparisons/551d1028f95f2d0465cb1b43"
        }
    }
]
```

### phases

#### list phases

##### Request

```
GET /api/phases
```

##### Response

```
200 OK
```
```json
[
    {
        "_id": "551d1e1c2266922f78daf483",
        "label": "Select best",
        "slug": "selection",
        "type": "phases",
        "links": {
            "self": "/api/phases/551d1e1c2266922f78daf483"
        }
    },
    {
        "_id": "551d1e1c2266922f78daf485",
        "label": "Indicate Pass/Fail",
        "slug": "passfail",
        "type": "phases",
        "links": {
            "self": "/api/phases/551d1e1c2266922f78daf485"
        }
    },
    {
        "_id": "551d1e1c2266922f78daf484",
        "label": "Provide comparative Feedback",
        "slug": "comparative",
        "type": "phases",
        "links": {
            "self": "/api/phases/551d1e1c2266922f78daf484"
        }
    }
]
```

### pages

#### list pages

##### Request

```
GET /api/pages
```

##### Response

```
200 OK
```
```json
[
    {
        "slug": "tool-welcome",
        "title": "Welcome",
        "body": "<p>Welcome to d-pac.</p>",
        "state": "published",
        "type": "pages",
        "links": {
            "self": "/api/pages/tool-welcome"
        }
    }
]
```

#### retrieve pages

##### Request

```
GET /api/pages/:slug
```

##### Response

```
200 OK
```
```json
{
    "slug": "tool-welcome",
    "title": "Welcome",
    "body": "<p>Welcome to d-pac.</p>",
    "state": "published",
    "type": "pages",
    "links": {
        "self": "/api/pages/tool-welcome"
    }
}
```

### representations

#### list representations

##### Request

```
GET /api/representations
```

##### Response

```
200 OK
```
```json
[
    {
        "_id": "551141561d13789d78fff006",
        "document": {
            "href": "http://d-pac.be/images/be72540e.d-pac-logo_colour.png"
        },
        "assessment": "5511410927f4401a785dff0b",
        "type": "to rank",
        "ability": null,
        "compared": [
            "5511417f494157b8783984c5"
        ],
        "comparedNum": 3,
        "name": "Test Assessment - D-pac logo"
    },
    {
        "_id": "5511417f494157b8783984c5",
        "document": {
            "href": "/uploads/Screen shot 2011-05-04 at 10.59.13-1427193661242.png"
        },
        "assessment": "5511410927f4401a785dff0b",
        "type": "to rank",
        "ability": null,
        "compared": [
            "551141561d13789d78fff006"
        ],
        "comparedNum": 3,
        "name": "Test Assessment - Screen shot 2011-05-04 at 10.59.13.png"
    }
]
```

#### retrieve representation

##### Request

```
GET /api/representations/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "551141561d13789d78fff006",
    "document": {
        "_id": "55113f4642ff1a0877242a3f",
        "_rid": 2,
        "owner": "55113f1742ff1a0877242a39",
        "link": "http://d-pac.be/images/be72540e.d-pac-logo_colour.png",
        "type": "link",
        "title": "D-pac logo",
        "name": "D-pac logo"
    },
    "assessment": "5511410927f4401a785dff0b",
    "type": "to rank",
    "ability": null,
    "compared": [
        "5511417f494157b8783984c5"
    ],
    "comparedNum": 3,
    "name": "Test Assessment - D-pac logo"
}
```

### assessments

#### list assessments

##### Request

```
GET 	/api/assessments
```

##### Response

```json
200 OK
```
```json
[
    {
        "_id": "5511410927f4401a785dff0b",
        "algorithm": "comparative-selection",
        "title": "Test Assessment",
        "description": "",
        "order": 0,
        "state": "published",
        "comparisonsNum": 20,
        "phases": [
            {
                "_id": "5423f87677177065a0887b99",
                "type": "select",
                "label": "Select best",
                "__v": 0
            }
        ]
    }
]
```

#### create assessment

##### Request

```
POST 	/api/assessments
```
```json
{
    "_id": "5511410927f4401a785dff0b",
    "algorithm": "comparative-selection",
    "title": "Test Assessment",
    "description": "",
    "order": 0,
    "state": "published",
    "comparisonsNum": 20,
    "phases": [
		"5423f87677177065a0887b99"
    ]
}
```
##### Response

```json
200 OK
```
```json
{
    "_id": "5511410927f4401a785dff0b",
    "algorithm": "comparative-selection",
    "title": "Test Assessment",
    "description": "",
    "order": 0,
    "state": "published",
    "comparisonsNum": 20,
    "phases": [
        {
            "_id": "5423f87677177065a0887b99",
            "type": "select",
            "label": "Select best"
        }
    ]
}
```

#### retrieve assessment

##### Request

```
GET 	/api/assessments/:id
```

##### Response


```json
200 OK
```
```json
{
    "_id": "5511410927f4401a785dff0b",
    "algorithm": "comparative-selection",
    "title": "Test Assessment",
    "description": "",
    "order": 0,
    "state": "published",
    "comparisonsNum": 20,
    "phases": [
        {
            "_id": "5423f87677177065a0887b99",
            "type": "select",
            "label": "Select best"
        }
    ]
}
```

#### update assessment

##### Request

```
PATCH 	/api/assessments/:id
```
```json
{
    "algorithm": "comparative-selection",
    "title": "Test Assessment",
    "description": "",
    "order": 0,
    "state": "published",
    "comparisonsNum": 20,
    "phases": [
		"5423f87677177065a0887b99"
    ]
}
```
##### Response

```json
200 OK
```
```json
{
    "_id": "5511410927f4401a785dff0b",
    "algorithm": "comparative-selection",
    "title": "Test Assessment",
    "description": "",
    "order": 0,
    "state": "published",
    "comparisonsNum": 20,
    "phases": [
        {
            "_id": "5423f87677177065a0887b99",
            "type": "select",
            "label": "Select best"
        }
    ]
}
```

#### remove assessment

##### Request

```
DELETE 	/api/assessments/:id
```

##### Response

```json
200 OK
```
```json
{
    "_id": "5511410927f4401a785dff0b",
    "algorithm": "comparative-selection",
    "title": "Test Assessment",
    "description": "",
    "order": 0,
    "state": "published",
    "comparisonsNum": 20,
    "phases": [
        {
            "_id": "5423f87677177065a0887b99",
            "type": "select",
            "label": "Select best"
        }
    ]
}
```

### users

#### list users

##### Request

```
GET /api/users
```

##### Response

```
200 OK
```
```json
[{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": {
        "_id": "5512857ab22121c7cbd0af46",
        "name": "d-pac"
    },
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}]
```

#### create user

##### Request

```
POST /api/user
```
```json
{
    "name": {
        "first": "Admin",
        "last": "User"
    },
    "organization": "5512857ab22121c7cbd0af46",
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ],
    "password": "test",
    "password_confirm": "test"
}
```

##### Response

```
200 OK
```
```json
{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": {
        "_id": "5512857ab22121c7cbd0af46",
        "name": "d-pac"
    },
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}
```

#### retrieve user

##### Request

```
GET 	/api/users/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": {
        "_id": "5512857ab22121c7cbd0af46",
        "name": "d-pac"
    },
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}
```

#### update user

##### Request

```
PATCH /api/users/:id
```
```json
{
    "name": {
        "first": "Admin",
        "last": "User"
    },
    "organization": "5512857ab22121c7cbd0af46",
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ],
    "password": "test",
    "password_confirm": "test"
}
```

##### Response


```
200 OK
```
```json
{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": {
        "_id": "5512857ab22121c7cbd0af46",
        "name": "d-pac"
    },
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}
```

#### remove user

##### Request

```
DELETE 	/api/users/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "55113f1742ff1a0877242a39",
    "name": {
        "first": "Admin",
        "last": "User",
        "full": "Admin User"
    },
    "organization": {
        "_id": "5512857ab22121c7cbd0af46",
        "name": "d-pac"
    },
    "email": "user@keystonejs.com",
    "assessments": [
        "5511410927f4401a785dff0b"
    ]
}
```

### comparisons

#### list comparisons

##### Request

```
GET /api/comparisons
```

##### Response

```
200 OK
```
```json
[
    {
        "_id": "55114689eeaee2b17c331b2b",
        "_rid": 1,
        "assessor": "55113f1742ff1a0877242a39",
        "assessment": {
            "_id": "5511410927f4401a785dff0b",
            "algorithm": "comparative-selection",
            "title": "Test Assessment",
            "description": "",
            "order": 0,
            "state": "published",
            "comparisonsNum": 20,
            "phases": [
                "5423f87677177065a0887b99"
            ]
        },
        "phase": "5423f87677177065a0887b99",
        "completed": false,
        "representations": [
            {
                "_id": "551141561d13789d78fff006",
                "document": "55113f4642ff1a0877242a3f",
                "assessment": "5511410927f4401a785dff0b",
                "type": "to rank",
                "ability": null,
                "compared": [
                    "5511417f494157b8783984c5"
                ],
                "comparedNum": 3,
                "name": "Test Assessment - D-pac logo"
            },
            {
                "_id": "5511417f494157b8783984c5",
                "document": "55113f2c42ff1a0877242a3e",
                "assessment": "5511410927f4401a785dff0b",
                "type": "to rank",
                "ability": null,
                "compared": [
                    "551141561d13789d78fff006"
                ],
                "comparedNum": 3,
                "name": "Test Assessment - Screen shot 2011-05-04 at 10.59.13.png"
            }
        ]
    }
]
```

#### create comparison

##### Request

```
POST /api/comparisons
```
```json
{
    "assessor": "55113f1742ff1a0877242a39",
    "assessment": "5511410927f4401a785dff0b",
    "phase": "5423f87677177065a0887b99",
    "completed": false,
    "representations": [ "551141561d13789d78fff006", "5511417f494157b8783984c5"]
}
```

##### Response

```
200 OK
```
```json
{
    "_id": "55114689eeaee2b17c331b2b",
    "_rid": 1,
    "assessor": "55113f1742ff1a0877242a39",
    "assessment": {
        "_id": "5511410927f4401a785dff0b",
        "algorithm": "comparative-selection",
        "title": "Test Assessment",
        "description": "",
        "order": 0,
        "state": "published",
        "comparisonsNum": 20,
        "phases": [
            "5423f87677177065a0887b99"
        ]
    },
    "phase": "5423f87677177065a0887b99",
    "completed": false,
    "representations": [
        {
            "_id": "551141561d13789d78fff006",
            "document": "55113f4642ff1a0877242a3f",
            "assessment": "5511410927f4401a785dff0b",
            "type": "to rank",
            "ability": null,
            "compared": [
                "5511417f494157b8783984c5"
            ],
            "comparedNum": 3,
            "name": "Test Assessment - D-pac logo"
        },
        {
            "_id": "5511417f494157b8783984c5",
            "document": "55113f2c42ff1a0877242a3e",
            "assessment": "5511410927f4401a785dff0b",
            "type": "to rank",
            "ability": null,
            "compared": [
                "551141561d13789d78fff006"
            ],
            "comparedNum": 3,
            "name": "Test Assessment - Screen shot 2011-05-04 at 10.59.13.png"
        }
    ]
}
```

#### retrieve comparison

##### Request

```
GET /api/comparisons/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "55114689eeaee2b17c331b2b",
    "_rid": 1,
    "assessor": "55113f1742ff1a0877242a39",
    "assessment": {
        "_id": "5511410927f4401a785dff0b",
        "algorithm": "comparative-selection",
        "title": "Test Assessment",
        "description": "",
        "order": 0,
        "state": "published",
        "comparisonsNum": 20,
        "phases": [
            "5423f87677177065a0887b99"
        ]
    },
    "phase": "5423f87677177065a0887b99",
    "completed": false,
    "representations": [
        {
            "_id": "551141561d13789d78fff006",
            "document": "55113f4642ff1a0877242a3f",
            "assessment": "5511410927f4401a785dff0b",
            "type": "to rank",
            "ability": null,
            "compared": [
                "5511417f494157b8783984c5"
            ],
            "comparedNum": 3,
            "name": "Test Assessment - D-pac logo"
        },
        {
            "_id": "5511417f494157b8783984c5",
            "document": "55113f2c42ff1a0877242a3e",
            "assessment": "5511410927f4401a785dff0b",
            "type": "to rank",
            "ability": null,
            "compared": [
                "551141561d13789d78fff006"
            ],
            "comparedNum": 3,
            "name": "Test Assessment - Screen shot 2011-05-04 at 10.59.13.png"
        }
    ]
}
```

#### update comparison

##### Request

```
PATCH /api/comparisons/:id
```
```json
{
    "assessor": "55113f1742ff1a0877242a39",
    "assessment": "5511410927f4401a785dff0b",
    "phase": "5423f87677177065a0887b99",
    "completed": false,
    "representations": [ "551141561d13789d78fff006", "5511417f494157b8783984c5"]
}
```

##### Response

```
200 OK
```
```json
{
    "_id": "55114689eeaee2b17c331b2b",
    "_rid": 1,
    "assessor": "55113f1742ff1a0877242a39",
    "assessment": {
        "_id": "5511410927f4401a785dff0b",
        "algorithm": "comparative-selection",
        "title": "Test Assessment",
        "description": "",
        "order": 0,
        "state": "published",
        "comparisonsNum": 20,
        "phases": [
            "5423f87677177065a0887b99"
        ]
    },
    "phase": "5423f87677177065a0887b99",
    "completed": false,
    "representations": [
        {
            "_id": "551141561d13789d78fff006",
            "document": "55113f4642ff1a0877242a3f",
            "assessment": "5511410927f4401a785dff0b",
            "type": "to rank",
            "ability": null,
            "compared": [
                "5511417f494157b8783984c5"
            ],
            "comparedNum": 3,
            "name": "Test Assessment - D-pac logo"
        },
        {
            "_id": "5511417f494157b8783984c5",
            "document": "55113f2c42ff1a0877242a3e",
            "assessment": "5511410927f4401a785dff0b",
            "type": "to rank",
            "ability": null,
            "compared": [
                "551141561d13789d78fff006"
            ],
            "comparedNum": 3,
            "name": "Test Assessment - Screen shot 2011-05-04 at 10.59.13.png"
        }
    ]
}
```

#### remove comparison

##### Request

```
DELETE /api/comparisons/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "55114689eeaee2b17c331b2b",
    "_rid": 1,
    "assessor": "55113f1742ff1a0877242a39",
    "assessment": {
        "_id": "5511410927f4401a785dff0b",
        "algorithm": "comparative-selection",
        "title": "Test Assessment",
        "description": "",
        "order": 0,
        "state": "published",
        "comparisonsNum": 20,
        "phases": [
            "5423f87677177065a0887b99"
        ]
    },
    "phase": "5423f87677177065a0887b99",
    "completed": false,
    "representations": [
        {
            "_id": "551141561d13789d78fff006",
            "document": "55113f4642ff1a0877242a3f",
            "assessment": "5511410927f4401a785dff0b",
            "type": "to rank",
            "ability": null,
            "compared": [
                "5511417f494157b8783984c5"
            ],
            "comparedNum": 3,
            "name": "Test Assessment - D-pac logo"
        },
        {
            "_id": "5511417f494157b8783984c5",
            "document": "55113f2c42ff1a0877242a3e",
            "assessment": "5511410927f4401a785dff0b",
            "type": "to rank",
            "ability": null,
            "compared": [
                "551141561d13789d78fff006"
            ],
            "comparedNum": 3,
            "name": "Test Assessment - Screen shot 2011-05-04 at 10.59.13.png"
        }
    ]
}
```

### timelogs

#### list timelogs

##### Request

```
GET /api/timelogs
```

##### Response

```
200 OK
```
```json
[
    {
        "_id": "55126ba6cffa5eb9c484b7f9",
        "end": "2015-03-25T08:02:45.000Z",
        "begin": "2015-03-25T08:02:44.000Z",
        "comparison": "55114689eeaee2b17c331b2b",
        "phase": "5423f87677177065a0887b99",
    }
]
```

#### create timelog

##### Request

```
POST /api/timelogs
```
```json
{
    "end": "2015-03-25T08:02:45.000Z",
    "begin": "2015-03-25T08:02:44.000Z",
    "comparison": "55114689eeaee2b17c331b2b",
    "phase": "5423f87677177065a0887b99"
}
```

##### Response

```
200 OK
```
```json
[
    {
        "_id": "55126ba6cffa5eb9c484b7f9",
        "end": "2015-03-25T08:02:45.000Z",
        "begin": "2015-03-25T08:02:44.000Z",
        "comparison": "55114689eeaee2b17c331b2b",
        "phase": "5423f87677177065a0887b99"
    }
]
```

#### retrieve timelog

##### Request

```
GET /api/timelogs/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "55126ba6cffa5eb9c484b7f9",
    "end": "2015-03-25T08:02:45.000Z",
    "begin": "2015-03-25T08:02:44.000Z",
    "comparison": "55114689eeaee2b17c331b2b",
    "phase": "5423f87677177065a0887b99"
}
```

#### update timelog

##### Request

```
PATCH /api/timelogs/:id
```
```json
{
    "end": "2015-03-25T08:02:45.000Z",
    "begin": "2015-03-25T08:02:44.000Z",
    "comparison": "55114689eeaee2b17c331b2b",
    "phase": "5423f87677177065a0887b99"
}
```

##### Response

```
200 OK
```
```json
{
    "_id": "55126ba6cffa5eb9c484b7f9",
    "end": "2015-03-25T08:02:45.000Z",
    "begin": "2015-03-25T08:02:44.000Z",
    "comparison": "55114689eeaee2b17c331b2b",
    "phase": "5423f87677177065a0887b99"
}
```

#### remove timelog

##### Request

```
DELETE /api/timelogs/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "55126ba6cffa5eb9c484b7f9",
    "end": "2015-03-25T08:02:45.000Z",
    "begin": "2015-03-25T08:02:44.000Z",
    "comparison": "55114689eeaee2b17c331b2b",
    "phase": "5423f87677177065a0887b99"
}
```


### organizations

#### list organizations

##### Request

```
GET /api/organizations
```

##### Response

```
200 OK
```
```json
[
    {
        "_id": "5512857ab22121c7cbd0af46",
        "name": "d-pac",
        "type": "organizations",
        "links": {
            "self": "/api/organizations/5512857ab22121c7cbd0af46"
        }
    }
]
```

#### create organization

##### Request

```
POST /api/organizations
```
```json
{
    "name": "d-pac"
}
```

##### Response

```
200 OK
```
```json
{
    "_id": "5512857ab22121c7cbd0af46",
    "name": "d-pac",
    "type": "organizations",
    "links": {
        "self": "/api/organizations/5512857ab22121c7cbd0af46"
    }
}
```

#### retrieve organization

##### Request

```
GET /api/organizations/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "5512857ab22121c7cbd0af46",
    "name": "d-pac",
    "type": "organizations",
    "links": {
        "self": "/api/organizations/5512857ab22121c7cbd0af46"
    }
}
```

#### update organization

##### Request

```
PATCH /api/organizations/:id
```
```json
{
    "name": "d-pac"
}
```

##### Response

```
200 OK
```
```json
{
    "_id": "5512857ab22121c7cbd0af46",
    "name": "d-pac",
    "type": "organizations",
    "links": {
        "self": "/api/organizations/5512857ab22121c7cbd0af46"
    }
}
```

#### remove organization

##### Request

```
DELETE /api/organizations/:id
```

##### Response

```
200 OK
```
```json
{
    "_id": "5512857ab22121c7cbd0af46",
    "name": "d-pac",
    "type": "organizations",
    "links": {
        "self": "/api/organizations/5512857ab22121c7cbd0af46"
    }
}
```

#### create message

##### Request

```
POST /api/messages
```
```json
{
  "assessment":"56274576d8441e060a5649b9",
  "subject": "Message sent by REST API",
  "body": "Lorem ipsum"
}
```

##### Response

```
200 OK
```
```json
{
    "_rid": 20,
    "updatedAt": "2015-11-12T11:58:06.523Z",
    "createdAt": "2015-11-12T11:58:06.523Z",
    "createdBy": "56121c4d85bcf1308178d0c2",
    "assessment": "56274576d8441e060a5649b9",
    "state": "handled",
    "subject": "Message sent by REST API",
    "_id": "56447ece2db881bb473dc504",
    "type": "messages",
    "links": {
        "self": "/api/messages/56447ece2db881bb473dc504"
    }
}
```

