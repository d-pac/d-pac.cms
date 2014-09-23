# Business Rules

## Users

A user should

* U01: be allowed to have strictly one persona per assessment.
* U02: be allowed to have representations for an assessment if he has an "assessee" persona for that assessment.
* U03: be allowed to have strictly one representation per assessment.
* U04: be allowed to have comparisons for an assessment if he has an "assessor" persona for that assessment.
* U05: be allowed to have [TBD] number of comparisons per assessment.
* U06: be allowed to have strictly one active comparison.

## Personas

A persona should

* P01: have strictly one user
* P02: have strictly one role
* P03: have strictly one assessment
* P04: be created strictly for assessments with "state" is "published"
* P05: U01

## Assessments

An assessment should

* A01: be allowed to have an infinite amount of comparisons
* A02: be allowed to have an infinite amount of personas
* A03: not be visible, nor editable unless "state" is "published"

## Comparisons

A comparison should

* C01: have strictly one assessment
* C02: have strictly one "assessor"-persona
* C03: have a PAM-defined number of judgements
* C04: have a developer-defined number of timelogs
* C05: be created strictly for assessments with "state" is "published"
* C06: U04
* C07: U06

## Judgements

A judgement should

* J01: have strictly one assessment
* J02: have strictly one representation
* J03: have strictly one "assessor"-persona
* J04: have strictly one comparison
* J05: have a developer-defined number of timelogs
* J06: be created strictly for assessments with "state" is "published"

## Representations

A representation should

* R01: have strictly one "assessee"-persona
* R02: have strictly one assessment
* R03: be created strictly for assessments with "state" is "published"
* R04: U02
* R05: U03
