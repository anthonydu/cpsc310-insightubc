import {validateMkey, validateSkey} from "./optionsValidator";
import {ANYKEY, APPLY, APPLYRULE, APPLYTOKEN, IDSTRING, KEY,
	MKEY, SKEY, TRANSFORMATIONS, applyTokens} from "./queryTypes";


/**
 *
 * "TRANSFORMATIONS": {
 *
 * "GROUP": ["rooms_shortname"],
 *
 * "APPLY": [{
 *
 * "maxSeats": {
 *
 * "MAX": "rooms_seats"
 *
 * }
 *
 * }]
 *
 * }
 */
export function validateTransformations(tf: TRANSFORMATIONS,columns: ANYKEY[], errors: string[],ids: string[]): boolean{
	const apply = tf.APPLY;
	if(!validateApply(apply,errors,ids)){
		return false;
	}else if(!validateGroup(tf,errors,ids)){
		return false;
	}


	return true;
}


function validateGroup(transformations: TRANSFORMATIONS, errors: string[],ids: string[]): boolean{
	const group = transformations.GROUP;
	console.log(group);
	if(group === undefined || group === null){
		errors.push("Invalid value for GROUP");
		return false;
	}
	if(group.length <= 0){
		errors.push("GROUP must be a non empty array");
		return false;
	}


	return true;
}


function validateApply(apply: APPLYRULE[],errors: string[],ids: string[]): boolean{
	if(!Array.isArray(apply)){
		errors.push("APPLY must be a list of Apply Rules");
		return false;
	}else if(apply.length <= 0){
		// APPLY is allowed to be empty
		return true;
	}
	const applyKeys: string[] = [];
	// The applykey in an APPLYRULE should be unique, so no two APPLYRULEs should share an applykey with the same name.
	for( const rule of apply){
		const key = Object.keys(rule)[0];
		if(applyKeys.includes(key)){
			errors.push("Duplicate apply key found");
			return false;
		}

		applyKeys.push(key);

		if(!validateApplyRule(rule,errors,ids)){
			return false;
		}
	}
	return true;
}

/**
 *
 * {
 *
 * "maxSeats": {
 *
 * "MAX": "rooms_seats"
 *
 * }
 *
 */
function validateApplyRule(applyRule: APPLYRULE,errors: string[],ids: string[]){
	const applyKeys = Object.keys(applyRule);
	if(applyKeys.length > 1 || applyKeys.length <= 0){
		errors.push("Apply rule must be an object with only one key");
		return false;
	}else if(!validateApplyKey(applyKeys[0],errors,ids)){
		errors.push(`Invalid apply key ${applyKeys[0]}`);
		return false;
	}
	const values = Object.values(applyRule);
	if(values.length > 1 || values.length <= 0){
		errors.push("Apply rule value must be an object with only one key");
		return false;
	}
	if(!validateApplyRuleValue(values[0] as Record<APPLYTOKEN,KEY>,errors,ids)){
		return false;
	}

	return true;
}

function validateApplyRuleValue(value: Record<APPLYTOKEN,KEY>,errors: string[],ids: string[]): boolean{
	const numericOps = ["MAX","MIN","SUM","AVG"];
	const applyToken = Object.keys(value)[0];
	if(!applyToken){
		errors.push(`Missing apply token:n ${applyToken} given`);
		return false;
	}else if(!applyTokens.includes(applyToken)){
		errors.push(`Invalid apply token:n ${applyToken} given`);
		return false;
	}
	const key: KEY = Object.values(value)[0];
	if(!key){
		errors.push(`Invalid key for apply token: ${applyToken}`);
		return false;
	}
	// MAX/MIN/AVG/SUM should only be requested for numeric keys. COUNT can be requested for all keys.
	if(numericOps.includes(applyToken)){
		return validateMkey(key as MKEY,errors,ids);
	}

	return validateSkey(key as SKEY,errors,ids);
}

export function getApplyKeys(apply: APPLY): string[]{
	const applyKeys: string[] = [];
	for(const rule of apply){
		applyKeys.push(Object.keys(rule)[0]);
	}
	return applyKeys;
}
export function validateApplyKey(str: IDSTRING, errors: string[], ids: string[]): boolean {
	let error: string;
	const pattern = new RegExp("[^_]+");
	if (!pattern.test(str)) {
		error = `invalid applyKey ${str}`;
		errors.push(error);
		return false;
	}
	return true;
}
