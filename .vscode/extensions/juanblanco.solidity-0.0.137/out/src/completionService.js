'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteByDot = exports.GetContextualAutoCompleteByGlobalVariable = exports.GetGlobalFunctions = exports.GetGlobalVariables = exports.GeCompletionUnits = exports.GetCompletionKeywords = exports.GetCompletionTypes = exports.CompletionService = void 0;
const solparse = require("solparse-exp-jb");
const vscode_languageserver_1 = require("vscode-languageserver");
const codeWalkerService_1 = require("./codeWalkerService");
const glob = require("glob");
const path_1 = require("path");
const url_1 = require("url");
const path = require("path");
class CompletionService {
    constructor(rootPath) {
        this.rootPath = rootPath;
    }
    getTypeString(literal) {
        const isArray = literal.array_parts.length > 0;
        let isMapping = false;
        const literalType = literal.literal;
        let suffixType = '';
        if (typeof literalType.type !== 'undefined') {
            isMapping = literalType.type === 'MappingExpression';
            if (isMapping) {
                suffixType = '(' + this.getTypeString(literalType.from) + ' => ' + this.getTypeString(literalType.to) + ')';
            }
        }
        if (isArray) {
            suffixType = suffixType + '[]';
        }
        if (isMapping) {
            return 'mapping' + suffixType;
        }
        return literalType + suffixType;
    }
    createFunctionParamsSnippet(params, skipFirst = false) {
        let paramsSnippet = '';
        let counter = 0;
        if (typeof params !== 'undefined' && params !== null) {
            params.forEach(parameterElement => {
                if (skipFirst && counter === 0) {
                    skipFirst = false;
                }
                else {
                    const typeString = this.getTypeString(parameterElement.literal);
                    counter = counter + 1;
                    const currentParamSnippet = '${' + counter + ':' + parameterElement.id + '}';
                    if (paramsSnippet === '') {
                        paramsSnippet = currentParamSnippet;
                    }
                    else {
                        paramsSnippet = paramsSnippet + ', ' + currentParamSnippet;
                    }
                }
            });
        }
        return paramsSnippet;
    }
    createParamsInfo(params) {
        let paramsInfo = '';
        if (typeof params !== 'undefined' && params !== null) {
            if (params.hasOwnProperty('params')) {
                params = params.params;
            }
            params.forEach(parameterElement => {
                const typeString = this.getTypeString(parameterElement.literal);
                let currentParamInfo = '';
                if (typeof parameterElement.id !== 'undefined' && parameterElement.id !== null) { // no name on return parameters
                    currentParamInfo = typeString + ' ' + parameterElement.id;
                }
                else {
                    currentParamInfo = typeString;
                }
                if (paramsInfo === '') {
                    paramsInfo = currentParamInfo;
                }
                else {
                    paramsInfo = paramsInfo + ', ' + currentParamInfo;
                }
            });
        }
        return paramsInfo;
    }
    createFunctionEventCompletionItem(contractElement, type, contractName, skipFirstParamSnipppet = false) {
        const completionItem = vscode_languageserver_1.CompletionItem.create(contractElement.name);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Function;
        const paramsInfo = this.createParamsInfo(contractElement.params);
        const paramsSnippet = this.createFunctionParamsSnippet(contractElement.params, skipFirstParamSnipppet);
        let returnParamsInfo = this.createParamsInfo(contractElement.returnParams);
        if (returnParamsInfo !== '') {
            returnParamsInfo = ' returns (' + returnParamsInfo + ')';
        }
        completionItem.insertTextFormat = 2;
        completionItem.insertText = contractElement.name + '(' + paramsSnippet + ');';
        const info = '(' + type + ' in ' + contractName + ') ' + contractElement.name + '(' + paramsInfo + ')' + returnParamsInfo;
        completionItem.documentation = info;
        completionItem.detail = info;
        return completionItem;
    }
    createParameterCompletionItem(contractElement, type, contractName) {
        const completionItem = vscode_languageserver_1.CompletionItem.create(contractElement.id);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Variable;
        const typeString = this.getTypeString(contractElement.literal);
        completionItem.detail = '(' + type + ' in ' + contractName + ') '
            + typeString + ' ' + contractElement.id;
        return completionItem;
    }
    createVariableCompletionItem(contractElement, type, contractName) {
        const completionItem = vscode_languageserver_1.CompletionItem.create(contractElement.name);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Field;
        const typeString = this.getTypeString(contractElement.literal);
        completionItem.detail = '(' + type + ' in ' + contractName + ') '
            + typeString + ' ' + contractElement.name;
        return completionItem;
    }
    createStructCompletionItem(contractElement, contractName) {
        const completionItem = vscode_languageserver_1.CompletionItem.create(contractElement.name);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Struct;
        //completionItem.insertText = contractName + '.' + contractElement.name;
        completionItem.insertText = contractElement.name;
        completionItem.detail = '(Struct in ' + contractName + ') '
            + contractElement.name;
        return completionItem;
    }
    createEnumCompletionItem(contractElement, contractName) {
        const completionItem = vscode_languageserver_1.CompletionItem.create(contractElement.name);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Enum;
        //completionItem.insertText = contractName + '.' + contractElement.name;
        completionItem.insertText = contractElement.name;
        completionItem.detail = '(Enum in ' + contractName + ') '
            + contractElement.name;
        return completionItem;
    }
    // type "Contract, Libray, Abstract contract"
    createContractCompletionItem(contractName, type) {
        const completionItem = vscode_languageserver_1.CompletionItem.create(contractName);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Class;
        completionItem.insertText = contractName;
        completionItem.detail = '(' + type + ' : ' + contractName + ') ';
        return completionItem;
    }
    createInterfaceCompletionItem(contractName) {
        const completionItem = vscode_languageserver_1.CompletionItem.create(contractName);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Interface;
        completionItem.insertText = contractName;
        completionItem.detail = '( Interface : ' + contractName + ') ';
        return completionItem;
    }
    getDocumentCompletionItems(documentText) {
        const completionItems = [];
        try {
            const result = solparse.parse(documentText);
            // console.log(JSON.stringify(result));
            // TODO struct, modifier
            result.body.forEach(element => {
                if (element.type === 'ContractStatement' || element.type === 'LibraryStatement' || element.type == 'InterfaceStatement') {
                    const contractName = element.name;
                    if (typeof element.body !== 'undefined' && element.body !== null) {
                        element.body.forEach(contractElement => {
                            if (contractElement.type === 'FunctionDeclaration') {
                                // ignore the constructor TODO add to contract initialiasation
                                if (contractElement.name !== contractName) {
                                    completionItems.push(this.createFunctionEventCompletionItem(contractElement, 'function', contractName));
                                }
                            }
                            if (contractElement.type === 'EventDeclaration') {
                                completionItems.push(this.createFunctionEventCompletionItem(contractElement, 'event', contractName));
                            }
                            if (contractElement.type === 'StateVariableDeclaration') {
                                completionItems.push(this.createVariableCompletionItem(contractElement, 'state variable', contractName));
                            }
                            if (contractElement.type === 'EnumDeclaration') {
                                completionItems.push(this.createEnumCompletionItem(contractElement, contractName));
                            }
                            if (contractElement.type === 'StructDeclaration') {
                                completionItems.push(this.createStructCompletionItem(contractElement, contractName));
                            }
                        });
                    }
                }
            });
        }
        catch (error) {
            // gracefule catch
            // console.log(error.message);
        }
        // console.log('file completion items' + completionItems.length);
        return completionItems;
    }
    getAllCompletionItems(packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory, remappings, document, position) {
        let completionItems = [];
        let triggeredByEmit = false;
        let triggeredByImport = false;
        let triggeredByDotStart = 0;
        try {
            var walker = new codeWalkerService_1.SolidityCodeWalker(this.rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory, remappings);
            const offset = document.offsetAt(position);
            var documentContractSelected = walker.getAllContracts(document, position);
            const lines = document.getText().split(/\r?\n/g);
            triggeredByDotStart = this.getTriggeredByDotStart(lines, position);
            //triggered by emit is only possible with ctrl space
            triggeredByEmit = getAutocompleteVariableNameTrimmingSpaces(lines[position.line], position.character - 1) === 'emit';
            triggeredByImport = getAutocompleteVariableNameTrimmingSpaces(lines[position.line], position.character - 1) === 'import';
            //  TODO: this does not work due to the trigger.
            // || (lines[position.line].trimLeft().startsWith('import "') && lines[position.line].trimLeft().lastIndexOf('"') === 7);
            if (triggeredByDotStart > 0) {
                const globalVariableContext = GetContextualAutoCompleteByGlobalVariable(lines[position.line], triggeredByDotStart);
                if (globalVariableContext != null) {
                    completionItems = completionItems.concat(globalVariableContext);
                }
                else {
                    let autocompleteByDot = getAutocompleteTriggerByDotVariableName(lines[position.line], triggeredByDotStart - 1);
                    // if triggered by variable //done
                    // todo triggered by method (get return type) // done
                    // todo triggered by property // done
                    // todo variable // method return is an array (push, length etc)
                    // variable / method / property is an address or other specific type functionality (balance, etc)
                    // variable / method / property type is extended by a library
                    if (autocompleteByDot.name !== '') {
                        // have we got a selected contract (assuming not type.something)
                        if (documentContractSelected.selectedContract !== undefined && documentContractSelected.selectedContract !== null) {
                            let selectedContract = documentContractSelected.selectedContract;
                            //this contract
                            if (autocompleteByDot.name === 'this' && autocompleteByDot.isVariable && autocompleteByDot.parentAutocomplete === null) {
                                //add selectd contract completion items
                                this.addContractCompletionItems(selectedContract, completionItems);
                            }
                            else {
                                /// the types 
                                let topParent = autocompleteByDot.getTopParent();
                                if (topParent.name === "this") {
                                    topParent = topParent.childAutocomplete;
                                }
                                this.findDotCompletionItemsForSelectedContract(topParent, completionItems, documentContractSelected, documentContractSelected.selectedContract, offset);
                            }
                        }
                    }
                }
                return completionItems;
            }
            if (triggeredByImport) {
                let files = glob.sync(this.rootPath + '/**/*.sol');
                files.forEach(item => {
                    let dependenciesDir = path.join(this.rootPath, packageDefaultDependenciesDirectory);
                    item = path.join(item);
                    if (item.startsWith(dependenciesDir)) {
                        let pathLibrary = item.substr(dependenciesDir.length + 1);
                        pathLibrary = pathLibrary.split('\\').join('/');
                        let completionItem = vscode_languageserver_1.CompletionItem.create(pathLibrary);
                        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Reference;
                        completionItem.insertText = '"' + pathLibrary + '";';
                        completionItems.push(completionItem);
                    }
                    else {
                        let rel = path_1.relative(url_1.fileURLToPath(document.uri), item);
                        rel = rel.split('\\').join('/');
                        if (rel.startsWith('../')) {
                            rel = rel.substr(1);
                        }
                        let completionItem = vscode_languageserver_1.CompletionItem.create(rel);
                        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Reference;
                        completionItem.insertText = '"' + rel + '";';
                        completionItems.push(completionItem);
                    }
                });
                return completionItems;
            }
            if (triggeredByEmit) {
                if (documentContractSelected.selectedContract !== undefined && documentContractSelected.selectedContract !== null) {
                    this.addAllEventsAsCompletionItems(documentContractSelected.selectedContract, completionItems);
                }
            }
            else {
                if (documentContractSelected.selectedContract !== undefined && documentContractSelected.selectedContract !== null) {
                    let selectedContract = documentContractSelected.selectedContract;
                    this.addSelectedContractCompletionItems(selectedContract, completionItems, offset);
                }
                documentContractSelected.allContracts.forEach(x => {
                    if (x.contractType === "ContractStatement") {
                        completionItems.push(this.createContractCompletionItem(x.name, "Contract"));
                    }
                    if (x.contractType === "LibraryStatement") {
                        completionItems.push(this.createContractCompletionItem(x.name, "Library"));
                    }
                    if (x.contractType === "InterfaceStatement") {
                        completionItems.push(this.createInterfaceCompletionItem(x.name));
                    }
                });
            }
        }
        catch (error) {
            // graceful catch
            console.log(error);
        }
        finally {
            completionItems = completionItems.concat(GetCompletionTypes());
            completionItems = completionItems.concat(GetCompletionKeywords());
            completionItems = completionItems.concat(GeCompletionUnits());
            completionItems = completionItems.concat(GetGlobalFunctions());
            completionItems = completionItems.concat(GetGlobalVariables());
        }
        return completionItems;
    }
    findDotCompletionItemsForSelectedContract(autocompleteByDot, completionItems, documentContractSelected, currentContract, offset) {
        if (currentContract === documentContractSelected.selectedContract) {
            let selectedFunction = documentContractSelected.selectedContract.getSelectedFunction(offset);
            this.findDotCompletionItemsForContract(autocompleteByDot, completionItems, documentContractSelected.allContracts, documentContractSelected.selectedContract, selectedFunction, offset);
        }
        else {
            this.findDotCompletionItemsForContract(autocompleteByDot, completionItems, documentContractSelected.allContracts, documentContractSelected.selectedContract);
        }
    }
    findDotCompletionItemsForContract(autocompleteByDot, completionItems, allContracts, currentContract, selectedFunction = null, offset = null) {
        let allStructs = currentContract.getAllStructs();
        let allEnums = currentContract.getAllEnums();
        let allVariables = currentContract.getAllStateVariables();
        let allfunctions = currentContract.getAllFunctions();
        if (selectedFunction !== undefined && selectedFunction !== null) {
            selectedFunction.findVariableDeclarationsInScope(offset, null);
            //adding input parameters
            allVariables = allVariables.concat(selectedFunction.input);
            //ading all variables
            allVariables = allVariables.concat(selectedFunction.variablesInScope);
        }
        let found = false;
        if (autocompleteByDot.isVariable) {
            allVariables.forEach(item => {
                if (item.name === autocompleteByDot.name && !found) {
                    found = true;
                    if (autocompleteByDot.childAutocomplete !== undefined && autocompleteByDot.childAutocomplete !== null) {
                        this.findDotType(allStructs, item.type, autocompleteByDot.childAutocomplete, completionItems, allContracts, currentContract);
                    }
                    else {
                        this.findDotTypeCompletion(allStructs, item.type, completionItems, allContracts, currentContract);
                    }
                }
            });
            if (!found && (autocompleteByDot.childAutocomplete === undefined || autocompleteByDot.childAutocomplete === null)) {
                allEnums.forEach(item => {
                    if (item.name === autocompleteByDot.name) {
                        found = true;
                        item.items.forEach(property => {
                            let completitionItem = vscode_languageserver_1.CompletionItem.create(property);
                            completionItems.push(completitionItem);
                        });
                    }
                });
            }
            if (!found && (autocompleteByDot.childAutocomplete === undefined || autocompleteByDot.childAutocomplete === null)) {
                allContracts.forEach(item => {
                    if (item.name === autocompleteByDot.name) {
                        found = true;
                        this.addContractCompletionItems(item, completionItems);
                    }
                });
            }
        }
        if (autocompleteByDot.isMethod) {
            allfunctions.forEach(item => {
                if (item.name === autocompleteByDot.name) {
                    found = true;
                    if (item.output.length === 1) {
                        //todo return array
                        let type = item.output[0].type;
                        if (autocompleteByDot.childAutocomplete !== undefined && autocompleteByDot.childAutocomplete !== null) {
                            this.findDotType(allStructs, type, autocompleteByDot.childAutocomplete, completionItems, allContracts, currentContract);
                        }
                        else {
                            this.findDotTypeCompletion(allStructs, type, completionItems, allContracts, currentContract);
                        }
                    }
                }
            });
            //contract declaration as IMyContract(address)
            if (!found && (autocompleteByDot.childAutocomplete === undefined || autocompleteByDot.childAutocomplete === null)) {
                allContracts.forEach(item => {
                    if (item.name === autocompleteByDot.name) {
                        found = true;
                        this.addContractCompletionItems(item, completionItems);
                    }
                });
            }
        }
    }
    findDotTypeCompletion(allStructs, type, completionItems, allContracts, currentContract) {
        let foundStruct = allStructs.find(x => x.name === type.name);
        if (foundStruct !== undefined) {
            foundStruct.variables.forEach(property => {
                //own method refactor
                let completitionItem = vscode_languageserver_1.CompletionItem.create(property.name);
                const typeString = this.getTypeString(property.element.literal);
                completitionItem.detail = '(' + property.name + ' in ' + foundStruct.name + ') '
                    + typeString + ' ' + foundStruct.name;
                completionItems.push(completitionItem);
            });
        }
        else {
            let foundContract = allContracts.find(x => x.name === type.name);
            if (foundContract !== undefined) {
                foundContract.initialiseExtendContracts(allContracts);
                this.addContractCompletionItems(foundContract, completionItems);
            }
        }
        let allUsing = currentContract.getAllUsing(type);
        allUsing.forEach(usingItem => {
            let foundLibrary = allContracts.find(x => x.name === usingItem.name);
            if (foundLibrary !== undefined) {
                this.addAllLibraryExtensionsAsCompletionItems(foundLibrary, completionItems, type);
            }
        });
    }
    findDotType(allStructs, type, autocompleteByDot, completionItems, allContracts, currentContract) {
        let foundStruct = allStructs.find(x => x.name === type.name);
        if (foundStruct !== undefined) {
            foundStruct.variables.forEach(property => {
                //own method refactor
                if (autocompleteByDot.name === property.name) {
                    if (autocompleteByDot.childAutocomplete !== undefined && autocompleteByDot.childAutocomplete !== null) {
                        this.findDotType(allStructs, property.type, autocompleteByDot.childAutocomplete, completionItems, allContracts, currentContract);
                    }
                    else {
                        this.findDotTypeCompletion(allStructs, property.type, completionItems, allContracts, currentContract);
                    }
                }
            });
        }
        else {
            let foundContract = allContracts.find(x => x.name === type.name);
            if (foundContract !== undefined) {
                foundContract.initialiseExtendContracts(allContracts);
                this.findDotCompletionItemsForContract(autocompleteByDot, completionItems, allContracts, foundContract);
            }
        }
        /*
        let allUsing = currentContract.getAllUsing(type);
        allUsing.forEach(usingItem => {
            let foundLibrary = allContracts.find(x => x.name === usingItem.name);
            if (foundLibrary !== undefined) {
                this.addAllLibraryExtensionsAsCompletionItems(foundLibrary, completionItems, type);
            }
        });
        */
    }
    addContractCompletionItems(selectedContract, completionItems) {
        this.addAllFunctionsAsCompletionItems(selectedContract, completionItems);
        this.addAllStateVariablesAsCompletionItems(selectedContract, completionItems);
    }
    addSelectedContractCompletionItems(selectedContract, completionItems, offset) {
        this.addAllFunctionsAsCompletionItems(selectedContract, completionItems);
        this.addAllEventsAsCompletionItems(selectedContract, completionItems);
        this.addAllStateVariablesAsCompletionItems(selectedContract, completionItems);
        this.addAllStructsAsCompletionItems(selectedContract, completionItems);
        this.addAllEnumsAsCompletionItems(selectedContract, completionItems);
        let selectedFunction = selectedContract.getSelectedFunction(offset);
        if (selectedFunction !== undefined) {
            selectedFunction.findVariableDeclarationsInScope(offset, null);
            selectedFunction.input.forEach(parameter => {
                completionItems.push(this.createParameterCompletionItem(parameter.element, "function parameter", selectedFunction.contract.name));
            });
            selectedFunction.output.forEach(parameter => {
                completionItems.push(this.createParameterCompletionItem(parameter.element, "return parameter", selectedFunction.contract.name));
            });
            selectedFunction.variablesInScope.forEach(variable => {
                completionItems.push(this.createVariableCompletionItem(variable.element, "function variable", selectedFunction.contract.name));
            });
        }
    }
    addAllEnumsAsCompletionItems(documentContractSelected, completionItems) {
        let allEnums = documentContractSelected.getAllEnums();
        allEnums.forEach(item => {
            completionItems.push(this.createEnumCompletionItem(item.element, item.contract.name));
        });
    }
    addAllStructsAsCompletionItems(documentContractSelected, completionItems) {
        let allStructs = documentContractSelected.getAllStructs();
        allStructs.forEach(item => {
            completionItems.push(this.createStructCompletionItem(item.element, item.contract.name));
        });
    }
    addAllEventsAsCompletionItems(documentContractSelected, completionItems) {
        let allevents = documentContractSelected.getAllEvents();
        allevents.forEach(item => {
            completionItems.push(this.createFunctionEventCompletionItem(item.element, 'event', item.contract.name));
        });
    }
    addAllStateVariablesAsCompletionItems(documentContractSelected, completionItems) {
        let allStateVariables = documentContractSelected.getAllStateVariables();
        allStateVariables.forEach(item => {
            completionItems.push(this.createVariableCompletionItem(item.element, 'state variable', item.contract.name));
        });
    }
    addAllFunctionsAsCompletionItems(documentContractSelected, completionItems) {
        let allfunctions = documentContractSelected.getAllFunctions();
        allfunctions.forEach(item => {
            completionItems.push(this.createFunctionEventCompletionItem(item.element, 'function', item.contract.name));
        });
    }
    addAllLibraryExtensionsAsCompletionItems(documentContractSelected, completionItems, type) {
        let allfunctions = documentContractSelected.getAllFunctions();
        let filteredFunctions = allfunctions.filter(x => {
            if (x.input.length > 0) {
                let typex = x.input[0].type;
                let validTypeName = false;
                if (typex.name === type.name || (type.name === "address_payable" && typex.name === "address")) {
                    validTypeName = true;
                }
                return typex.isArray === type.isArray && validTypeName && typex.isMapping === type.isMapping;
            }
            return false;
        });
        filteredFunctions.forEach(item => {
            completionItems.push(this.createFunctionEventCompletionItem(item.element, 'function', item.contract.name, true));
        });
    }
    getTriggeredByDotStart(lines, position) {
        let start = 0;
        let triggeredByDot = false;
        for (let i = position.character; i >= 0; i--) {
            if (lines[position.line[i]] === ' ') {
                triggeredByDot = false;
                i = 0;
                start = 0;
            }
            if (lines[position.line][i] === '.') {
                start = i;
                i = 0;
                triggeredByDot = true;
            }
        }
        return start;
    }
}
exports.CompletionService = CompletionService;
function GetCompletionTypes() {
    const completionItems = [];
    const types = ['address', 'string', 'bytes', 'byte', 'int', 'uint', 'bool', 'hash'];
    for (let index = 8; index <= 256; index += 8) {
        types.push('int' + index);
        types.push('uint' + index);
        types.push('bytes' + index / 8);
    }
    types.forEach(type => {
        const completionItem = vscode_languageserver_1.CompletionItem.create(type);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Keyword;
        completionItem.detail = type + ' type';
        completionItems.push(completionItem);
    });
    // add mapping
    return completionItems;
}
exports.GetCompletionTypes = GetCompletionTypes;
function CreateCompletionItem(label, kind, detail) {
    const completionItem = vscode_languageserver_1.CompletionItem.create(label);
    completionItem.kind = kind;
    completionItem.detail = detail;
    return completionItem;
}
function GetCompletionKeywords() {
    const completionItems = [];
    const keywords = ['modifier', 'mapping', 'break', 'continue', 'delete', 'else', 'for',
        'if', 'new', 'return', 'returns', 'while', 'using',
        'private', 'public', 'external', 'internal', 'payable', 'nonpayable', 'view', 'pure', 'case', 'do', 'else', 'finally',
        'in', 'instanceof', 'return', 'throw', 'try', 'catch', 'typeof', 'yield', 'void', 'virtual', 'override'];
    keywords.forEach(unit => {
        const completionItem = vscode_languageserver_1.CompletionItem.create(unit);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Keyword;
        completionItems.push(completionItem);
    });
    completionItems.push(CreateCompletionItem('contract', vscode_languageserver_1.CompletionItemKind.Class, null));
    completionItems.push(CreateCompletionItem('library', vscode_languageserver_1.CompletionItemKind.Class, null));
    completionItems.push(CreateCompletionItem('storage', vscode_languageserver_1.CompletionItemKind.Field, null));
    completionItems.push(CreateCompletionItem('memory', vscode_languageserver_1.CompletionItemKind.Field, null));
    completionItems.push(CreateCompletionItem('var', vscode_languageserver_1.CompletionItemKind.Field, null));
    completionItems.push(CreateCompletionItem('constant', vscode_languageserver_1.CompletionItemKind.Constant, null));
    completionItems.push(CreateCompletionItem('immutable', vscode_languageserver_1.CompletionItemKind.Keyword, null));
    completionItems.push(CreateCompletionItem('constructor', vscode_languageserver_1.CompletionItemKind.Constructor, null));
    completionItems.push(CreateCompletionItem('event', vscode_languageserver_1.CompletionItemKind.Event, null));
    completionItems.push(CreateCompletionItem('import', vscode_languageserver_1.CompletionItemKind.Module, null));
    completionItems.push(CreateCompletionItem('enum', vscode_languageserver_1.CompletionItemKind.Enum, null));
    completionItems.push(CreateCompletionItem('struct', vscode_languageserver_1.CompletionItemKind.Struct, null));
    completionItems.push(CreateCompletionItem('function', vscode_languageserver_1.CompletionItemKind.Function, null));
    return completionItems;
}
exports.GetCompletionKeywords = GetCompletionKeywords;
function GeCompletionUnits() {
    const completionItems = [];
    const etherUnits = ['wei', 'finney', 'szabo', 'ether'];
    etherUnits.forEach(unit => {
        const completionItem = vscode_languageserver_1.CompletionItem.create(unit);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Unit;
        completionItem.detail = unit + ': ether unit';
        completionItems.push(completionItem);
    });
    const timeUnits = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'years'];
    timeUnits.forEach(unit => {
        const completionItem = vscode_languageserver_1.CompletionItem.create(unit);
        completionItem.kind = vscode_languageserver_1.CompletionItemKind.Unit;
        if (unit !== 'years') {
            completionItem.detail = unit + ': time unit';
        }
        else {
            completionItem.detail = 'DEPRECATED: ' + unit + ': time unit';
        }
        completionItems.push(completionItem);
    });
    return completionItems;
}
exports.GeCompletionUnits = GeCompletionUnits;
function GetGlobalVariables() {
    return [
        {
            detail: 'Current block',
            kind: vscode_languageserver_1.CompletionItemKind.Variable,
            label: 'block',
        },
        {
            detail: 'Current Message',
            kind: vscode_languageserver_1.CompletionItemKind.Variable,
            label: 'msg',
        },
        {
            detail: '(uint): current block timestamp (alias for block.timestamp)',
            kind: vscode_languageserver_1.CompletionItemKind.Variable,
            label: 'now',
        },
        {
            detail: 'Current transaction',
            kind: vscode_languageserver_1.CompletionItemKind.Variable,
            label: 'tx',
        },
        {
            detail: 'ABI encoding / decoding',
            kind: vscode_languageserver_1.CompletionItemKind.Variable,
            label: 'abi',
        },
    ];
}
exports.GetGlobalVariables = GetGlobalVariables;
function GetGlobalFunctions() {
    return [
        {
            detail: 'assert(bool condition): throws if the condition is not met - to be used for internal errors.',
            insertText: 'assert(${1:condition});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            label: 'assert',
        },
        {
            detail: 'gasleft(): returns the remaining gas',
            insertText: 'gasleft();',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            label: 'gasleft',
        },
        {
            detail: 'unicode: converts string into unicode',
            insertText: 'unicode"${1:text}"',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            label: 'unicode',
        },
        {
            detail: 'blockhash(uint blockNumber): hash of the given block - only works for 256 most recent, excluding current, blocks',
            insertText: 'blockhash(${1:blockNumber});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Function,
            label: 'blockhash',
        },
        {
            detail: 'require(bool condition): reverts if the condition is not met - to be used for errors in inputs or external components.',
            insertText: 'require(${1:condition});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'require',
        },
        {
            // tslint:disable-next-line:max-line-length
            detail: 'require(bool condition, string message): reverts if the condition is not met - to be used for errors in inputs or external components. Also provides an error message.',
            insertText: 'require(${1:condition}, ${2:message});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'require',
        },
        {
            detail: 'revert(): abort execution and revert state changes',
            insertText: 'revert();',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'revert',
        },
        {
            detail: 'addmod(uint x, uint y, uint k) returns (uint):' +
                'compute (x + y) % k where the addition is performed with arbitrary precision and does not wrap around at 2**256',
            insertText: 'addmod(${1:x}, ${2:y}, ${3:k})',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'addmod',
        },
        {
            detail: 'mulmod(uint x, uint y, uint k) returns (uint):' +
                'compute (x * y) % k where the multiplication is performed with arbitrary precision and does not wrap around at 2**256',
            insertText: 'mulmod(${1:x}, ${2:y}, ${3:k})',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'mulmod',
        },
        {
            detail: 'keccak256(...) returns (bytes32):' +
                'compute the Ethereum-SHA-3 (Keccak-256) hash of the (tightly packed) arguments',
            insertText: 'keccak256(${1:x})',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'keccak256',
        },
        {
            detail: 'sha256(...) returns (bytes32):' +
                'compute the SHA-256 hash of the (tightly packed) arguments',
            insertText: 'sha256(${1:x})',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'sha256',
        },
        {
            detail: 'sha3(...) returns (bytes32):' +
                'alias to keccak256',
            insertText: 'sha3(${1:x})',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'sha3',
        },
        {
            detail: 'ripemd160(...) returns (bytes20):' +
                'compute RIPEMD-160 hash of the (tightly packed) arguments',
            insertText: 'ripemd160(${1:x})',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'ripemd160',
        },
        {
            detail: 'ecrecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) returns (address):' +
                'recover the address associated with the public key from elliptic curve signature or return zero on error',
            insertText: 'ecrecover(${1:hash}, ${2:v}, ${3:r}, ${4:s})',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'ecrecover',
        },
    ];
}
exports.GetGlobalFunctions = GetGlobalFunctions;
function GetContextualAutoCompleteByGlobalVariable(lineText, wordEndPosition) {
    if (isAutocompleteTrigeredByVariableName('block', lineText, wordEndPosition)) {
        return getBlockCompletionItems();
    }
    if (isAutocompleteTrigeredByVariableName('msg', lineText, wordEndPosition)) {
        return getMsgCompletionItems();
    }
    if (isAutocompleteTrigeredByVariableName('tx', lineText, wordEndPosition)) {
        return getTxCompletionItems();
    }
    if (isAutocompleteTrigeredByVariableName('abi', lineText, wordEndPosition)) {
        return getAbiCompletionItems();
    }
    return null;
}
exports.GetContextualAutoCompleteByGlobalVariable = GetContextualAutoCompleteByGlobalVariable;
function isAutocompleteTrigeredByVariableName(variableName, lineText, wordEndPosition) {
    const nameLength = variableName.length;
    if (wordEndPosition >= nameLength
        // does it equal our name?
        && lineText.substr(wordEndPosition - nameLength, nameLength) === variableName) {
        return true;
    }
    return false;
}
class AutocompleteByDot {
    constructor() {
        this.isVariable = false;
        this.isMethod = false;
        this.isArray = false;
        this.isProperty = false;
        this.parentAutocomplete = null; // could be a property or a method
        this.childAutocomplete = null;
        this.name = '';
    }
    getTopParent() {
        if (this.parentAutocomplete != null) {
            return this.parentAutocomplete.getTopParent();
        }
        return this;
    }
}
exports.AutocompleteByDot = AutocompleteByDot;
function getAutocompleteTriggerByDotVariableName(lineText, wordEndPosition) {
    let searching = true;
    let result = new AutocompleteByDot();
    //simpler way might be to find the first space or beginning of line
    //and from there split / match (but for now kiss or slowly)
    wordEndPosition = getArrayStart(lineText, wordEndPosition, result);
    if (lineText[wordEndPosition] == ')') {
        result.isMethod = true;
        let methodParamBeginFound = false;
        while (!methodParamBeginFound && wordEndPosition >= 0) {
            if (lineText[wordEndPosition] === '(') {
                methodParamBeginFound = true;
            }
            wordEndPosition = wordEndPosition - 1;
        }
    }
    if (!result.isMethod && !result.isArray) {
        result.isVariable = true;
    }
    while (searching && wordEndPosition >= 0) {
        let currentChar = lineText[wordEndPosition];
        if (isAlphaNumeric(currentChar) || currentChar === '_' || currentChar === '$') {
            result.name = currentChar + result.name;
            wordEndPosition = wordEndPosition - 1;
        }
        else {
            if (currentChar === ' ') { // we only want a full word for a variable / method // this cannot be parsed due incomplete statements
                searching = false;
                return result;
            }
            else {
                if (currentChar === '.') {
                    result.parentAutocomplete = getAutocompleteTriggerByDotVariableName(lineText, wordEndPosition - 1);
                    result.parentAutocomplete.childAutocomplete = result;
                }
            }
            searching = false;
            return result;
        }
    }
    return result;
}
function getArrayStart(lineText, wordEndPosition, result) {
    if (lineText[wordEndPosition] == ']') {
        result.isArray = true;
        let arrayBeginFound = false;
        while (!arrayBeginFound && wordEndPosition >= 0) {
            if (lineText[wordEndPosition] === '[') {
                arrayBeginFound = true;
            }
            wordEndPosition = wordEndPosition - 1;
        }
    }
    if (lineText[wordEndPosition] == ']') {
        wordEndPosition = getArrayStart(lineText, wordEndPosition, result);
    }
    return wordEndPosition;
}
function getAutocompleteVariableNameTrimmingSpaces(lineText, wordEndPosition) {
    let searching = true;
    let result = '';
    if (lineText[wordEndPosition] === ' ') {
        let spaceFound = true;
        while (spaceFound && wordEndPosition >= 0) {
            wordEndPosition = wordEndPosition - 1;
            if (lineText[wordEndPosition] !== ' ') {
                spaceFound = false;
            }
        }
    }
    while (searching && wordEndPosition >= 0) {
        let currentChar = lineText[wordEndPosition];
        if (isAlphaNumeric(currentChar) || currentChar === '_' || currentChar === '$') {
            result = currentChar + result;
            wordEndPosition = wordEndPosition - 1;
        }
        else {
            if (currentChar === ' ') { // we only want a full word for a variable // this cannot be parsed due incomplete statements
                searching = false;
                return result;
            }
            searching = false;
            return '';
        }
    }
    return result;
}
function isAlphaNumeric(str) {
    var code, i, len;
    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
}
;
function getBlockCompletionItems() {
    return [
        {
            detail: '(address): Current block miner’s address',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'coinbase',
        },
        {
            detail: '(bytes32): DEPRICATED In 0.4.22 use blockhash(uint) instead. Hash of the given block - only works for 256 most recent blocks excluding current',
            insertText: 'blockhash(${1:blockNumber});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'blockhash',
        },
        {
            detail: '(uint): current block difficulty',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'difficulty',
        },
        {
            detail: '(uint): current block gaslimit',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'gaslimit',
        },
        {
            detail: '(uint): current block number',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'number',
        },
        {
            detail: '(uint): current block timestamp as seconds since unix epoch',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'timestamp',
        },
    ];
}
function getTxCompletionItems() {
    return [
        {
            detail: '(uint): gas price of the transaction',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'gas',
        },
        {
            detail: '(address): sender of the transaction (full call chain)',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'origin',
        },
    ];
}
function getMsgCompletionItems() {
    return [
        {
            detail: '(bytes): complete calldata',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'data',
        },
        {
            detail: '(uint): remaining gas DEPRICATED in 0.4.21 use gasleft()',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'gas',
        },
        {
            detail: '(address): sender of the message (current call)',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'sender',
        },
        {
            detail: '(bytes4): first four bytes of the calldata (i.e. function identifier)',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'sig',
        },
        {
            detail: '(uint): number of wei sent with the message',
            kind: vscode_languageserver_1.CompletionItemKind.Property,
            label: 'value',
        },
    ];
}
function getAbiCompletionItems() {
    return [
        {
            detail: 'encode(..) returs (bytes): ABI-encodes the given arguments',
            insertText: 'encode(${1:arg});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'encode',
        },
        {
            detail: 'encodePacked(..) returns (bytes): Performes packed encoding of the given arguments',
            insertText: 'encodePacked(${1:arg});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'encodePacked',
        },
        {
            detail: 'encodeWithSelector(bytes4,...) returns (bytes): ABI-encodes the given arguments starting from the second and prepends the given four-byte selector',
            insertText: 'encodeWithSelector(${1:bytes4}, ${2:arg});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'encodeWithSelector',
        },
        {
            detail: 'encodeWithSignature(string,...) returns (bytes): Equivalent to abi.encodeWithSelector(bytes4(keccak256(signature), ...)`',
            insertText: 'encodeWithSignature(${1:signatureString}, ${2:arg});',
            insertTextFormat: 2,
            kind: vscode_languageserver_1.CompletionItemKind.Method,
            label: 'encodeWithSignature',
        },
    ];
}
//# sourceMappingURL=completionService.js.map