import {// QUERY,
	// MCOMPARATOR,
	// MCOMPARISON,
	MKEY,
	// SCOMPARISON,
	SKEY,
	// FILTER,
	IDSTRING,
	SFIELD,
	MFIELD,
	OPTIONS
} from "./queryTypes";
import {validateIDString} from "./queryValidator";

export function validateOPTIONS(options: OPTIONS,errors: string[],ids: string[]): options is OPTIONS{
	let error: string;
	if(!options || typeof options !== "object"){
		error = "Invalid type for OPTIONS, expected an object";
		errors.push(error);
		return false;
	}
	if(!options.COLUMNS){
		error = "OPTIONS missing COLUMNS";
		errors.push(error);
	}
	if(!Array.isArray(options.COLUMNS)){
		error = "COLUMNS must be an array";
		errors.push(error);
		return false;
	}
	const columns: string[] = options.COLUMNS;
	for(const column of columns){

		const delimiter = "_";
		const parts = column.split(delimiter);
		const requiredLength: number = 2;

		if(parts.length !== requiredLength ){
			error = `${column} is not a valid column option`;
			errors.push(error);
			return false;
		}

		const mkfields: string[] = ["avg", "pass","fail","audit","year"] ;
		const sfields: string[] = ["dept","id" ,"instructor" ,"title" , "uuid"];

		if(mkfields.includes(parts[1])){
			return validateMkey(column as MKEY,errors,ids);
		}

		if(sfields.includes(parts[1])){
			return validateSkey(column as SKEY,errors,ids);
		}

	}
	if(options.ORDER && !columns.includes(options.ORDER as string)){
		error = `ORDER value ${options.ORDER} must be in OPTIONS.COLUMNS`;
		errors.push(error);
		return false;
	}
	return true;
}
// export type SFIELD = "dept" | "id" | "instructor" | "title" | "uuid";
export function validateSfield(sfield: SFIELD,errors: string[]): sfield is SFIELD {
	let error: string;
	const possibleValues: string[] = ["dept", "id" , "instructor" ,"title" , "uuid"];
	if(!possibleValues.includes(sfield)){
		error = `invalid sfield value ${sfield}, should be one of ["dept", "id" , "instructor" ,"title" , "uuid"]`;
		errors.push(error);
		return false;

	}
	return true;
}

// export type MFIELD= "avg" | "pass" | "fail" | "audit" | "year";
export function validateMfield(mfield: MFIELD,errors: string[]): mfield is MFIELD {
	const possibleValues = ["avg","pass","fail","audit","year"];
	let error: string;

	if(!possibleValues.includes(mfield)){
		error = `invalid sfield value ${mfield}, should be one of  ["avg","pass","fail","audit","year"]`;
		errors.push(error);
		return false;
	}
	return true;
}

// export type SKEY = `"${IDSTRING}_${SFIELD}"`;
export function validateSkey(skey: SKEY,errors: string[],ids: string[]): skey is SKEY {
	let error: string;
	const delimiter = "_";
	const parts = skey.split(delimiter);
	const requiredLength: number = 2;
	if(parts.length !== requiredLength){
		error = `invalid skey ${skey}`;
		errors.push(error);
		return false;
	}
	return validateIDString(parts[0] as IDSTRING,errors,ids) && validateSfield(parts[1] as SFIELD,errors);
}

// export type MKEY = `"${IDSTRING}_${MFIELD}"`;
export function validateMkey(mkey: MKEY,errors: string[],ids: string[]): boolean {
	const delimiter = "_";
	const parts = mkey.split(delimiter);
	const requiredLength: number = 2;
	if(parts.length !== requiredLength){
		let error: string;
		error = `invalid mkey ${mkey}`;
		errors.push(error);
		return false;
	}
	return validateIDString(parts[0],errors,ids) && validateMfield(parts[1] as MFIELD,errors);
}


