# wtconvert

App to convert openEHR 'web templates' to Asciidoc, Xmind and other output formats.

## Purpose 
Documentation for clinical applications should be written and maintained in one single truth. 
The openEHR web template is such a resource. This project generates asciidoc files and other exports for a given template. 

## Usage 
```
❯ wtconvert
Options:
    --help                  Show help                             [boolean]
    --version               Show version number                   [boolean]
    --web-template, -wt     Source web template                   [string] [required]
    --out-file,     -o                                            [string]
    --export-format, -ex    Export format (default:adoc)          [string] adoc|xmind|docx|pdf
    -- config-file,  -cfg    default: "config/wtconfig.json"       [string]
  
 ```  
## Export format dependencies 

- **Adoc** (asciidoc) and **Xmind** are supported natively.


- **Docx** requires a local install of [Pandoc](https://pandoc.org/installing.html)


- **PDF** requires local installs of [Pandoc](https://pandoc.org/installing.html) and [BasicTex](https://www.neelsomani.com/blog/get-mactex-faster-easily-using-basictex.php) - for Macos


## Configuration

The default configuration is

```
{
  //Display occurences as e.g. [1..1] rather than 'mandatory'
  "displayTechnicalOccurrences": false,
  
  //Hide atCodes and Rm attribute ids
  "hideNodeIds": true,
  
  // Skip specific AQL paths
  "skippedAQLPaths": [],
  
  //Include specifc annotations
  "includedAnnotations": [],
  
  //Exclude theese specific RM attribute tags
  "excludedRMTags": ["territory","language", "encoding","subject"],
  
  // Optionsal top level title to replace the template root name
  "title": "",
 
  // Display the AQL paths of eacNode instead of a Description
  "displayAQLPaths": false,
  
  //Display a Table of contents
   "displayToc": false,
}
```


           

