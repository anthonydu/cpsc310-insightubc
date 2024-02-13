import {IDSTRING, MFIELD, MKEY, OPTIONS, SFIELD, SKEY} from "./queryTypes";
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
		const mkfields: string[] = ["avg", "pass", "fail", "audit", "year"];
		const sfields: string[] = ["dept", "id", "instructor", "title", "uuid"];
		if (!mkfields.includes(parts[1]) && !sfields.includes(parts[1])) {
			errors.push(`invalid skey or mkey found- ${parts[1]}`);
			return false;
		}
		if (mkfields.includes(parts[1])) {
			const mkeyvalid = validateMkey(column as MKEY, errors, ids);
			if (!mkeyvalid) {
				return false;
			}
		}
		if (sfields.includes(parts[1])) {
			const skeyvalid = validateSkey(column as SKEY, errors, ids);
			if (!skeyvalid) {
				return false;
			}
		}
	}
	return validateORDER(options, columns, errors);
}
function validateORDER(options: OPTIONS, columns: string[], errors: string[]) {
	let error: string;
	if (!options.ORDER && Object.keys(options).length > 1) {
		errors.push(`Invalid ORDER key ${Object.keys(options)[1]}`);
		return false;
	}
	if (options.ORDER && !validateInputString(options.ORDER, errors)) {
		return false;
	}

	if (options.ORDER && !columns.includes(options.ORDER as string)) {
		error = `ORDER value ${options.ORDER} must be in OPTIONS.COLUMNS`;
		errors.push(error);
		return false;
	}
	return true;
}
// export type SFIELD = "dept" | "id" | "instructor" | "title" | "uuid";
export function validateSfield(sfield: SFIELD, errors: string[]): sfield is SFIELD {
	let error: string;
	const possibleValues: string[] = ["dept", "id", "instructor", "title", "uuid"];
	if (!possibleValues.includes(sfield as string)) {
		error = `invalid sfield value ${sfield}, should be one of ["dept", "id" , "instructor" ,"title" , "uuid"]`;
		errors.push(error);
		return false;
	}
	return true;
}

// export type MFIELD= "avg" | "pass" | "fail" | "audit" | "year";
export function validateMfield(mfield: MFIELD, errors: string[]): mfield is MFIELD {
	const possibleValues = ["avg", "pass", "fail", "audit", "year"];
	let error: string;

	if (!possibleValues.includes(mfield as string)) {
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
