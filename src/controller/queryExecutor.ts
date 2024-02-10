import {InsightResult} from "./IInsightFacade";
import {SCOMPARISON,
	// MCOMPARATOR,
	MCOMPARISON,
	FILTER,
	Section,
	LOGICCOMPARISON,
	NEGATION} from "./queryTypes";
import {getFilterType} from "./queryValidator";

function IS(scomp: SCOMPARISON,section: Section): boolean {
	// query will be validated before it arrives here,
	// we can therefore be sure that the line below will not produce an error
	const body: Record<string,string> = Object.values(scomp)[0];
	const skey: string = Object.keys(body)[0];
	const svalue: string = body[skey];
	const delimiter: string = "_";
	const parts: string[] = skey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: string = getValueByFieldName(section,sfield as keyof Section) as string;

	const match = matchPattern(svalue,fieldValue as string);
	// console.log("INPUT_STRING: ",svalue);
	// console.log("FIELD_VALUE: ",fieldValue);
	// console.log("MATCH: ",match);
	return match;


}

function EQ(mcomp: MCOMPARISON,section: Section): boolean{
	const body: any = mcomp.EQ;
	if(!body){
		return false;
	}
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section,sfield as keyof Section) as number;

	return fieldValue === mvalue;
}

function GT(mcomp: MCOMPARISON,section: Section): boolean {
	const body: any = mcomp.GT;
	if(!body){
		return false;
	}
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section,sfield as keyof Section) as number;
	// console.log(mcomp);
	// console.log("GREATER THAN: ",fieldValue > mvalue,mkey, "--",mvalue,"--",fieldValue);
	return fieldValue > mvalue;
}

function LT(mcomp: MCOMPARISON, section: Section): boolean {
	const body: any = mcomp.LT;
	if(!body){
		return false;
	}
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section,sfield as keyof Section) as number;
	// console.log(mcomp);
	// console.log("LESS THAN: ",fieldValue < mvalue,mkey, "--",mvalue,"--",fieldValue);
	return fieldValue < mvalue;
}

function NOT(negation: NEGATION,section: Section): boolean {
	const filter: FILTER = negation.NOT;

	return !FILTER_DATA(filter,section);
}

export function orderResults(order: string,result: InsightResult[]){

	if(result.length <= 0){
		return ;
	}

	// Sorting logic based on the 'order' parameter
	result.sort((a: InsightResult, b: InsightResult) => {
        // Ensure that the properties exist in both a and b
		const cond1: boolean = a[order] !== null && a[order] !== undefined ;
		const cond2: boolean = b[order] !== null && b[order] !== undefined ;
		// if (cond1 && cond2) {
            // If the properties are numeric, compare them as numbers
		if (typeof a[order] === "number" && typeof b[order] === "number") {
			return (a[order] as number) - (b[order] as number);
		}
            // If the properties are strings, compare them as strings
		if (typeof a[order] === "string" && typeof b[order] === "string") {
			return String(a[order]).localeCompare(String(b[order]));
		}
		// }
        // If the properties are not comparable, leave the order unchanged
		return 0;
	});
}

function AND(logicComp: LOGICCOMPARISON,section: Section): boolean{
	const and = logicComp.AND;
	if(!and){
		return false;
	}
	return and.every((condition) => FILTER_DATA(condition, section));


}

function OR(logicComp: LOGICCOMPARISON,section: Section): boolean{
	const or = logicComp.OR;
	if(!or){
		return false;
	}
	return or.some((condition) => FILTER_DATA(condition, section));


}

export function FILTER_DATA(filter: any,section: Section): boolean{
	const mcomp = "MCOMPARISON";
	const scomp = "SCOMPARISON";
	const logic = "LOGICCOMPARISON";
	const negation = "NEGATION";
	// if(section.uuid === "65068" || section.uuid as unknown as number === 65_068 ){
	// 	console.log(section,section.avg,logicComparison(filter as unknown as LOGICCOMPARISON, section));
	// }
	const queryType = getFilterType(filter);
	// console.log(queryType,JSON.stringify(filter));
	if (queryType === logic) {
		return logicComparison(filter as unknown as LOGICCOMPARISON, section);
	} else if (queryType === negation) {
		return NOT(filter as NEGATION, section);
	} else if (queryType === scomp) {
		return scomparison(filter as SCOMPARISON, section);
	} else if (queryType === mcomp) {
		return mcomparison(filter as unknown as MCOMPARISON, section);
	}else{

		return false;
	}
}

function mcomparison(mcomp: MCOMPARISON,section: Section): boolean{
	// console.log("M COMP",JSON.stringify(mcomp));
	const eq: unknown = mcomp.EQ;
	if(eq){
		return EQ(mcomp,section);
	}
	const lt: unknown = mcomp.LT;
	if(lt){
		return LT(mcomp,section);
	}
	if(mcomp.GT){
		return GT(mcomp,section);
	}
	return false;
}

function scomparison(scomp: SCOMPARISON,section: Section): boolean{
	return IS(scomp,section);
}

function logicComparison(lcomp: LOGICCOMPARISON,section: Section): boolean{
	const and = lcomp.AND;
	if(and){
		return AND(lcomp,section);
	}else if(lcomp.OR){
		return OR(lcomp,section);
	}else{
		return false;
	}
}


function matchPattern(inputString: string, fieldValue: string): boolean {
	if (inputString === "") {
		return fieldValue === "";
	}
	const wildCard: string = "*";
	const matchExact: boolean = !inputString.startsWith(wildCard) && !inputString.endsWith(wildCard);
	const matchRight: boolean = inputString.startsWith(wildCard) && !inputString.endsWith(wildCard);
	const matchLeft: boolean = !inputString.startsWith(wildCard) && inputString.endsWith(wildCard);
	const matchCenter: boolean = inputString.startsWith(wildCard) && inputString.endsWith(wildCard);

	if (matchExact) {
		return inputString === String(fieldValue);
	} else if (matchRight) {
		return String(fieldValue).endsWith(inputString.substring(1));
	} else if (matchLeft) {
		return String(fieldValue).startsWith(inputString.substring(0,inputString.length - 1));
	} else if (matchCenter) {
		const trimmedInput = inputString.slice(1, -1);
		return String(fieldValue).includes(trimmedInput);
	} else {
		return false;
	}
}

function getValueByFieldName<T, K extends keyof T>(obj: T, fieldName: K): T[K] {
	return obj[fieldName];
}


