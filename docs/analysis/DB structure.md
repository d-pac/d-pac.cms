An _Assessee_ is a _User_ that uploads a _Representation_ for an _Assessment_.
An _Assessor_ is a _User_ that creates a _Comparison_ for an _Assessment_.

## User

* _id
* name
* email
* password
* isAdmin

## Role

* _id
* owner_id
* assessment_id
* type ['Assessor', 'Assessee']
* ordinal

## Representation

* _id
* owner_id
* ordinal
* url

## Comparison

* _id
* creator_id
* representations
	* representation_id
	* rank
	* notes
	* pass [PASS|FAIL]
* motivation

## Assessment

* _id
* creator_id
* title
* description
