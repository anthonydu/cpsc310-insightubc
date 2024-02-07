import {InsightError, InsightResult} from "./IInsightFacade";
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
	return matchPattern(svalue,fieldValue as string);


}

function EQ(mcomp: MCOMPARISON,section: Section): boolean{
	const body: Record<string,number> = mcomp.EQ;
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section,sfield as keyof Section) as number;
	return fieldValue === mvalue;
}

function GT(mcomp: MCOMPARISON,section: Section): boolean {
	const body: Record<string,number> = mcomp.GT;
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section,sfield as keyof Section) as number;
	return fieldValue > mvalue;
}

function LT(mcomp: MCOMPARISON, section: Section): boolean {
	const body: Record<string,number> = mcomp.LT;
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section,sfield as keyof Section) as number;
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

	result.sort((first: InsightResult, second: InsightResult) => {
        // Check if the field exists in both objects
		const parts = order.split("_");


		if (first[parts[1]] && second[parts[1]]) {
			if(typeof first[parts[1]] === "string" && typeof second[parts[1]] === "string") {
				return (first[parts[1]] as string).localeCompare(second[parts[1]] as string);
			} else {
				return (first[parts[1]] as number) - (second[parts[1]] as number);
			}
		} else {
			// throw new InsightError(`Field "${parts[1]}" does not exist in some of the objects.`);
			return -1;
		}
	});
}

function AND(logicComp: LOGICCOMPARISON,section: Section): boolean{
	const and = logicComp.AND;
	return and.every((condition) => FILTER_DATA(condition, section));


}

function OR(logicComp: LOGICCOMPARISON,section: Section): boolean{
	const or = logicComp.OR;
	return or.some((condition) => FILTER_DATA(condition, section));


}

export function FILTER_DATA(filter: FILTER,section: Section): boolean{
	const mcomp = "MCOMPARISON";
	const scomp = "SCOMPARISON";
	const logic = "LOGICCOMPARISON";
	const negation = "NEGATION";

	const queryType = getFilterType(filter);

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
	// Case 1: Matches inputstring exactly
	const wildCard: string = "*";
	const matchExat: boolean = !inputString.startsWith(wildCard) && !inputString.endsWith(wildCard);
	const matchRight: boolean = inputString.startsWith(wildCard) && !inputString.endsWith(wildCard);
	const matchLeft: boolean = !inputString.startsWith(wildCard) && inputString.endsWith(wildCard);
	const matchCenter: boolean = inputString.startsWith(wildCard) && inputString.endsWith(wildCard);

	if (matchExat) {
		return inputString === fieldValue;
	} else if (matchRight) {
		return fieldValue.endsWith(inputString.substring(1));
	} else if (matchLeft) {
		return fieldValue.startsWith(inputString.substring(0,inputString.length - 1));
	} else if (matchCenter) {
		const trimmedInput = inputString.slice(1, -1);
		return fieldValue.includes(trimmedInput);
	} else {
		return false;
	}
}

function getValueByFieldName<T, K extends keyof T>(obj: T, fieldName: K): T[K] {
	return obj[fieldName];
}


