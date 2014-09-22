# Business Rules

## Users

A user should (be allowed to) have

* strictly one persona per assessment.
* representations for an assessment if he has an "assessee" persona for that assessment.
* strictly one representation per assessment.
* comparisons for an assessment if he has an "assessor" persona for that assessment.
* [TBD] number of comparisons per assessment.
* strictly one active comparison.

## Assessments

An assessment should (be allowed to) have

* An infinite amount of comparisons
* An infinite amount of personas

## Comparisons

A comparison should (be allowed to) have

* Strictly one assessment
* Strictly one "assessor"-persona
* A PAM-defined number of judgements
* A developer-defined number of timelogs

## Judgements

A judgement should (be allowed to) have

* Strictly one assessment
* Strictly one representation
* Strictly one "assessor"-persona
* Strictly one comparison
* A developer-defined number of timelogs

## Representations

A representation should (be allowed to) have

* Strictly one "assessee"-persona
* Strictly one assessment