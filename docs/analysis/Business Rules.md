# Business Rules

## Users

A user should

* [x] U01: be allowed to have strictly one persona per assessment.
* [x] U02: be allowed to have representations for an assessment if he has an "assessee" persona for that assessment.
* [x] U03: be allowed to have strictly one representation per assessment.
* [x] U04: be allowed to have comparisons for an assessment if he has an "assessor" persona for that assessment.
* [ ] U05: be allowed to have [TBD] number of comparisons per assessment.
* [x] U06: be allowed to have strictly one active comparison.

## Personas

A persona should

* [x] P01: have strictly one user
* [x] P02: have strictly one role
* [x] P03: have strictly one assessment
* [x] ~~P04: be created strictly for assessments with "state" is "published"~~
* P05: U01

## Assessments

An assessment should

* [x] A01: be allowed to have an infinite amount of comparisons
* [x] A02: be allowed to have an infinite amount of personas
* [x] A03: not be visible, nor usable by an assessor unless "state" is "published"

## Comparisons

A comparison should

* [x] C01: have strictly one assessment
* [x] C02: have strictly one "assessor"-persona
* [x] C03: have a PAM-defined number of judgements
* [x] C04: have a developer-defined number of timelogs
* [x] C05: be created strictly for assessments with "state" is "published"
* C06: U04
* C07: U06

## Judgements

A judgement should

* [x] J01: have strictly one assessment
* [x] J02: have strictly one representation
* [x] J03: have strictly one "assessor"-persona
* [x] J04: have strictly one comparison
* [x] J05: have a developer-defined number of timelogs
* [x] J06: be created strictly for assessments with "state" is "published"

## Representations

A representation should

* [x] R01: have strictly one "assessee"-persona
* [x] R02: have strictly one assessment
* [x] R03: be created strictly for assessments with "state" is "published"
* R04: U02
* R05: U03
