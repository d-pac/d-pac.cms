# Plugin spec v0.3.1

## Mandatory configuration

Your `package.json` manifest file **must** include:

1. a `d-pac` object as follows:

	```json
	//file: package.json
	{
		"d-pac": [ {
			"name" : "Name of the plugin",
			"description" : "Description of the plugin",
			"type" : "select",
			"entry" : "select",
			"satisfies":"^0.3.1"
		} ]
	}
	```

	* `name`: {`String`} _**(required)**_ The name of the algorithm.
	* `description`: {`String`} _**(required)**_ A description of the algorithm.
	* `type`: {`String`} _**(required)**_ The type of the algorithm.
	* `entry`: {`String`} _(optional)_ The main access point to your algorithm, by default the same value as `type` is assumed.
	* `satisfies`: {`String`|`Array`} _**required**_ (v0.3.1 and up) [Semver](http://semver.org) version specification of the **d-pac plugin specification** (i.e. this document) the plugin is compatible with. E.g. `"^0.3.1"`
	* `compatibility`: {`String`|`Array`} _(optional)_ **DEPRECATED in v0.3.1** [Semver](http://semver.org) version specification of d-pac.cms versions this plugin is compatible with.

## Mandatory API

### Selection algorithms

#### `select`

Your selection algorithm **must** expose a function called `select` (or provide the correct name as a value for `entry` in the manifest:

```js
function select(representations, comparisons, assessment, assessor){
	//here be magical stuff
	return selection;
}
```

* `representations` an Array of objects with following (minimal) structure:

	* `_id`: {`String`} unique object identifier
	* `compared`: {`String[]`} Array of `_id`s
	* `comparedNum`: {`Number`} Number of times compared (might deviate from `compared.length` if `compared` stores unique id's only and a representation is compared to another specific representation multiple times)

* `comparisons` an Array of objects with following (minimal) structure:

	* `_id`: {`String`} unique object identifier
	* `assessor`: {`String`} user id
	* `assessment`: {`String`} assessment id
	* `representations`:
		* `a`: {`String`} representation id
		* `b`: {`String`} representation id
	* `data`:
		* `selection`: {`String`} representation id, selected representation

* `assessment` an object with structure:
	* `comparisonsNum`
		* `total`: {`Number`} total allowed number of comparisons for the assessment
		* `stage`: {`Number[]`} an array of Numbers, with the allowed number of comparisons per stage
	* `stage`: {`Number`} the current stage the algorithm is in

* `assessor`: {`String`} user id, the assessor for the current comparison

The algorithm should return a selection of `representations` in a range of `[0;n]`, where `n` is defined by your algorithm; wrapped in an object with a `result` field:

E.g.

```js
//index.js
var _ = require("underscore");
module.exports = {
	manifest: [{
		name : "Name of the plugin",
		description : "Description of the plugin",
		options : {
			type: "select"
		}
	}],
	select : function(items){
		return { result: _.first(items)};
	}
}
```

If no representations could be selected an object with `messages` field is to be returned:

E.g.

```js
return {
	messages: ["Could not select representations"]
};
```
