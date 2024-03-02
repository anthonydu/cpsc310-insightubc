import {APPLYRULE,APPLY} from "./queryTypes";
import {InsightResult} from "./IInsightFacade";


function MIN(group: InsightResult[],applyRule: APPLYRULE): Record<string,number>{
	const minObj =  Object.values(applyRule)[0];
	const applykey: string = Object.keys(applyRule)[0];
	const field = minObj?.MIN.toString();
	const firstItem = group[0];
	let finalObj: Record<string, number> = {};
	let minimum: number = Number.parseInt(firstItem[field] as string, 10);
	for(const item of group){
		const value: number = Number.parseInt(item[field] as string, 10);
		minimum = Math.min(minimum,value);
	}
	finalObj[applykey] = minimum;
	return finalObj;
}

function MAX(group: InsightResult[],applyRule: APPLYRULE): Record<string,number>{
	const maxObj =  Object.values(applyRule)[0];
	const applykey = Object.keys(applyRule)[0];
	let finalObj: Record<string, number> = {};
	const field = maxObj?.MAX.toString();
	const firstItem = group[0];
	let maximum: number = Number.parseInt(firstItem[field] as string, 10);
	for(const item of group){
		const value: number = Number.parseInt(item[field] as string, 10);
		maximum = Math.max(maximum,value);
	}
	finalObj[applykey] = maximum;
	return finalObj;
}

function AVG(group: InsightResult[],applyRule: APPLYRULE): Record<string,number>{
	const avgObj =  Object.values(applyRule)[0];
	const applykey = Object.keys(applyRule)[0];
	let finalObj: Record<string, number> = {};
	const field = avgObj?.AVG.toString();
	let sum: number = 0;
	let count = 0;
	for(const item of group){
		const value: number = Number.parseInt(item[field] as string, 10);
		sum += value;
		count++;
	}
	finalObj[applykey] = sum / count;
	return finalObj;
}

function SUM(group: InsightResult[],applyRule: APPLYRULE): Record<string,number>{
	const sumObj =  Object.values(applyRule)[0];
	const applykey = Object.keys(applyRule)[0];
	let finalObj: Record<string, number> = {};
	const field = sumObj?.SUM.toString();

	let sum: number = 0;
	for(const item of group){
		const value: number = Number.parseInt(item[field] as string, 10);
		sum += value;
	}

	finalObj[applykey] = sum;
	return finalObj;
}
function COUNT(group: InsightResult[],applyRule: APPLYRULE): Record<string,number>{

	const countObj =  Object.values(applyRule)[0];
	const applykey = Object.keys(applyRule)[0];
	let finalObj: Record<string, number> = {};
	const field = countObj?.COUNT.toString();
	const set = new Set();
	for(const item of group){
		const value = item[field];
		set.add(value);
	}
	finalObj[applykey] = set.size;
	return finalObj;
}
function ORDER(result: InsightResult[],order: any){
	return;
}

export function EXECUTE_GROUP(result: InsightResult[]): Record<string, InsightResult[]>{
	let groups = {};

	return groups;

}
/**
 *
 * @param groups : The groupings obtained from `EXECUTE_AGROUP`
 * @param apply : The list of apply rules
 * @param ruleName : The name of the apply rule
 */
function EXUCUTE_APPLY(groups: InsightResult[][],apply: APPLY, ruleName: string){
	type ApplyFunction = (result: InsightResult[], applyRule: APPLYRULE) => Record<string,number>;
	let finalObj = {};

	const applyMap: {[key: string]: ApplyFunction} = {
		MIN: MIN,
		MAX: MAX,
		AVG: AVG,
		SUM: SUM,
		COUNT: COUNT
	};
	// for(const group of groups){

	// 	finalObj[] = applyMap[]

	// }

}
