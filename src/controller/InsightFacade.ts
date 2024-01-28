/* eslint-disable max-lines */
import JSZip from "jszip";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
// eslint-disable-next-line max-len
import {FILTER, IDSTRING, MCOMPARISON, OPTIONS, QUERY, SCOMPARISON, SKEY,MKEY, MFIELD,SFIELD, MCOMPARATOR, LOGIC, LOGICCOMPARISON, NEGATION} from "./queryTypes";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
class DataManager {
	private data: string;
	constructor() {
		this.data = "";
	}

	public isIDValid(id: string): boolean {
		const trimmedId = id.trim();
		const emptyString = "";
		const underscore = "_";

		return trimmedId === emptyString || trimmedId.includes(underscore);
	}

	// check if any of the sections is missing a query key
	public isSectionValid(section: {[x: string]: undefined;}): boolean {
		const queryKeys: string[] = ["id", "Course", "Title", "Professor", "Subject",
			"Year", "Avg", "Pass", "Fail", "Audit"];
		for (const key of queryKeys) {
			if (section[key] === undefined) {
				return false;
			}
		}

		return true;
	}

	public isCourseValid(this: any, course: string): boolean {
		try {
			const data = JSON.parse(course); // any JSOn error will be caught within catch
			const sections = data.result;

			// a course is valid if it has no invalid section
			// therefore, invalidate course if any such section is found :)
			// waiting on piazza confirmation to see if this interpretation is correct
			for (const section of sections) {
				if (!this.isSectionValid(section)) {
					return false;
				}
			}
			return true;
		} catch (error) {
			return false;
		}
	}

	public async isDataSetValid(content: string): Promise<boolean> {

		return false;
	}

	public async getCoursesJSONData(content: string) {
		try {
			const zipObj = new JSZip();
			const readSections = await zipObj.loadAsync(content);

			return readSections;
		} catch (error: any) {
			throw new Error(error.message);
		}


	}
}

interface ValidationResponse{
	valid: boolean,
	reason?: string
}
class QueryManager {
	private query: unknown;
	private result: InsightResult[];
	private errors: string[];
	constructor(query: unknown) {
		this.query = query;
		this.result = [];
		this.errors = [];
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

	public isValid(): boolean{
		let error: string;
		const parsedQuery = this.query as QUERY;

		if(!this.isValidJSON(this.query as string)){
			error =  "Query not a valid json" ;
			this.errors.push(error);
			return false;
		}
		return this.validateWHERE(parsedQuery.WHERE) && this.validateOPTIONS(parsedQuery.OPTIONS);
	}

	public IS() {
		console.log("");
	}

	public EQ() {
		console.log("");
	}

	public GT() {
		console.log("");
	}

	public LT() {
		console.log("");
	}

	public NOT() {
		console.log("");
	}

	public ORDER(){
		console.log(" ");
	}

	public AND(){
		console.log(" ");
	}

	public OR(){
		console.log(" ");
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

	public validateOPTIONS(options: OPTIONS): boolean{
		return false;
	}

	private validateIDString(str: IDSTRING): boolean {
		let error: string;
		const pattern = new RegExp("[^_]+");
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
		if(parts.length !== 2){
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
		if(parts.length !== 2){
			let error: string;
			error = `invalid mkey ${mkey}`;
			this.errors.push(error);
			return false;
		}
		return this.validateIDString(parts[0]) && this.validateMfield(parts[1] as MFIELD);
	}


}
export default class InsightFacade implements IInsightFacade {
	private static async readPersist() {
		try {
			return await fs.readJson(persistFile);
		} catch {
			// TODO possibly throw an error here
			return [];
		}
	}

	private static idInvalid(datasets: PersistDataset[], id: string) {
		return id.includes("_") || id.trim() === "";
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let datasets: PersistDataset[] = await InsightFacade.readPersist();
		if (InsightFacade.idInvalid(datasets, id) || datasets.some((dataset) => dataset.id === id)) {
			throw new InsightError("Invalid id.");
		}
		if (kind !== InsightDatasetKind.Sections) {
			throw new InsightError("Invalid kind.");
		}
		const zip = new JSZip();
		const sections: Section[] = [];
		try {
			const courses = await zip.loadAsync(content, {base64: true});
			if (!courses.files["courses/"]) {
				throw new InsightError("No courses folder.");
			}
			const files: Array<Promise<string>> = [];
			for (const file of Object.values(courses.files)) {
				files.push(file.async("string"));
			}
			for (const file of await Promise.all(files)) {
				try {
					JSON.parse(file);
				} catch {
					continue;
				}
				for (const section of JSON.parse(file).result) {
					sections.push({
						uuid: section.id,
						id: section.Course,
						title: section.Title,
						instructor: section.Professor,
						dept: section.Subject,
						year: section.Year,
						avg: section.Avg,
						pass: section.Pass,
						fail: section.Fail,
						audit: section.Audit,
					});
				}
			}
		} catch (e) {
			throw new InsightError(e as string);
		}
		if (sections.length === 0) {
			throw new InsightError("No valid sections.");
		}
		datasets.push({id, kind, numRows: sections.length, data: sections});
		await fs.outputJSON(persistFile, datasets);
		return datasets.map((dataset) => dataset.id);
	}

	public async removeDataset(id: string): Promise<string> {
		let datasets: PersistDataset[] = await InsightFacade.readPersist();
		if (InsightFacade.idInvalid(datasets, id)) {
			throw new InsightError("Invalid id.");
		}
		if (!datasets.some((dataset) => dataset.id === id)) {
			throw new NotFoundError("Dataset not found.");
		}
		datasets = datasets.filter((dataset) => dataset.id !== id);
		await fs.outputJSON(persistFile, datasets);
		return id;
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		const queryManager: QueryManager = new QueryManager(query);
		try {
			return await queryManager.execute();

		} catch (error) {
			return Promise.reject("Not implemented.");
		}

	}

	public async listDatasets(): Promise<InsightDataset[]> {
		const datasets: PersistDataset[] = await InsightFacade.readPersist();
		return datasets.map((dataset) => ({
			id: dataset.id,
			kind: dataset.kind,
			numRows: dataset.numRows,
		}));
	}
}
function isSectionValid(section: any) {
	throw new Error("Function not implemented.");
}

