/* eslint-disable max-lines */
// eslint-disable-next-line max-len
import {FILTER, IDSTRING, MCOMPARISON, OPTIONS, QUERY, SCOMPARISON, SKEY,MKEY, MFIELD,SFIELD, MCOMPARATOR, LOGIC, LOGICCOMPARISON, NEGATION, Section, PersistDataset} from "./queryTypes";
import {InsightResult} from "./IInsightFacade";
import {DataManager} from "./DataManager";


export class QueryManager {
	private query: unknown;
	private result: InsightResult[];
	private errors: string[];
	private ids: Set<string>;
	private dataManager: DataManager;
	constructor(query: unknown) {
		this.query = query;
		this.result = [];
		this.errors = [];
		this.ids = new Set();
		this.dataManager = new DataManager([]);
	}

	public async execute(): Promise<InsightResult[]> {
		try {
			return Promise.reject("Nothing");
		} catch (error) {
			throw new Error();
		}
	}

	public isValidJSON(jsonString: string): boolean {
		try {
			JSON.parse(jsonString);
			return true;
		} catch (error) {
			return false;
		}
	}

	public validate(): boolean{
		let error: string;
		const parsedQuery = this.query as QUERY;

		//	empty errors and ids from previous validations
		this.resetValues();

		if(!this.isValidJSON(this.query as string)){
			error =  "Query not a valid json" ;
			this.errors.push(error);
			return false;
		}

		// add logic to make sure that an error is return is a dataset does not exist
		if(!this.validateWHERE(parsedQuery.WHERE)){
			return false;
		}

		if(!this.validateOPTIONS(parsedQuery.OPTIONS)){
			return false;
		}
		// logic to validate if a query references two different dataset ids
		if(this.ids.size !== 1){
			error = "Multiple data sets referenced";
			this.errors.push(error);
			return false;
		}
		return  true;
	}

	private matchPattern(inputString: string, fieldValue: string): boolean {
		// Case 1: Matches inputstring exactly
		const wildCard: string = "*";
		const matchExat: boolean = !inputString.startsWith(wildCard) && !inputString.endsWith(wildCard);
		const matchRight: boolean = inputString.startsWith(wildCard) && !inputString.endsWith(wildCard);
		const matchLeft: boolean = !inputString.startsWith(wildCard) && inputString.endsWith(wildCard);
		const matchCenter: boolean = inputString.startsWith(wildCard) && inputString.endsWith(wildCard);

		if (matchExat) {
			return inputString === fieldValue;
		} else if (matchRight) {
			return fieldValue.endsWith(inputString);
		} else if (matchLeft) {
			return fieldValue.startsWith(inputString);
		} else if (matchCenter) {
			const trimmedInput = inputString.slice(1, -1);
			return fieldValue.includes(trimmedInput);
		} else {
			return false;
		}
	}

	private getValueByFieldName<T, K extends keyof T>(obj: T, fieldName: K): T[K] {
		return obj[fieldName];
	}

	public IS(scomp: SCOMPARISON,section: Section): boolean {
		// query will be validated before it arrives here,
		// we can therefore be sure that the line below will not produce an error
		const body: Record<string,string> = Object.values(scomp)[0];
		const skey: string = Object.keys(body)[0];
		const svalue: string = body[skey];
		const delimiter: string = "_";
		const parts: string[] = skey.split(delimiter);
		const sfield = parts[1];
		const fieldValue: string = this.getValueByFieldName(section,sfield as keyof Section) as string;
		return this.matchPattern(svalue,fieldValue as string);


	}

	public EQ(mcomp: MCOMPARISON,section: Section): boolean{
		const body: Record<string,number> = mcomp.EQ;
		const mkey: string = Object.keys(body)[0];
		const mvalue: number = body[mkey];
		const delimiter: string = "_";
		const parts: string[] = mkey.split(delimiter);
		const sfield = parts[1];
		const fieldValue: number = this.getValueByFieldName(section,sfield as keyof Section) as number;
		return fieldValue === mvalue;
	}

	public GT(mcomp: MCOMPARISON,section: Section): boolean {
		const body: Record<string,number> = mcomp.GT;
		const mkey: string = Object.keys(body)[0];
		const mvalue: number = body[mkey];
		const delimiter: string = "_";
		const parts: string[] = mkey.split(delimiter);
		const sfield = parts[1];
		const fieldValue: number = this.getValueByFieldName(section,sfield as keyof Section) as number;
		return fieldValue > mvalue;
	}

	public LT(mcomp: MCOMPARISON, section: Section): boolean {
		const body: Record<string,number> = mcomp.LT;
		const mkey: string = Object.keys(body)[0];
		const mvalue: number = body[mkey];
		const delimiter: string = "_";
		const parts: string[] = mkey.split(delimiter);
		const sfield = parts[1];
		const fieldValue: number = this.getValueByFieldName(section,sfield as keyof Section) as number;
		return fieldValue < mvalue;
	}

	public NOT(negation: NEGATION,section: Section): boolean {
		const filter: FILTER = negation.NOT;

		return this.FILTER(filter,section);
	}

	public ORDER(order: unknown): boolean{
		return false;
	}

	public AND(logicComp: LOGICCOMPARISON,section: Section): boolean{
		// TODO: finish this
		return false;
	}

	public OR(logicComp: LOGICCOMPARISON,section: Section): boolean{
		// TODO: finish this
		return false;
	}

	public FILTER(filter: FILTER,section: Section): boolean{
		// should be recursive
		// TODO: finish this
		return false;
	}

	public MCOMPARISON(mcomp: MCOMPARISON,section: Section): boolean{
		const eq: unknown = mcomp.EQ;
		if(eq){
			return this.EQ(mcomp,section);
		}
		const lt: unknown = mcomp.LT;
		if(lt){
			return this.LT(mcomp,section);
		}
		return this.GT(mcomp,section);
	}

	public SCOMPARISON(scomp: SCOMPARISON,section: Section): boolean{
		return this.IS(scomp,section);
	}

	public LOGICCOMPARISON(lcomp: LOGICCOMPARISON,section: Section): boolean{
		const and = lcomp.AND;
		if(and){
			return this.AND(lcomp,section);
		}else{
			return this.OR(lcomp,section);
		}
	}

	private resetValues(){
		this.errors = [];
		this.ids = new Set();

	}

	public getErrors(): string[]{
		return this.errors;
	}

	public getIds(): string[]{
		return [...this.ids];
	}

	private isValidMComparator(mcomp: MCOMPARATOR): boolean {
		return typeof mcomp === "string" && ["LT", "GT", "EQ"].includes(mcomp);
	}

	private isValidMComparison(mcomparison: MCOMPARISON){
		let error: string;
		if(!mcomparison || typeof mcomparison !== "object"){
			error = "MCOMPARISON should be an object";
			this.errors.push(error);
			return false;
		}
		const keys = Object.keys(mcomparison);
		const compBody = Object.values(mcomparison);
		if(keys.length !== 1){
			error = "invalid MCOMPARISON key";
			this.errors.push(error);
			return false;

		}
		if(!this.isValidMComparator(keys[0] as MCOMPARATOR)){
			error = "Invalid MCOMPARATOR should be one of LT, GT, EQ";
			this.errors.push(error);
			return false;
		}
		if(!compBody[0] || compBody.length !== 1){
			return false;
		}
		if(typeof  compBody[0] !== "object"){
			return false;
		}
		const mkey = Object.keys(compBody[0])[0];
		const mkeyValue =  Object.values(compBody[0])[0];
		return this.validateMkey(mkey as MKEY) && (typeof mkeyValue === "number");
	}

	private isValidSComparison(scomp: SCOMPARISON): boolean{
		let error: string;
		if(!scomp || typeof scomp !== "object" ){
			error = "Invalid SCOMPARISON value, not an object";
			this.errors.push(error);
			return false;

		}
		const keys = Object.keys(scomp);
		if(keys.length > 1 || keys[0] !== "IS"){
			error = `Invalid key for SCOMPARISON , expected IS but got ${scomp}`;
			this.errors.push(error);
			return false;
		}else if(!scomp.IS){
			error = `Invalid key for SCOMPARISON , expected IS but got ${scomp}`;
			this.errors.push(error);
			return false;

		}else if(Object.keys(scomp.IS).length !== 1){
			error = "Invalid keys for SCOMPARISON , only SCOMPARISON expected";
			this.errors.push(error);
			return false;

		}else if(typeof Object.keys(scomp.IS)[0] !== "string"){
			error = "Invalid keys for SCOMPARISON , only SCOMPARISON expected";
			this.errors.push(error);
			return false;

		}else if((Object.values(scomp.IS).length !== 1)){
			error = "wrong length for value of skey";
			this.errors.push(error);
			return false;

		}else if( typeof Object.values(scomp.IS)[0] !== "string"){
			error = `expected skey value to be a string, got ${scomp.IS}`;
			this.errors.push(error);
			return false;

		}else{
			const ISBody = scomp.IS;
			const skey = Object.values(ISBody)[0];
			const inputString = Object.values(ISBody)[0];

			return this.validateInputString(inputString) && this.validateSkey(skey as SKEY);
		}

	}

	private getQueryDatasetId(){
		const arr = [...this.ids];
		return arr[0];
	}

	public isValidLogic(logic: LOGIC): logic is LOGIC{
		let error: string;
		const possibleValues = ["AND","OR"];
		if(!possibleValues.includes(logic)){
			error = `${logic} is not one of "AND","OR"`;
			this.errors.push(error);
			return false;
		}
		return true;
	}

	public isValidLogiComparison(logicComp: LOGICCOMPARISON): logicComp is LOGICCOMPARISON{
		let error: string;
		if(!logicComp || typeof logicComp !== "object"){
			error = `${logicComp} is not an object`;
			this.errors.push(error);
			return false;
		}
		const keys = Object.keys(logicComp);
		const values = Object.values(logicComp);
		if(keys.length === 0){
			error = `${logicComp} is invalid`;
			return false;
		}
		return  this.isValidLogic(keys[0] as LOGIC) && this.validateFILTERs(values[0]);
	}

	public validateNegation(negation: NEGATION): negation is NEGATION{
		let error: string;
		if(!negation || !negation.NOT){
			error = `${negation} is invalid`;
			this.errors.push(error);
			return false;
		}
		if(typeof negation.NOT !== "object"){
			error = `${negation} not an object`;
			this.errors.push(error);
			return false;
		}
		return this.validateFILTER(negation.NOT);
	}

	private getFilterType(filter: FILTER): string{
		const filterKey = Object.keys(filter)[0];
		switch(filterKey){
			case "OR":
				return "LOGICCOMPARISON";
			case "AND":
				return "LOGICCOMPARISON";
			case "NOT":
				return "NEGATION";
			case "IS":
				return "SCOMPARISON";
			case "LT":
			case "GT":
			case "EQ":
				return "MCOMPARISON";
			default:
				return "NONE";
		}
	}

	public validateWHERE(where: any): boolean{
		let error: string;
		if(typeof where !== "object"){
			error = "WHERE expects an object type";
			this.errors.push(error);
			return false;
		}else if(where === {} as Record<never,never>){
			return true;
		}else{
			return this.validateFILTER( where as FILTER);
		}
	}

	public validateFILTER(filter: FILTER): boolean{
		let error: string;
		type ValidatorFunction = (filter: any) => boolean;
		const validatorsMap: Record<string,ValidatorFunction> = {
			NEGATION:this.validateNegation,
			SCOMPARISON:this.isValidSComparison,
			MCOMPARISON:this.isValidMComparison,
			LOGICCOMPARISON:this.isValidLogiComparison,

		};
		const keys = Object.keys(filter);
		if(keys.length > 1){
			error = "More than 1 filter provided, should be 1";
			this.errors.push(error);
			return false;
		}else if(keys[0]) {
			error = "Should provide a valid filter";
			this.errors.push(error);
			return false;
		}else{
			const filterType: string = this.getFilterType(filter);
			if(filterType === "NONE"){
				error = "invalid filter found";
				this.errors.push(error);
				return false;
			}
			const validator: ValidatorFunction = validatorsMap[filterType];
			return validator(filter) ;
		}

	}

	public validateFILTERs(filters: FILTER[]): boolean{
		for(const filter of filters){
			if(!this.validateFILTER(filter)){
				return false;
			}
		}
		return true;
	}

	public validateOPTIONS(options: OPTIONS): options is OPTIONS{
		let error: string;
		if(!options || typeof options !== "object"){
			error = "Invalid type for OPTIONS, expected an object";
			this.errors.push(error);
			return false;
		}
		if(!options.COLUMNS){
			error = "OPTIONS missing COLUMNS";
			this.errors.push(error);
		}
		if(!Array.isArray(options.COLUMNS)){
			error = "COLUMNS must be an array";
			this.errors.push(error);
			return false;
		}
		const columns: string[] = options.COLUMNS;
		for(const column of columns){

			const delimiter = "_";
			const parts = column.split(delimiter);
			const requiredLength: number = 2;

			if(parts.length !== requiredLength ){
				error = `${column} is not a valid column option`;
				this.errors.push(error);
				return false;
			}

			const mkfields: string[] = ["avg", "pass","fail","audit","year"] ;
			const sfields: string[] = ["dept","id" ,"instructor" ,"title" , "uuid"];

			if(mkfields.includes(parts[1])){
				return this.validateMkey(column as MKEY);
			}

			if(sfields.includes(parts[1])){
				return this.validateSkey(column as SKEY);
			}

		}
		if(options.ORDER && !columns.includes(options.ORDER as string)){
			error = `ORDER value ${options.ORDER} must be in OPTIONS.COLUMNS`;
			this.errors.push(error);
			return false;
		}
		return true;
	}

	private validateIDString(str: IDSTRING): boolean {
		let error: string;
		const pattern = new RegExp("[^_]+");
		this.ids.add(str);
		if(!pattern.test(str)){
			error = `invalid idstring ${str}`;
			this.errors.push(error);
			return false;
		}
		return true;
	}


	private validateInputString(str: string): boolean {
		let error: string;
		const pattern = new RegExp("[^*]*");
		if(!pattern.test(str)){
			error = `invalid inputstring ${str}`;
			this.errors.push(error);
			return false;
		}
		return true;
	}

// export type SFIELD = "dept" | "id" | "instructor" | "title" | "uuid";
	private validateSfield(sfield: SFIELD): sfield is SFIELD {
		let error: string;
		const possibleValues = ["dept", "id" , "instructor" ,"title" , "uuid"];
		if(!possibleValues.includes(sfield)){
			error = `invalid sfield value ${sfield}, should be one of ["dept", "id" , "instructor" ,"title" , "uuid"]`;
			this.errors.push(error);
			return false;

		}
		return true;
	}

// export type MFIELD= "avg" | "pass" | "fail" | "audit" | "year";
	private validateMfield(mfield: MFIELD): mfield is MFIELD {
		const possibleValues = ["avg","pass","fail","audit","year"];
		let error: string;

		if(!possibleValues.includes(mfield)){
			error = `invalid sfield value ${mfield}, should be one of  ["avg","pass","fail","audit","year"]`;
			this.errors.push(error);
			return false;

		}
		return true;
	}


	// export type SKEY = `"${IDSTRING}_${SFIELD}"`;
	private validateSkey(skey: SKEY): skey is SKEY {
		let error: string;
		const delimiter = "_";
		const parts = skey.split(delimiter);
		const requiredLength: number = 2;
		if(parts.length !== requiredLength){
			error = `invalid skey ${skey}`;
			this.errors.push(error);
			return false;
		}
		return this.validateIDString(parts[0] as IDSTRING) && this.validateSfield(parts[1] as SFIELD);
	}

	// export type MKEY = `"${IDSTRING}_${MFIELD}"`;
	private validateMkey(mkey: MKEY): boolean {
		const delimiter = "_";
		const parts = mkey.split(delimiter);
		const requiredLength: number = 2;
		if(parts.length !== requiredLength){
			let error: string;
			error = `invalid mkey ${mkey}`;
			this.errors.push(error);
			return false;
		}
		return this.validateIDString(parts[0]) && this.validateMfield(parts[1] as MFIELD);
	}


}
