import {APPLYRULE,APPLY, GROUP, TRANSFORMATIONS, KEY, ANYKEY, APPLYKEY} from "./queryTypes";
import {InsightResult} from "./IInsightFacade";
import Decimal from "decimal.js";


function MIN(group: InsightResult[],applyRule: APPLYRULE): number{
	const minObj =  Object.values(applyRule)[0];
	const field = minObj?.MIN.toString();
	const firstItem = group[0];


	let minimum: number = Number.parseInt(firstItem[field] as string, 10);
	for(const item of group){
		const value: number = Number.parseInt(item[field] as string, 10);
		minimum = Math.min(minimum,value);
	}

	return minimum;
}

function MAX(group: InsightResult[],applyRule: APPLYRULE): number{
	const maxObj =  Object.values(applyRule)[0];

	const field = maxObj?.MAX.toString();
	const firstItem = group[0];
	let maximum: number = Number.parseInt(firstItem[field] as string, 10);
	for(const item of group){
		const value: number = Number.parseInt(item[field] as string, 10);
		maximum = Math.max(maximum,value);
	}

	return maximum;
}

function AVG(group: InsightResult[],applyRule: APPLYRULE): number{
	const avgObj =  Object.values(applyRule)[0];

	const field = avgObj?.AVG.toString();
	let total: Decimal = new Decimal(0);
	let count = group.length;

	for(const item of group){
		const value = new Decimal(item[field] );
		total.add(value);
	}

	const avg =  total.toNumber() / count;

	return Number(avg.toFixed(2));
}

function SUM(group: InsightResult[],applyRule: APPLYRULE): number{
	const sumObj =  Object.values(applyRule)[0];

	const field = sumObj?.SUM.toString();

	let sum: number = 0;
	for(const item of group){
		const value: number = Number.parseInt(item[field] as string, 10);
		sum += value;
	}


	return Number(sum.toFixed(2));
}
function COUNT(group: InsightResult[],applyRule: APPLYRULE): number{

	const countObj =  Object.values(applyRule)[0];

	const field = countObj?.COUNT.toString();
	const set = new Set();
	for(const item of group){
		const value = item[field];
		set.add(value);
	}

	return set.size;
}

export function EXECUTE_GROUP(items: InsightResult[],groupers: GROUP): InsightResult[][]{
	const initial = {} as Record<string,InsightResult[]>;
	const groups = items.reduce((map, item) => {
        // Generate a key based on the values of the specified fields
		const key = groupers.map((field) => String(item[field])).join("-");
		let group = map[key] || [];
		group.push(item);

		map[key] = group;
		return map;
	}, initial);

	return Object.values(groups);
}


/**
 *
 * @param groups : The groupings obtained from `EXECUTE_AGROUP`
 * @param apply : The list of apply rules
 */
function EXUCUTE_APPLY(groups: InsightResult[][],apply: APPLY,
	groupers: GROUP, columns: ANYKEY[]): InsightResult[]{

	let item;
	const results: InsightResult[] = [];

	for(const group of groups){
		// In each group, the values of each keys in GROUP are the same for all elements
		// We want to pass those values to the final returned object
		const firstItem = group[0];
		item = executeGroupApply(group,apply,groupers,columns) ;
		for(const grouper of groupers){
			item[grouper] = firstItem[grouper];
		}
		results.push(item);
	}

	return  results;

}
function executeGroupApply(group: InsightResult[],apply: APPLY,
	groupers: GROUP,columns: ANYKEY[]): Record<string, string|number>{
	type ApplyFunction = (result: InsightResult[], applyRule: APPLYRULE) => number;
	const applyMap: {[key: string]: ApplyFunction} = {
		MIN,
		MAX,
		AVG,
		SUM,
		COUNT
	};
	let returnItem = {} as Record<string, string|number> ;
	for(const applyRule of apply){

		const applykey = Object.keys(applyRule)[0];
		const applyObj = Object.values(applyRule)[0];
		const applyToken = Object.keys(applyObj)[0];
		// We only care when the apply key is in the columns, if not we do not need to compute its value
		if(columns.includes(applykey)){
			returnItem[applykey] = applyMap[applyToken](group,applyRule);
		}
	}


	return returnItem;
}
/**
 * @param transformations : TRANSFORMATIONS part of the QUERY
 * @param results : The results returned by WHERE
 * @returns : results after applying  the relevant transformations
 */
export function executeTransformations(transformations: TRANSFORMATIONS, results: InsightResult[],columns: ANYKEY[]){
	const groups = EXECUTE_GROUP(results,transformations.GROUP );
	if(transformations.APPLY.length <= 0){

		return groups.flat();

	}

	const finalResults = EXUCUTE_APPLY(groups,transformations.APPLY,transformations.GROUP,columns);

	return finalResults;
}
