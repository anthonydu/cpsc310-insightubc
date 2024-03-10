import {APPLYRULE,APPLY, GROUP, TRANSFORMATIONS, KEY, ANYKEY, APPLYKEY, mkeys} from "./queryTypes";
import {InsightResult} from "./IInsightFacade";
import Decimal from "decimal.js";


function MIN(group: InsightResult[],applyRule: APPLYRULE): number{
	const minObj =  Object.values(applyRule)[0];
	const field = minObj?.MIN.toString();
	const fieldParts = field.split("_");
	const fieldName = fieldParts[1];
	const firstItem = group[0];


	let minimum: number = Number.parseFloat(firstItem[fieldName] as string);
	for(const item of group){
		const value: number = Number.parseFloat(item[fieldName] as string);
		minimum = Math.min(minimum,value);
	}

	return minimum;
}

function MAX(group: InsightResult[],applyRule: APPLYRULE): number{
	const maxObj =  Object.values(applyRule)[0];

	const field = maxObj?.MAX.toString();
	const fieldParts = field.split("_");
	const fieldName = fieldParts[1];
	const firstItem = group[0];
	let maximum: number = Number.parseFloat(firstItem[fieldName] as string);
	for(const item of group){
		const value: number = Number.parseFloat(item[fieldName] as string);
		maximum = Math.max(maximum,value);
	}

	return maximum;
}

function AVG(group: InsightResult[],applyRule: APPLYRULE): number{
	const avgObj =  Object.values(applyRule)[0];

	const field = avgObj?.AVG.toString();
	const fieldParts = field.split("_");
	const fieldName = fieldParts[1];
	let total: Decimal = new Decimal(0);
	let count = group.length;

	for(const item of group){
		const value = new Decimal(item[fieldName] );
		total = total.add(value);
	}

	const avg =  total.toNumber() / count;

	return Number(avg.toFixed(2));
}

function SUM(group: InsightResult[],applyRule: APPLYRULE): number{
	const sumObj =  Object.values(applyRule)[0];

	const field = sumObj?.SUM;
	const fieldParts = field.split("_");
	const fieldName = fieldParts[1];

	let sum: number = 0;
	for(const item of group){
		const value: number = Number.parseFloat(item[fieldName] as string);
		sum += value;
	}


	return Number(sum.toFixed(2));
}
function COUNT(group: InsightResult[],applyRule: APPLYRULE): number{

	const countObj =  Object.values(applyRule)[0];

	const field = countObj?.COUNT.toString();
	const fieldParts = field.split("_");
	const fieldName = fieldParts[1];
	const set = new Set();
	for(const item of group){
		const value = item[fieldName];
		set.add(value);
	}

	return set.size;
}
function getGroupName(item: InsightResult,groupers: GROUP): string{

	const keyParts: string[] = groupers.map((field) => {
		const itemField = field.split("_")[1];
		return String(item[itemField]);
	});
	const key =  keyParts.join("|");
	return key;

}
export function EXECUTE_GROUP(items: InsightResult[],groupers: GROUP): Record<string,InsightResult[]>{
	const initial = {} as Record<string,InsightResult[]>;
	const groups = items.reduce((map, item) => {

		const key = getGroupName(item,groupers);
		if(!map[key]){
			map[key] = [];
		}
		map[key].push(item);
		return map;
	}, initial);

	return groups;
}


/**
 *
 * @param groups : The groupings obtained from `EXECUTE_AGROUP`
 * @param apply : The list of apply rules
 */
function EXUCUTE_APPLY(groups: InsightResult[][],apply: APPLY,
	groupers: GROUP, columns: ANYKEY[]): InsightResult[]{

	let item: Record<string, string | number> = {};
	const results: InsightResult[] = [];

	for(const group of groups){
		// In each group, the values of each keys in GROUP are the same for all elements
		// We want to pass those values to the final returned object
		const firstItem = group[0];
		if(apply.length > 0){
			item = executeGroupApply(group,apply,columns) ;
		}

		for(const grouper of groupers){
			const grouperParts = grouper.split("_");
			const grouperField = grouperParts[1];
			item[grouperField] = firstItem[grouperField];
		}
		results.push(item);
	}

	return  results;

}
function executeGroupApply(group: InsightResult[],apply: APPLY,columns: ANYKEY[]): Record<string, string|number>{
	type ApplyFunction = (result: InsightResult[], applyRule: APPLYRULE) => number;
	const applyMap: {[key: string]: ApplyFunction} = {
		MIN:MIN,
		MAX:MAX,
		AVG:AVG,
		SUM:SUM,
		COUNT:COUNT
	};
	const returnItem = {} as Record<string, string|number> ;
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
	let finalResults = [];
	const groups = EXECUTE_GROUP(results,transformations.GROUP );
	const groupers = transformations.GROUP;
	if(transformations.APPLY.length <= 0){
		const groupsKeys = Object.keys(groups);

		for(const key of groupsKeys){
			const newObj: InsightResult = {};
			const  values = key.split("|");
			for(let i = 0;i < values.length; i++){
				const grouper = groupers[i];
				const grouperParts = grouper.split("_");

				if(mkeys.includes(grouperParts[1])){
					newObj[groupers[i]] = Number.parseFloat(values[i]);
				}else{
					newObj[groupers[i]] = values[i];
				}


			}
			finalResults.push(newObj);
		}
		return finalResults;
	}
	const groupsArray = Object.values(groups);

	finalResults = EXUCUTE_APPLY(groupsArray,transformations.APPLY,transformations.GROUP,columns);

	return finalResults;
}
