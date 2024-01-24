Logical:      MMTACreateBeneficiary
Title:        "MMTA Create Beneficiary"
Description:  "Data elements for the MMT.A Create Beneficiary Data Dictionary."
* ^extension[http://hl7.org/fhir/tools/StructureDefinition/logical-target].valueBoolean = true
* ^name = "MMTACreateBeneficiary"
* ^status = #active

* identifier 1..1 SU string "Beneficiary’s identifier."
  * ^code[+] = MMT.A#DE1
* name 1..1  BackboneElement "Name" "Beneficiary's full name"
  * firstName 1..1 string "First name" "Beneficiary's first name or given name"
    * ^code[+] = MMT.A#DE2
  * middleName 1..1 string "Middle name" "Beneficiary's middle name or family name"
    * ^code[+] = MMT.A#DE3
  * lastName 1..1 string "Last name" "Beneficiary’s Family name (often called 'Surname')"
    * ^code[+] = MMT.A#DE4
* gender 1..1 SU code "Gender" "Administrative Gender (sex) - the gender that the patient is considered to have for administration and record-keeping purposes."
* gender from  genderVS
  * ^code[+] = MMT.A#DE5
* dateOfBirth 1..1  date "Date Of Birth" "The date of birth of the individual."
  * ^code[+] = MMT.A#DE6
* maritalStatus 1..1 SU code "Marital Status" "This field contains a patient's most recent marital (civil) status."
* maritalStatus from maritalStatusVS
  * ^code[+] = MMT.A#DE7
* telecom 0..* ContactPoint "Phone Number" "A contact detail (Telecom) for the person, e.g. a telephone, Email, etc"
  * ^code[+] = MMT.A#DE8
* address 0..1 	Address "Address" "Patient Address"
  * residentialCountryCode 0..1 Address "Residential Country Code" "Residential code that represents the beneficiary’s country of residence."
    * ^code[+] = MMT.A#DE10
  * residentialCountyCode 0..1 Address "Residential County Code" "Residential code that represents the beneficiary’s county of residence."
    * ^code[+] = MMT.A#DE11
  * residentialLocationCode 0..1 Address "Residential Location Code" "Residential code that represents the beneficiary’s location of residence."
    * ^code[+] = MMT.A#DE12
