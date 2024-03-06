import {IDSTRING, MFIELD, MKEY, OPTIONS, SFIELD, SKEY,ORDER,skeys, mkeys} from "./queryTypes";
import {validateIDString, validateInputString} from "./queryValidator";

export function validateOPTIONS(options: OPTIONS, errors: string[], ids: string[]): options is OPTIONS {
	let error: string;
	if (!options) {
		error = "Invalid type for OPTIONS, expected an object";
		errors.push(error);
		return false;
	}
	if (!options.COLUMNS || !Array.isArray(options.COLUMNS)) {
		error = "OPTIONS missing COLUMNS";
		errors.push(error);
		return false;
	}
	const columns: string[] = options.COLUMNS;
	if (columns.length < 1) {
		error = "COLUMNS must not be empty";
		errors.push(error);
		return false;
	}
	for (const column of columns) {
		const delimiter = "_";
		const parts = column.split(delimiter);
		const requiredLength: number = 2;

		if (parts.length < requiredLength) {
			error = `${column} is not a valid column option`;
			errors.push(error);
			return false;
		}
		ids.push(parts[0]);
		if (!mkeys.includes(parts[1]) && !skeys.includes(parts[1])) {
			errors.push(`invalid skey or mkey found- ${parts[1]}`);
			return false;
		}
		if (mkeys.includes(parts[1])) {
			const mkeyvalid = validateMkey(column as MKEY, errors, ids);
			if (!mkeyvalid) {
				return false;
			}
		}
		if (skeys.includes(parts[1])) {
			const skeyvalid = validateSkey(column as SKEY, errors, ids);
			if (!skeyvalid) {
				return false;
			}
		}
	}
	return validateORDER(options, columns, errors);
}

function hasOnlyDirAndKeys(obj: any): obj is ORDER {
	return typeof obj === "object" &&
           obj !== null &&
           "dir" in obj &&
           "keys" in obj &&
           Object.keys(obj).length === 2; // Ensure no extra properties
}
function validateORDER(options: OPTIONS,columns: string[],errors: string[]){
	let error: string;
	if(!options.ORDER){
		errors.push(`Invalid ORDER key ${Object.keys(options)[1]}`);
		return false;
	}
	if(typeof options.ORDER === "string" && !validateInputString(options.ORDER,errors)){
		return false;
	}else if(typeof options.ORDER === "string" && !columns.includes(options.ORDER as string)){
		error = `ORDER value ${options.ORDER} must be in OPTIONS.COLUMNS`;
		errors.push(error);
		return false;
	}else if(!hasOnlyDirAndKeys(options.ORDER)){
		errors.push(`Invalid order object given : ${JSON.stringify(options.ORDER)}`);
		return false;
	}else if(options.ORDER.dir !== "UP" && options.ORDER.dir !== "DOWN"){
		errors.push(`ORDER.dir must be one of UP and DOWN, found ${options.ORDER.dir} instead`);
		return false;
	}else if(!Array.isArray(options.ORDER.keys)){
		errors.push("Order keys must be an array");
		return false;
	}else{
		for(const key of options.ORDER.keys){
			if(!options.COLUMNS.includes(key)){
				errors.push("Keys in ORDER must be in COLUMNS");
				return false;
			}
		}
	}

	return true;
}

export function validateSfield(sfield: SFIELD, errors: string[]): sfield is SFIELD {
	let error: string;

	if (!skeys.includes(sfield as string)) {
		error = `invalid sfield value ${sfield}, should be one of ["dept", "id" , "instructor" ,"title" , "uuid"]`;
		errors.push(error);
		return false;
	}
	return true;
}


export function validateMfield(mfield: MFIELD, errors: string[]): mfield is MFIELD {

	let error: string;

	if (!mkeys.includes(mfield as string)) {
		error = `invalid sfield value ${mfield}, should be one of  ["avg","pass","fail","audit","year"]`;
		errors.push(error);
		return false;
	}
	return true;
}

// export type SKEY = `"${IDSTRING}_${SFIELD}"`;
export function validateSkey(skey: SKEY, errors: string[], ids: string[]): skey is SKEY {
	let error: string;
	const delimiter = "_";
	const parts = skey.split(delimiter);
	const requiredLength: number = 2;
	if (parts.length !== requiredLength) {
		error = `invalid skey ${skey}`;
		errors.push(error);
		return false;
	}
	ids.push(parts[0]);
	return validateIDString(parts[0] as IDSTRING, errors, ids) && validateSfield(parts[1] as SFIELD, errors);
}

// export type MKEY = `"${IDSTRING}_${MFIELD}"`;
export function validateMkey(mkey: MKEY, errors: string[], ids: string[]): boolean {
	const delimiter = "_";
	const parts = mkey.split(delimiter);
	const requiredLength: number = 2;
	if (parts.length !== requiredLength) {
		let error: string;
		error = `invalid mkey ${mkey}`;
		errors.push(error);
		return false;
	}
	ids.push(parts[0]);
	return validateIDString(parts[0], errors, ids) && validateMfield(parts[1] as MFIELD, errors);
}
