"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolidityCodeWalker = exports.DocumentContract = exports.Parameter = exports.StateVariable = exports.FunctionVariable = exports.StructVariable = exports.Variable = exports.Enum = exports.Struct = exports.Event = exports.Function = exports.Contract2 = exports.Using = exports.DeclarationType = exports.ParsedCode = void 0;
const vscode_uri_1 = require("vscode-uri");
const contractsCollection_1 = require("./model/contractsCollection");
const projectService_1 = require("./projectService");
const solparse = require("solparse-exp-jb");
class ParsedCode {
    isElementedSelected(element, offset) {
        if (element !== undefined && element !== null) {
            if (element.start <= offset && offset <= element.end)
                return true;
            ;
        }
        return false;
    }
}
exports.ParsedCode = ParsedCode;
class DeclarationType extends ParsedCode {
    static create(literal) {
        const declarationType = new DeclarationType();
        declarationType.initialise(literal);
        return declarationType;
    }
    initialise(literal) {
        this.element = literal;
        if (literal.members !== undefined && literal.members.length > 0) {
            this.name = literal.members[0];
        }
        else {
            this.name = literal.literal;
        }
        this.isArray = literal.array_parts.length > 0;
        this.isMapping = false;
        const literalType = literal.literal;
        if (typeof literalType.type !== 'undefined') {
            this.isMapping = literalType.type === 'MappingExpression';
            this.name = 'mapping'; // do something here
            // suffixType = '(' + this.getTypeString(literalType.from) + ' => ' + this.getTypeString(literalType.to) + ')';
        }
    }
}
exports.DeclarationType = DeclarationType;
class Using extends ParsedCode {
    constructor() {
        super(...arguments);
        this.forStar = false;
    }
    initialise(element, contract) {
        this.contract = contract;
        this.element = element;
        this.name = element.library;
        if (element.for === "*") {
            this.forStar = true;
            this.for = null;
        }
        else {
            this.for = DeclarationType.create(element.for);
        }
        this.location; //             
    }
}
exports.Using = Using;
class Contract2 extends ParsedCode {
    constructor() {
        super(...arguments);
        this.functions = [];
        this.enums = [];
        this.events = [];
        this.stateVariables = [];
        this.structs = [];
        this.constructorFunction = new Function();
        this.fallbackFunction = new Function();
        this.receiveFunction = new Function();
        this.extendsContracts = [];
        this.extendsContractNames = [];
        this.using = [];
    }
    initialise(element) {
        this.element = element;
        this.name = element.name;
        this.location; //
        this.contractType = element.type;
        this.initialiseChildren();
    }
    initialiseExtendContracts(contracts) {
        if (this.extendsContracts.length === 0 && this.extendsContractNames.length > 0) {
            this.extendsContractNames.forEach(contractName => {
                let contractMatched = contracts.find(x => x.name === contractName);
                if (contractMatched !== undefined && contractMatched !== null) {
                    contractMatched.initialiseExtendContracts(contracts);
                    this.extendsContracts.push(contractMatched);
                }
            });
        }
    }
    isConstructorSelected(offset) {
        let element = this.constructorFunction.element;
        return this.isElementedSelected(element, offset);
    }
    isFallbackSelected(offset) {
        let element = this.fallbackFunction.element;
        return this.isElementedSelected(element, offset);
    }
    isReceivableSelected(offset) {
        let element = this.receiveFunction.element;
        return this.isElementedSelected(element, offset);
    }
    getSelectedFunction(offset) {
        let selectedFunction = this.functions.find(x => {
            let element = x.element;
            if (element !== undefined || element !== null) {
                if (element.start <= offset && offset <= element.end)
                    return true;
                ;
            }
            return false;
        });
        if (selectedFunction === undefined) { //nothing
            if (this.isConstructorSelected(offset)) {
                selectedFunction = this.constructorFunction;
            }
            else {
                if (this.isFallbackSelected(offset)) {
                    selectedFunction = this.fallbackFunction;
                }
                else {
                    if (this.isReceivableSelected(offset)) {
                        selectedFunction = this.receiveFunction;
                    }
                }
            }
        }
        return selectedFunction;
    }
    getAllFunctions() {
        let returnItems = [];
        returnItems = returnItems.concat(this.functions);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllFunctions());
        });
        return returnItems;
    }
    getAllStructs() {
        let returnItems = [];
        returnItems = returnItems.concat(this.structs);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllStructs());
        });
        return returnItems;
    }
    getAllEnums() {
        let returnItems = [];
        returnItems = returnItems.concat(this.enums);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllEnums());
        });
        return returnItems;
    }
    getAllStateVariables() {
        let returnItems = [];
        returnItems = returnItems.concat(this.stateVariables);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllStateVariables());
        });
        return returnItems;
    }
    getAllEvents() {
        let returnItems = [];
        returnItems = returnItems.concat(this.events);
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllEvents());
        });
        return returnItems;
    }
    getAllUsing(type) {
        let returnItems = [];
        returnItems = returnItems.concat(this.using.filter(x => {
            if (x.forStar === true)
                return true;
            if (x.for !== null) {
                let validTypeName = false;
                if (x.for.name === type.name || (type.name === "address_payable" && x.for.name === "address")) {
                    validTypeName = true;
                }
                return x.for.isArray === type.isArray && validTypeName && x.for.isMapping === type.isMapping;
            }
            return false;
        }));
        this.extendsContracts.forEach(contract => {
            returnItems = returnItems.concat(contract.getAllUsing(type));
        });
        return returnItems.filter((v, i) => {
            return returnItems.map(mapObj => mapObj["name"]).indexOf(v["name"]) === i;
        });
    }
    initialiseChildren() {
        if (typeof this.element.is !== 'undefined' && this.element.is !== null) {
            this.element.is.forEach(isElement => {
                this.extendsContractNames.push(isElement.name);
            });
        }
        if (typeof this.element.body !== 'undefined' && this.element.body !== null) {
            this.element.body.forEach(contractElement => {
                if (contractElement.type === 'FunctionDeclaration') {
                    const functionContract = new Function();
                    functionContract.initialise(contractElement, this);
                    if (functionContract.name === functionContract.contract.name) {
                        this.constructorFunction = functionContract;
                    }
                    else {
                        this.functions.push(functionContract);
                    }
                }
                if (contractElement.type === 'ConstructorDeclaration') {
                    const functionContract = new Function();
                    functionContract.initialise(contractElement, this);
                    this.constructorFunction = functionContract;
                }
                if (contractElement.type === 'FallbackDeclaration') {
                    const functionContract = new Function();
                    functionContract.initialise(contractElement, this);
                    this.fallbackFunction = functionContract;
                }
                if (contractElement.type === 'ReceiveDeclaration') {
                    const functionContract = new Function();
                    functionContract.initialise(contractElement, this);
                    this.receiveFunction = functionContract;
                }
                if (contractElement.type === 'EventDeclaration') {
                    let eventContract = new Event();
                    eventContract.initialise(contractElement, this);
                    this.events.push(eventContract);
                }
                if (contractElement.type === 'StateVariableDeclaration') {
                    let stateVariable = new StateVariable();
                    stateVariable.initialise(contractElement, this);
                    this.stateVariables.push(stateVariable);
                }
                if (contractElement.type === 'EnumDeclaration') {
                    let enumContract = new Enum();
                    enumContract.initialise(contractElement, this);
                    this.enums.push(enumContract);
                }
                if (contractElement.type === 'StructDeclaration') {
                    let struct = new Struct();
                    struct.initialise(contractElement, this);
                    this.structs.push(struct);
                }
                if (contractElement.type === 'UsingStatement') {
                    let using = new Using();
                    using.initialise(contractElement, this);
                    this.using.push(using);
                }
            });
        }
    }
}
exports.Contract2 = Contract2;
class Function extends ParsedCode {
    constructor() {
        super(...arguments);
        this.input = [];
        this.output = [];
        this.variablesInScope = [];
    }
    initialise(element, contract) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; //
        this.initialiseParamters();
    }
    initialiseParamters() {
        this.input = Parameter.extractParameters(this.element.params);
        this.output = Parameter.extractParameters(this.element.returnParams);
    }
    findVariableDeclarationsInScope(offset, block) {
        if (this.element.is_abstract === false || this.element.is_abstract === undefined) {
            if (this.element.body !== 'undefined' && this.element.body.type === 'BlockStatement') {
                this.findVariableDeclarationsInInnerScope(offset, this.element.body);
            }
        }
    }
    findVariableDeclarationsInInnerScope(offset, block) {
        if (block !== undefined && block !== null) {
            if (this.isElementedSelected(block, offset)) {
                if (block.body !== 'undefined') {
                    block.body.forEach(blockBodyElement => {
                        if (blockBodyElement.type === 'ExpressionStatement') {
                            let expression = blockBodyElement.expression;
                            this.addVariableInScopeFromExpression(expression);
                        }
                        if (blockBodyElement.type === 'ForStatement') {
                            if (this.isElementedSelected(blockBodyElement, offset)) {
                                this.addVariableInScopeFromExpression(blockBodyElement.init);
                                this.findVariableDeclarationsInInnerScope(offset, blockBodyElement.body);
                            }
                        }
                        if (blockBodyElement.type === 'IfStatement') {
                            if (this.isElementedSelected(blockBodyElement, offset)) {
                                this.findVariableDeclarationsInInnerScope(offset, blockBodyElement.consequent);
                                this.findVariableDeclarationsInInnerScope(offset, blockBodyElement.alternate);
                            }
                        }
                    });
                }
            }
        }
    }
    addVariableInScopeFromExpression(expression) {
        let declarationStatement = null;
        if (expression.type === 'AssignmentExpression') {
            if (expression.left.type === 'DeclarativeExpression') {
                declarationStatement = expression.left;
            }
        }
        if (expression.type === 'DeclarativeExpression') {
            declarationStatement = expression;
        }
        if (declarationStatement !== null) {
            let variable = new FunctionVariable();
            variable.element = declarationStatement;
            variable.name = declarationStatement.name;
            variable.type = DeclarationType.create(declarationStatement.literal);
            variable.function = this;
            this.variablesInScope.push(variable);
        }
    }
}
exports.Function = Function;
class Event extends ParsedCode {
    constructor() {
        super(...arguments);
        this.input = [];
    }
    initialise(element, contract) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; //
        this.initialiseParamters();
    }
    initialiseParamters() {
        this.input = Parameter.extractParameters(this.element.params);
    }
}
exports.Event = Event;
class Struct extends ParsedCode {
    constructor() {
        super(...arguments);
        this.variables = [];
    }
    initialise(element, contract) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; // 
        if (this.element.body !== 'undefined') {
            this.element.body.forEach(structBodyElement => {
                if (structBodyElement.type === 'DeclarativeExpression') {
                    let variable = new StructVariable();
                    variable.element = structBodyElement;
                    variable.name = structBodyElement.name;
                    variable.type = DeclarationType.create(structBodyElement.literal);
                    variable.struct = this;
                    this.variables.push(variable);
                }
            });
        }
    }
}
exports.Struct = Struct;
class Enum extends ParsedCode {
    constructor() {
        super(...arguments);
        this.items = [];
    }
    initialise(element, contract) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; //
        element.members.forEach(member => { this.items.push(member); });
    }
}
exports.Enum = Enum;
class Variable extends ParsedCode {
}
exports.Variable = Variable;
class StructVariable extends Variable {
}
exports.StructVariable = StructVariable;
class FunctionVariable extends Variable {
}
exports.FunctionVariable = FunctionVariable;
class StateVariable extends Variable {
    initialise(element, contract) {
        this.contract = contract;
        this.element = element;
        this.name = element.name;
        this.location; //  
        this.type = DeclarationType.create(element.literal);
    }
}
exports.StateVariable = StateVariable;
class Parameter extends Variable {
    static extractParameters(params) {
        const parameters = [];
        if (typeof params !== 'undefined' && params !== null) {
            if (params.hasOwnProperty('params')) {
                params = params.params;
            }
            params.forEach(parameterElement => {
                const parameter = new Parameter();
                const type = DeclarationType.create(parameterElement.literal);
                parameter.element = parameterElement;
                parameter.type = type;
                if (typeof parameterElement.id !== 'undefined' && parameterElement.id !== null) { // no name on return parameters
                    parameter.name = parameterElement.id;
                }
                parameters.push(parameter);
            });
        }
        return parameters;
    }
}
exports.Parameter = Parameter;
class DocumentContract {
    constructor() {
        this.allContracts = [];
    }
}
exports.DocumentContract = DocumentContract;
class SolidityCodeWalker {
    constructor(rootPath, packageDefaultDependenciesDirectory, packageDefaultDependenciesContractsDirectory, remappings) {
        this.rootPath = rootPath;
        this.packageDefaultDependenciesDirectory = packageDefaultDependenciesDirectory;
        this.packageDefaultDependenciesContractsDirectory = packageDefaultDependenciesContractsDirectory;
        this.remappings = remappings;
        if (this.rootPath !== 'undefined' && this.rootPath !== null) {
            this.project = projectService_1.initialiseProject(this.rootPath, this.packageDefaultDependenciesDirectory, this.packageDefaultDependenciesContractsDirectory, this.remappings);
        }
    }
    getAllContracts(document, position) {
        let documentContract = new DocumentContract();
        const documentText = document.getText();
        const contractPath = vscode_uri_1.URI.parse(document.uri).fsPath;
        const contracts = new contractsCollection_1.ContractCollection();
        if (this.project !== undefined) {
            contracts.addContractAndResolveImports(contractPath, documentText, this.project);
        }
        const contract = contracts.contracts[0];
        const offset = document.offsetAt(position);
        documentContract = this.getSelectedContracts(documentText, offset, position.line);
        contracts.contracts.forEach(contractItem => {
            if (contractItem !== contract) {
                let contractsParsed = this.getContracts(contractItem.code);
                documentContract.allContracts = documentContract.allContracts.concat(contractsParsed);
            }
        });
        if (documentContract.selectedContract !== undefined && documentContract.selectedContract !== null) {
            documentContract.selectedContract.initialiseExtendContracts(documentContract.allContracts);
        }
        return documentContract;
    }
    findElementByOffset(elements, offset) {
        return elements.find(element => element.start <= offset && offset <= element.end);
    }
    getSelectedContracts(documentText, offset, line) {
        let contracts = new DocumentContract();
        try {
            const result = solparse.parse(documentText);
            let selectedElement = this.findElementByOffset(result.body, offset);
            result.body.forEach(element => {
                if (element.type === 'ContractStatement' || element.type === 'LibraryStatement' || element.type == 'InterfaceStatement') {
                    var contract = new Contract2();
                    contract.initialise(element);
                    if (selectedElement === element) {
                        contracts.selectedContract = contract;
                    }
                    contracts.allContracts.push(contract);
                }
            });
        }
        catch (error) {
            //if we error parsing (cannot cater for all combos) we fix by removing current line.
            const lines = documentText.split(/\r?\n/g);
            if (lines[line].trim() !== '') { //have we done it already?
                lines[line] = ''.padStart(lines[line].length, ' '); //adding the same number of characters so the position matches where we are at the moment
                let code = lines.join('\r\n');
                return this.getSelectedContracts(code, offset, line);
            }
        }
        return contracts;
    }
    getContracts(documentText) {
        let contracts = [];
        try {
            const result = solparse.parse(documentText);
            result.body.forEach(element => {
                if (element.type === 'ContractStatement' || element.type === 'LibraryStatement' || element.type == 'InterfaceStatement') {
                    var contract = new Contract2();
                    contract.initialise(element);
                    contracts.push(contract);
                }
            });
        }
        catch (error) {
            // gracefule catch
            // console.log(error.message);
        }
        return contracts;
    }
}
exports.SolidityCodeWalker = SolidityCodeWalker;
//# sourceMappingURL=codeWalkerService.js.map