Logical: MII_LM_MolGen_LogicalModel
Parent: Element
Id: LogicalModelMolGen
Title: "MII LM MolGen LogicalModel"
Description: "LogicalModel of the MII module Molecular Genetic Report"
//* ^status = #draft
* Sample information 1..1 BackboneElement "Sample information"
* Patient 1..1 Reference(Patient) "Patient" "Shown in the KDS module Person"
* Sample 0..* Reference(Specimen) "Sample" "Shown in the KDS module Biobank"
* Requirement 0..* BackboneElement "Requirement"
* Indication 0..* BackboneElement "Indication"
* Indication 0..* CodeableConcept "Indication" "Indication; (possible) disease Terminologies: ICD-10, SNOMED, Orpha, HPO - Example: Suspected... / Exclusion of… / Possible therapy for ..."
* Health status 0..* Reference(Condition) "Health status" "Current health status; details of current complaints or proven illness - Terminology: HPO"
* Family medical history 0..* Reference(FamilyMemberHistory) "Family medical history"
* Carrier 0..* Reference(FamilyMemberHistory or Condition or Observation) "Carrier" "Carrier status of the family - Is required if relatives of the index case were also sequenced - Terminology: PED"
* Relevant preliminary results 0..* Reference(Condition or Observation or DiagnosticReport or DocumentReference) "Relevant preliminary results" "Details of relevant tests previously performed (including e.g. method, genes tested, and results)"
* Requester 0..* Reference(Practitioner or PractitionerRole or Organization or Patient or RelatedPerson or Device) "Requester" "Information about the person who orders the molecular genetic tests"
* Genes to be tested 0..* CodeableConcept "Genes to be tested" "Specification of the genes to be tested"
* Uniform assessment standard 0..* Reference(ChargeItem) "Uniform assessment standard" "The uniform assessment standard defines the content of the billable contract medical services Uniform assessment standard (EBM): Specification of the numbers"
* Request text 0..1 string "Request text" "Free text for specifying either the original, unchanged request text, or alternatively: additional requirements or requested test"
* Date of request 0..1 dateTime "Date of request" "Specification of the date of the request"
* Comments 0..1 Annotation "Remarks"
* Methods 0..* BackboneElement "Methods"
* Method 0..1 CodeableConcept "Method" "Method and reference to the method - contains all sequence-based analytical methods, while non-sequence-based processing methods are assigned to the Pathology module."

* Relevant parameters 0..* Reference(Observation or DocumentReference) "Relevant parameters" "Relevant parameters (specification of primer / number of cycles, panel)"

* Device software kits 0..1 Reference(Device) "Devices / Software / Kits" "Details of devices / software / kits used including target enrichment for the analysis (possibly specification of manufacturer; Version number)"
* Tested genes 0..* CodeableConcept "Tested genes" "Specification of the genes tested"
* Reference sequence 0..1 CodeableConcept "Reference sequence" "Transcript reference sequence (Ensembl and RefSeq)"
* Read depth coverage 0..1 CodeableConcept "Read depth/coverage" "Number of reads of a specific nucleotide in the genome in an experiment"
* Intron spanning IVS 0..* string "Intron spanning / IVS" "Intron spanning or IVS (intervening sequence, e.g. introns)"
* Start and end nucleotide 0..1 Range "Start and end nucleotide" "Start and end nucleotide"
* Sensitivity detection limit 0..1 Quantity "Sensitivity/detection limit" "Sensitivity/detection limit"
* Limitations-Remarks 0..* Annotation "Limitations/Remarks" "Limitations/Remarks, free text"
* Results 0..* BackboneElement "Results"
* Summary 0..1 CodeableConcept "Summary"
* Summary from http://loinc.org/vs/LL541-4
* Changes 0..* BackboneElement "Changes"
* Change-Protein level 0..1 CodeableConcept "Changes at protein level: Terminology: HGVS - Specification possible from: Formal Protein (pHGVS) 3-letter code: Example: p.(Cys47Tyr), p.(Val600Glu) - Formal Protein (pHGVS) 1-letter code: Example: p.(C47Y) - Trivial name (short form): Example: C47Y" //?
* DNA changes 0..1 CodeableConcept "Change at DNA level, formal description using cHGVS"

* Genomic DNA changes 0..1 CodeableConcept "Genomic DNA change gHGVS"

* Transcript ID 0..1 CodeableConcept "Transcript ID (code) - Terminology: NCBI, Ensembl, GTR, LRG"

* Reference genome 0..* CodeableConcept "Reference genome - The genome build has two formats, either hg and a number (hg18, hg19, hg38) or GRCh/NCBI and a number (NCBI35, NCBI36, GRCh37, GRCh38)."
* Ref-Allele 0..1 string "Reference allele"

* Alt-Allele 0..1 string "Any alternative (ALT) allele at the locus under investigation"

* DNA-Mut
