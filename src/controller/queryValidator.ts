
import {validateMkey, validateOPTIONS, validateSkey} from "./optionsValidator";
import {QUERY,
	NEGATION,
	MCOMPARATOR,
	MCOMPARISON,
	MKEY,
	SCOMPARISON,
	SKEY, FILTER,
	IDSTRING,
	SFIELD,
	MFIELD,
	LOGICCOMPARISON,
	LOGIC
} from "./queryTypes";

function isValidJSON(jsonString: string,errors: string[]): boolean {

	try {
		JSON.parse(jsonString);
		return true;
	} catch (error) {
		errors.push("Invalid JSON");
		return false;
	}
}


export function validateQuery(query: QUERY,errors: string[]): boolean{
	let error: string;
	const parsedQuery: QUERY = query;
	let response: boolean;
	response = isValidJSON(query as unknown as string,errors);

	if(!response){

		return response;
	}

	// add logic to make sure that an error is return is a dataset does not exist
	response = validateWHERE(parsedQuery.WHERE,errors);
	if(!response){
		return  response;
	}
	response = validateOPTIONS(parsedQuery.OPTIONS,errors);
	if(!response){
		return response;
	}
	// logic to validate if a query references two different dataset ids
	// if(ids.size !== 1){
	// 	error = "Multiple data sets referenced";
	// 	errors.push(error);
	// 	return false;
	// }
	return  true;
}

function isValidMComparator(mcomp: MCOMPARATOR,errors: string[]): mcomp is MCOMPARATOR {
	const res: boolean = typeof  mcomp === "string" && ["LT", "GT", "EQ"].includes(mcomp);
	errors.push(`${mcomp as string} is not one of ["LT", "GT", "EQ"]`);
	return  false;
}

function isValidMComparison(mcomparison: MCOMPARISON,errors: string[]){
	let error: string;
	if(!mcomparison || typeof mcomparison !== "object"){
		error = "MCOMPARISON should be an object";
		errors.push(error);
		return false;
	}
	const keys = Object.keys(mcomparison);
	const compBody = Object.values(mcomparison);
	if(keys.length !== 1){
		error = "invalid MCOMPARISON key";
		errors.push(error);
		return false;

	}
	if(!isValidMComparator(keys[0] as MCOMPARATOR,errors)){
		error = "Invalid MCOMPARATOR should be one of LT, GT, EQ";
		errors.push(error);
		return false;
	}
	if(!compBody[0] || compBody.length !== 1){
		return false;
	}
	if(typeof  compBody[0] !== "object"){
		return false;
	}
	const mkey = Object.keys(compBody[0])[0];
	const mkeyValue =  Object.values(compBody[0])[0];
	return validateMkey(mkey as MKEY,errors) && (typeof mkeyValue === "number");
}

function isValidSComparison(scomp: SCOMPARISON,errors: string []): boolean{
	let error: string;
	if(!scomp || typeof scomp !== "object" ){
		error = "Invalid SCOMPARISON value, not an object";
		errors.push(error);
		return false;

	}
	const keys = Object.keys(scomp);
	if(keys.length > 1 || keys[0] !== "IS"){
		error = `Invalid key for SCOMPARISON , expected IS but got ${scomp}`;
		errors.push(error);
		return false;
	}else if(!scomp.IS){
		error = `Invalid key for SCOMPARISON , expected IS but got ${scomp}`;
		errors.push(error);
		return false;

	}else if(Object.keys(scomp.IS).length !== 1){
		error = "Invalid keys for SCOMPARISON , only SCOMPARISON expected";
		errors.push(error);
		return false;

	}else if(typeof Object.keys(scomp.IS)[0] !== "string"){
		error = "Invalid keys for SCOMPARISON , only SCOMPARISON expected";
		errors.push(error);
		return false;

	}else if((Object.values(scomp.IS).length !== 1)){
		error = "wrong length for value of skey";
		errors.push(error);
		return false;

	}else if( typeof Object.values(scomp.IS)[0] !== "string"){
		error = `expected skey value to be a string, got ${scomp.IS}`;
		errors.push(error);
		return false;

	}else{
		const ISBody = scomp.IS;
		const skey = Object.values(ISBody)[0];
		const inputString = Object.values(ISBody)[0];

		return validateInputString(inputString,errors) && validateSkey(skey as SKEY,errors);
	}

}


function isValidLogic(logic: LOGIC,errors: string[]): logic is LOGIC{
	let error: string;
	const possibleValues = ["AND","OR"];
	if(!possibleValues.includes(logic)){
		error = `${logic} is not one of "AND","OR"`;
		errors.push(error);
		return false;
	}
	return true;
}

function isValidLogiComparison(logicComp: LOGICCOMPARISON,errors: string[]): logicComp is LOGICCOMPARISON{
	let error: string;
	if(!logicComp || typeof logicComp !== "object"){
		error = `${logicComp} is not an object`;
		errors.push(error);
		return false;
	}
	const keys = Object.keys(logicComp);
	const values = Object.values(logicComp);
	if(keys.length === 0){
		error = `${logicComp} is invalid`;
		return false;
	}
	return  isValidLogic(keys[0] as LOGIC,errors) && validateFILTERs(values[0],errors);
}

function validateNegation(negation: NEGATION,errors: string[]): negation is NEGATION{
	let error: string;
	if(!negation || !negation.NOT){
		error = `${negation} is invalid`;
		errors.push(error);
		return false;
	}
	if(typeof negation.NOT !== "object"){
		error = `${negation} not an object`;
		errors.push(error);
		return false;
	}
	return validateFILTER(negation.NOT,errors);
}

function getFilterType(filter: FILTER): string{
	const filterKey = Object.keys(filter)[0];
	switch(filterKey){
		case "OR":
			return "LOGICCOMPARISON";
		case "AND":
			return "LOGICCOMPARISON";
		case "NOT":
			return "NEGATION";
		case "IS":
			return "SCOMPARISON";
		case "LT":
		case "GT":
		case "EQ":
			return "MCOMPARISON";
		default:
			return "NONE";
	}
}

function validateWHERE(where: any,errors: string[]): boolean{
	let error: string;
	if(typeof where !== "object"){
		error = "WHERE expects an object type";
		errors.push(error);
		return false;
	}else if(where === {} as Record<never,never>){
		return true;
	}else{
		return validateFILTER( where as FILTER,errors);
	}
}

function validateFILTER(filter: FILTER,errors: string[]): boolean{
	let error: string;
	type ValidatorFunction = (filter: any,errors: string[]) => boolean;
	const validatorsMap: Record<string,ValidatorFunction> = {
		NEGATION: validateNegation,
		SCOMPARISON: isValidSComparison,
		MCOMPARISON: isValidMComparison,
		LOGICCOMPARISON: isValidLogiComparison,

	};
	const keys = Object.keys(filter);
	if(keys.length > 1){
		error = "More than 1 filter provided, should be 1";
		errors.push(error);
		return false;
	}else if(keys[0]) {
		error = "Should provide a valid filter";
		errors.push(error);
		return false;
	}else{
		const filterType: string = getFilterType(filter);
		if(filterType === "NONE"){
			error = "invalid filter found";
			errors.push(error);
			return false;
		}
		const validator: ValidatorFunction = validatorsMap[filterType];
		return validator(filter,errors) ;
	}

}

function validateFILTERs(filters: FILTER[],errors: string[]): boolean{
	for(const filter of filters){
		if(!validateFILTER(filter,errors)){
			return false;
		}
	}
	return true;
}


export function validateIDString(str: IDSTRING,errors: string[]): boolean {
	let error: string;
	const pattern = new RegExp("[^_]+");
	// ids.add(str);
	if(!pattern.test(str)){
		error = `invalid idstring ${str}`;
		errors.push(error);
		return false;
	}
	return true;
}


export function validateInputString(str: string,errors: string[]): boolean {
	let error: string;
	const pattern = new RegExp("[^*]*");
	if(!pattern.test(str)){
		error = `invalid inputstring ${str}`;
		errors.push(error);
		return false;
	}
	return true;
}

