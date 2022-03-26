// Copyright DocuSign, Inc. Ⓒ 2020. MIT License -- https://opensource.org/licenses/MIT
/**
 * dsJsonToSdk produces an sdk program from the json input
 * @type {{}}
 */

const pluralize = require("pluralize/pluralize");
const childObjAttr = require("./childObjAttr.json");
const {DsSdkTemplates} = require("./dsSdkTemplates");

class JsonToSdk {

    constructor() {
    }

    /**
     *
     * @param {object} json The incoming JSON with the envelope definition
     *                      and perhaps other objects too.
     *                      Optional other objects:
     *                      * envelopesCreateQP -- envelope create query parameters
     *                      * createRecipientViewReq -- for creating the view
     * @returns {string} program The SDK program
     */
    convert (json, sdkLanguage) {
        this.appObject = {accessToken: null, accountId: null, dsApi: {findDocuments: this.findDocuments},
            languageNames: this.languageNames};
        this.template = new DsSdkTemplates(this.appObject, sdkLanguage);
        if (!this.template.supported) {
            return `Sorry, ${this.appObject.languageNames(this.sdkLanguage)} is not yet implemented`
        }
        if (this.template.wantsJSON) {
            this.template.t.convertJSON(json);
            return this.template.template  // EARLY return
        }
        this.sdkObjOut = [];
        this.variableNamesUsed = {}; // Handle issue of only declaring once
           // items are variable names, with value of the last one used.
           // Eg signer: 2 means that name signer1 and signer2 have been used

        // The incoming JSON may be from the fluent output
        // (has attribute envelopeDefinition) or not
        this.doSdkObjConversion('envelopeDefinition', 'envelopeDefinition', 'envelopeDefinition',
                json.envelopeDefinition || json);
        let envelopeDefinition = this.sdkObjOut.join("\n")
        this.template.setEnvelopeDefinition(envelopeDefinition);

        this.sdkObjOut = [];
        if (json.createRecipientViewReq) {
            // Embedded signing
            this.doSdkObjConversion('recipientViewRequest', 'recipientViewRequest', 'recipientViewRequest',
                json.createRecipientViewReq);
        }
        this.template.setRecipientViewRequest(
            this.sdkObjOut.length === 0 ? false : this.sdkObjOut.join("\n")
        )
        return this.template.template;
    }

    /**
     *
     * @param {string} name the base name for a variable
     * @returns {string} result the variable name that should be used
     */
    getVariableName(name){
        let lastUsed = this.variableNamesUsed[name] || 0
          , current = lastUsed + 1
          , result = `${name}${current}`
          ;
        this.variableNamesUsed[name] = current;
        return result
    }

    /**
     * Produce the sdkDefinition object
     * @param {string} objName The current object's name.
     *                         The json parameter is its attributes.
     * @param {string} sdkObjName The current object's name as used in the SDKs
     * @param {string} varName The generic name of the variable for objName.
     *                         Not yet customized to snake case, etc.
     * @param {object} json    An envelope definition (or part of it)
     */
    doSdkObjConversion(objName, sdkObjName, varName, json){
        // Strategy
        // 1. Use recursion of this method for all object and
        //    arrayOfObject attributes.
        // 2. Produce variables for all arrayOfScalars
        // 3. Write code output for this variable, using the
        //    variable names created in steps 1 and 2.

        const attributes = Object.keys(json)
            , objAttributes = attributes.filter(
                attr => childObjAttr[objName] && childObjAttr[objName][attr] &&
                    childObjAttr[objName][attr].itemType === 'object')
            , arrayOfObjAttributes = attributes.filter(
                attr => childObjAttr[objName] && childObjAttr[objName][attr] &&
                    childObjAttr[objName][attr].itemType === 'arrayOfObject')
            , arrayOfScalarAttributes = attributes.filter(
                attr => (childObjAttr[objName] && childObjAttr[objName][attr]) &&
                    childObjAttr[objName][attr].itemType === 'arrayOfScalar')
            , scalarAttributes = attributes.filter(
                attr => !(childObjAttr[objName] && childObjAttr[objName][attr]))
            , attributeInfo = [] // will be sorted list of attribute name and type
            ;

        // Create variables named for the attributes
        objAttributes.forEach(attr => {
            const vName = this.getVariableName(attr);
            attributeInfo.push({attr: attr, type: "object", varName: vName, scalar: false});
            const sdkObjName = childObjAttr[objName][attr].sdkObjectName || childObjAttr[objName][attr].objectName;
            this.doSdkObjConversion(
                childObjAttr[objName][attr].objectName, sdkObjName, vName, json[attr]);
        });

        arrayOfObjAttributes.forEach(attr => {
            const vName = this.getVariableName(attr);
            attributeInfo.push({attr: attr, type: "array", varName: vName, scalar: false});
            const oName = childObjAttr[objName][attr].objectName;
            const sdkObjName = childObjAttr[objName][attr].sdkObjectName || childObjAttr[objName][attr].objectName;
            let arrayItems = [];
            json[attr].forEach(item => {
                const itemName = this.getVariableName(pluralize.singular(attr));
                arrayItems.push(itemName);
                this.doSdkObjConversion(oName, sdkObjName, itemName, item);
            })
            // write the array attribute and items
            this.sdkObjOut.push(this.template.t.array({
                var: vName, objName: oName, sdkObjectName: sdkObjName, items: arrayItems}));
        })

        arrayOfScalarAttributes.forEach(attr => {
            const vName = this.getVariableName(attr);
            attributeInfo.push({attr: attr, type: "array", varName: vName, scalar: false});
            // Assuming an array of string
            if (childObjAttr[objName][attr].scalarType !== "string") {
                console.error(`PROBLEM! Object ${objName} attribute ${attr} is array of scalar ${childObjAttr[objName][attr].scalarType} (string was expected)`)
            }
            this.sdkObjOut.push(this.template.t.arrayOfString(
                {var: vName, items: json[attr]}));
        })

        scalarAttributes.forEach(attr =>
            attributeInfo.push({attr: attr, type: typeof json[attr], scalar: true, value: json[attr]})
        )

        attributeInfo.sort((a, b) => a.attr < b.attr ? -1 : 1)
        if (objName === 'document') {
            const filenameAttribute = attributeInfo.find(v => v.attr === 'filename')
                , filename = filenameAttribute ? filenameAttribute.value : false;
            if (filenameAttribute) {
                // Change the filename attribute into a documentBase64
                filenameAttribute.comment = `filename is ${filename}`;
                filenameAttribute.attr = 'documentBase64';
                filenameAttribute.docFilename = filename;
                // The template will use the docFilename in a function call.
            }
        }
        this.sdkObjOut.push(this.template.t.object({
            var: varName, objectName: objName, sdkObjectName: sdkObjName,
            attributeInfo: attributeInfo}));
    }
}
module.exports = { JsonToSdk };
