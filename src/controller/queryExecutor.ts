import {InsightResult} from "./IInsightFacade";
import {FILTER, LOGICCOMPARISON, MCOMPARISON, NEGATION, Room, SCOMPARISON, Section,Item, ORDER} from "./queryTypes";
import {getFilterType} from "./queryValidator";

function IS(scomp: SCOMPARISON, section: Item): boolean {
	// query will be validated before it arrives here,
	// we can therefore be sure that the line below will not produce an error
	const body: Record<string, string> = Object.values(scomp)[0];
	const skey: string = Object.keys(body)[0];
	const svalue: string = body[skey];
	const delimiter: string = "_";
	const parts: string[] = skey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: string = getValueByFieldName(section, sfield as keyof Item) as string;

	const match = matchPattern(svalue, fieldValue as string);

	return match;
}

function EQ(mcomp: MCOMPARISON, section: Item): boolean {
	const body: any = mcomp.EQ;
	if (!body) {
		return false;
	}
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section, sfield as keyof Item) as number;

	return fieldValue === mvalue;
}

function GT(mcomp: MCOMPARISON, section: Item): boolean {
	const body: any = mcomp.GT;
	if (!body) {
		return false;
	}
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section, sfield as keyof Item) as number;

	return fieldValue > mvalue;
}

function LT(mcomp: MCOMPARISON, section: Item): boolean {
	const body: any = mcomp.LT;
	if (!body) {
		return false;
	}
	const mkey: string = Object.keys(body)[0];
	const mvalue: number = body[mkey];
	const delimiter: string = "_";
	const parts: string[] = mkey.split(delimiter);
	const sfield = parts[1];
	const fieldValue: number = getValueByFieldName(section, sfield as keyof Item) as number;

	return fieldValue < mvalue;
}

function NOT(negation: NEGATION, section: Item): boolean {
	const filter: FILTER = negation.NOT;

	return !FILTER_DATA(filter, section);
}
function sortCallBack(first: InsightResult, second: InsightResult,keys: string[],dir: string){
	const UP = "UP";
	const DOWN = "DOWN";
	for(const key of keys){
		const isDiff = first[key] !== second[key];
		const isGreater = first[key] > second[key];
		if( isDiff && dir === UP){
			return isGreater ? 1 : -1;
		}else if( isDiff && dir === DOWN){
			return isGreater ? -1 : 1;
		}

	}
	return 0;
}
function simpleSortCallBack(first: InsightResult, second: InsightResult,key: string){
	if ((first[key] ) < (second[key])) {
		return -1;
	}else if((first[key] ) > (second[key])){
		return 1;
	}else{
		return 0;
	}
}
function sortByKeys(order: any, result: InsightResult[]){
	if (result.length <= 0) {
		return;
	}
	if(typeof order === "string"){
		result.sort((first: InsightResult, second: InsightResult) => simpleSortCallBack(first,second,order));
	}else{
		const keys = order.keys;
		const dir = order.dir;
		result.sort((first,second) => sortCallBack(first,second,keys,dir));

	}

}

export function orderResults(order: any, result: InsightResult[]) {
	sortByKeys(order,result);

}

function AND(logicComp: LOGICCOMPARISON, section: Item): boolean {
	const and = logicComp.AND;
	if (!and) {
		return false;
	}
	return and.every((condition) => FILTER_DATA(condition, section));
}

function OR(logicComp: LOGICCOMPARISON, section: Item): boolean {
	const or = logicComp.OR;
	if (!or) {
		return false;
	}
	return or.some((condition) => FILTER_DATA(condition, section));
}

export function FILTER_DATA(filter: any, section: Section| Room): boolean {
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
	} else {
		return false;
	}
}

function mcomparison(mcomp: MCOMPARISON, section: Item): boolean {
	// console.log("M COMP",JSON.stringify(mcomp));
	const eq: unknown = mcomp.EQ;
	if (eq) {
		return EQ(mcomp, section);
	}
	const lt: unknown = mcomp.LT;
	if (lt) {
		return LT(mcomp, section);
	}
	if (mcomp.GT) {
		return GT(mcomp, section);
	}
	return false;
}

function scomparison(scomp: SCOMPARISON, section: Item): boolean {
	return IS(scomp, section);
}

function logicComparison(lcomp: LOGICCOMPARISON, section: Item): boolean {
	const and = lcomp.AND;
	if (and) {
		return AND(lcomp, section);
	} else if (lcomp.OR) {
		return OR(lcomp, section);
	} else {
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
		return String(fieldValue).startsWith(inputString.substring(0, inputString.length - 1));
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
