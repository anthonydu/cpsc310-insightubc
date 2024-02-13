import {validateMkey, validateOPTIONS, validateSkey} from "./optionsValidator";
import {
	FILTER,
	IDSTRING,
	LOGIC,
	LOGICCOMPARISON,
	MCOMPARATOR,
	MCOMPARISON,
	MKEY,
	NEGATION,
	QUERY,
	SCOMPARISON,
	SKEY,
} from "./queryTypes";

function isValidJSON(jsonString: string, errors: string[]): boolean {
	try {
		JSON.parse(JSON.stringify(jsonString));

		return true;
	} catch (error) {
		errors.push("Invalid JSON");
		return false;
	}
}

export function validateQuery(query: QUERY, errors: string[], ids: string[]): boolean {
	let error: string;
	const parsedQuery: QUERY = query;
	let response: boolean;
	if (!query) {
		return false;
	}
	response = isValidJSON(query as unknown as string, errors);

	if (!response) {
		return response;
	}

	// add logic to make sure that an error is return is a dataset does not exist
	response = validateWHERE(parsedQuery.WHERE, errors, ids);
	if (!response) {
		return response;
	}
	response = validateOPTIONS(parsedQuery.OPTIONS, errors, ids);
	if (!response) {
		return response;
	}

	return true;
}

function isValidMComparator(mcomp: MCOMPARATOR, errors: string[], ids: string[]): mcomp is MCOMPARATOR {
	const possibleValues = ["LT", "GT", "EQ"];
	return possibleValues.includes(mcomp as string);
}

function isValidMComparison(mcomparison: MCOMPARISON, errors: string[], ids: string[]) {
	let error: string;
	if (!mcomparison || typeof mcomparison !== "object") {
		error = "MCOMPARISON should be an object";
		errors.push(error);
		return false;
	}
	const keys = Object.keys(mcomparison);
	const compBody = Object.values(mcomparison)[0];

	if (keys.length !== 1) {
		error = "invalid MCOMPARISON key";
		errors.push(error);
		return false;
	}
	if (Object.keys(compBody).length < 1) {
		error = `missing body for ${keys[0]}`;
		errors.push(error);
		return false;
	}
	if (!isValidMComparator(keys[0] as MCOMPARATOR, errors, ids)) {
		error = "Invalid MCOMPARATOR should be one of LT, GT, EQ";
		errors.push(error);
		return false;
	}
	if (typeof compBody !== "object") {
		return false;
	}

	const mkey = Object.keys(compBody)[0];
	const mkeyValue = Object.values(compBody)[0];
	return validateMkey(mkey as MKEY, errors, ids) && typeof mkeyValue === "number";
}

function isValidSComparison(scomp: SCOMPARISON, errors: string[], ids: string[]): boolean {
	let error: string;
	if (!scomp || typeof scomp !== "object") {
		error = "Invalid SCOMPARISON value, not an object";
		errors.push(error);
		return false;
	}
	const keys = Object.keys(scomp);
	if (keys.length > 1 || keys[0] !== "IS") {
		error = `Invalid key for SCOMPARISON , expected IS but got ${scomp}`;
		errors.push(error);
		return false;
	} else if (!scomp.IS) {
		error = `Invalid key for SCOMPARISON , expected IS but got ${scomp}`;
		errors.push(error);
		return false;
	} else if (Object.keys(scomp.IS).length !== 1) {
		error = "Invalid keys for SCOMPARISON , only SCOMPARISON expected";
		errors.push(error);
		return false;
	} else if (typeof Object.keys(scomp.IS)[0] !== "string") {
		error = "Invalid keys for SCOMPARISON , only SCOMPARISON expected";
		errors.push(error);
		return false;
	} else if (Object.values(scomp.IS).length !== 1) {
		error = "wrong length for value of skey";
		errors.push(error);
		return false;
	} else if (typeof Object.values(scomp.IS)[0] !== "string") {
		error = `expected skey value to be a string, got ${scomp.IS}`;
		errors.push(error);
		return false;
	} else {
		const ISBody = scomp.IS;
		const skey = Object.keys(ISBody)[0];
		const inputString = Object.values(ISBody)[0];

		return validateInputString(inputString, errors) && validateSkey(skey as SKEY, errors, ids);
	}
}

function isValidLogic(logic: LOGIC, errors: string[]): logic is LOGIC {
	let error: string;
	const possibleValues = ["AND", "OR"];
	if (!possibleValues.includes(logic)) {
		error = `${logic} is not one of "AND","OR"`;
		errors.push(error);
		return false;
	}
	return true;
}

function isValidLogiComparison(
	logicComp: LOGICCOMPARISON,
	errors: string[],
	ids: string[]
): logicComp is LOGICCOMPARISON {
	let error: string;
	if (!logicComp || typeof logicComp !== "object") {
		error = `${JSON.stringify(logicComp)} is not an object`;
		errors.push(error);
		return false;
	}
	const keys = Object.keys(logicComp);
	const values = Object.values(logicComp);
	const firstKey = keys[0];
	const firstValue = values[0];
	const possibleValues = ["OR", "AND"];

	if (keys.length === 0) {
		error = `${JSON.stringify(logicComp)} is invalid`;
		errors.push(error);
		return false;
	}
	if (!possibleValues.includes(firstKey)) {
		error = `${JSON.stringify(logicComp)} is invalid`;
		errors.push(error);
		return false;
	}
	if (firstKey === "AND" && !Array.isArray(firstValue)) {
		error = `AND should be an array-provided type ${typeof firstValue}`;
		errors.push(error);
		return false;
	}
	if (firstKey === "AND" && firstValue.length < 1) {
		error = "`AND should not be empty`";
		errors.push(error);
		return false;
	}
	if (firstKey === "OR" && !Array.isArray(firstValue)) {
		error = `OR should be an array-provided type ${typeof firstValue}`;
		errors.push(error);
		return false;
	}
	if (firstKey === "OR" && firstValue.length < 1) {
		error = "`OR should not be empty`";
		errors.push(error);
		return false;
	}
	return isValidLogic(firstKey as LOGIC, errors) && validateFILTERs(firstValue, errors, ids);
}

function validateNegation(negation: NEGATION, errors: string[], ids: string[]): negation is NEGATION {
	let error: string;
	if (!negation || !negation.NOT) {
		error = `${JSON.stringify(negation)} is invalid for NOT`;
		errors.push(error);
		return false;
	}
	if (typeof negation.NOT !== "object") {
		error = `${JSON.stringify(negation)} not an object-negation must be an object`;
		errors.push(error);
		return false;
	}
	return validateFILTER(negation.NOT, errors, ids);
}

export function getFilterType(filter: FILTER): string {
	const filterKey = Object.keys(filter)[0];
	switch (filterKey) {
		case "OR":
			return "LOGICCOMPARISON";
		case "AND":
			return "LOGICCOMPARISON";
		case "NOT":
			return "NEGATION";
		case "IS":
			return "SCOMPARISON";
		case "LT":
			return "MCOMPARISON";
		case "GT":
			return "MCOMPARISON";
		case "EQ":
			return "MCOMPARISON";
		default:
			return "NONE";
	}
}

function validateWHERE(where: any, errors: string[], ids: string[]): boolean {
	let error: string;
	if (typeof where !== "object") {
		error = "WHERE expects an object type";
		errors.push(error);
		return false;
	} else if (Array.isArray(where)) {
		error = "WHERE expects should not be an array type";
		errors.push(error);
		return false;
	} else if (Object.keys(where).length < 1) {
		return true;
	} else {
		return validateFILTER(where as FILTER, errors, ids);
	}
}

function validateFILTER(filter: FILTER, errors: string[], ids: string[]): boolean {
	let error: string;
	type ValidatorFunction = (filter: any, errors: string[], ids: string[]) => boolean;
	const validatorsMap: Record<string, ValidatorFunction> = {
		NEGATION: validateNegation,
		SCOMPARISON: isValidSComparison,
		MCOMPARISON: isValidMComparison,
		LOGICCOMPARISON: isValidLogiComparison,
	};
	const keys = Object.keys(filter);
	if (keys.length > 1) {
		error = "More than 1 filter provided, should be 1";
		errors.push(error);
		return false;
	} else if (keys.length < 1) {
		error = "Should provide a valid filter";
		errors.push(error);
		return false;
	} else {
		const filterType: string = getFilterType(filter);
		if (filterType === "NONE") {
			error = "invalid filter found";
			errors.push(error);
			return false;
		}
		const validator: ValidatorFunction = validatorsMap[filterType];
		return validator(filter, errors, ids);
	}
}

function validateFILTERs(filters: FILTER[], errors: string[], ids: string[]): boolean {
	for (const filter of filters) {
		if (!validateFILTER(filter, errors, ids)) {
			return false;
		}
	}
	return true;
}

export function validateIDString(str: IDSTRING, errors: string[], ids: string[]): boolean {
	let error: string;
	const pattern = new RegExp("[^_]+");
	if (!pattern.test(str)) {
		error = `invalid idstring ${str}`;
		errors.push(error);
		return false;
	}
	ids.push(str);
	return true;
}

export function validateInputString(str: string, errors: string[]): boolean {
	let error: string;
	const pattern = new RegExp("[^*]*");
	if (str.length > 2) {
		const trimmed = str.substring(1, str.length - 1);
		if (trimmed.includes("*")) {
			return false;
		}
	}
	if (!pattern.test(str)) {
		error = `invalid inputstring ${str}`;
		errors.push(error);
		return false;
	}
	return true;
}
