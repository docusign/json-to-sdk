# JSON to SDK tool
The JSON to SDK tool converts JSON input for the 
DocuSign eSignature REST 
[Envelopes:create](https://developers.docusign.com/docs/esign-rest-api/reference/Envelopes/Envelopes/create/)
API method to SDK 
code examples for

* C#
* PHP
* Java
* Node.JS
* Python
* Ruby
* Visual Basic (The example calls the API directly since there is no VB SDK.)

## Usage
1. Open the tool's URL.
1. Copy/paste the source JSON to the input textarea on the left side of the app.
1. The SDK code example will immediately be shown on the right side.
1. Use the output drop-down menu to change the output language.

## Input formats

The input JSON must represent a JSON object and must start with an opening brace, `{`.

### The JSON object can be just the request object:

````
{
    "emailSubject": "Please sign the attached document",
    "status": "sent",
    "documents": [
        {
            "filename": "anchorfields.pdf",
            "name": "Example document",
            "fileExtension": "pdf",
            "documentId": "1"
        }
    ],
    ...
}
````

### Or the object can include an `envelopeDefinition` attribute
````
{
  "envelopeDefinition": {
    "emailSubject": "Please sign the attached document",
    "status": "sent",
    "documents": [
      {
        "filename": "anchorfields.pdf",
        "name": "Example document",
        "fileExtension": "pdf",
        "documentId": "1"
      }
    ],
...
}
````

If the second format is used, an optional `createRecipientViewReq`
attribute can be included at the first level:

````
  "createRecipientViewReq": {
    "returnUrl": "https://docusign.com",
    "authenticationMethod": "none",
    "clientUserId": "1000",
    "email": "signer_email@example.com",
    "userName": "Signer's name"
  }
````
If the `createRecipientViewReq` attribute is included, the app 
will include an 
[EnvelopeViews:createRecipient](https://developers.docusign.com/docs/esign-rest-api/reference/Envelopes/EnvelopeViews/createRecipient/)
call in the code.

## Attribute names
Object and array attribute names must exactly match an `attribute` attribute in the 
`json-to-sdk/src/lib/children.json` file.

Except for `filename`, any scalar attribute name can be used and will be included in the request.

## `filename` attribute
If you include a `filename` attribute, then its value will
be interpreted as a filename whose contents should be included
as the object's `documentBase64` attribute.

For example:
````
"documents": [
  {
    "filename": "anchorfields.pdf",
    "name": "Example document",
    "fileExtension": "pdf",
    "documentId": "1"
  }
],
````

Will be converted, for C#, to:
````
Document document1 = new Document
{
	DocumentId = "1",  
	FileExtension = "pdf",  
	DocumentBase64 = ReadContent("anchorfields.pdf"),
	Name = "Example document" 
};
List<Document> documents1 = new List<Document> {document1};
````

The `ReadContent` method is included in the code example.

## Output
To run an output example, first use the `Download Framework`
button to download a zip file that includes the "framework" 
for the specific language.

Use the language's library utility to install the 
DocuSign SDK and any other needed libraries.

Next, download the example code by using the `Download Code`
button or use copy/paste from the output textarea. 

You will overwrite the contents of the main file in the
framework. For example, for C#, you'll overwrite the 
`CSharp_example/CSharp_example/Program.cs` file.

## Authentication
Each call to the eSignature REST API requires an access token.
You can obtain an access token for development testing
from the access token generator.

For production, you must use one of the supported
[OAuth flows](https://developers.docusign.com/docs/platform/auth/choose/).

## Fluent input
The tool includes support for a *Fluent* API interface
to the Envelopes:create method. Fluent input is a 
proof of concept investigation.

## Issues, pull requests
Please file issues using the `issues` page of the application's
github repository. Please do **not** use the issues 
page to ask general eSignature API questions.

For general eSignature API questions, use 
[StackOverflow](https://stackoverflow.com) with tag
`docusignapi`

**Pull Requests** are welcome if the update uses the
MIT license.

