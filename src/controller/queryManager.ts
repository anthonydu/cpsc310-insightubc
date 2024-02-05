/* eslint-disable max-lines */
// eslint-disable-next-line max-len
import {FILTER, QUERY, Section} from "./queryTypes";
import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {validateQuery} from "./queryValidator";
import * as fs from "fs-extra";
import {FILTER_DATA} from "./queryExecutor";


export class QueryManager {
	private query: QUERY;
	private result: InsightResult[];
	private errors: string[];
	private ids: string[];
	private dataFolder: string;
	protected QUERY_MAX: number = 5000;
	constructor(query: unknown) {
		this.query = query as QUERY;
		this.result = [];
		this.errors = [];
		this.ids = [];
		this.dataFolder = "data/datasets.json";

	}

	public async execute(): Promise<InsightResult[]> {

		if(!this.query?.OPTIONS?.COLUMNS){
			return Promise.reject(new InsightError("Empty or missing columns"));
		}
		if(this.query.OPTIONS.COLUMNS.length < 1){
			return Promise.reject(new InsightError("Empty or missing columns"));
		}
		if(!Array.isArray(this.query.OPTIONS.COLUMNS)){
			return Promise.reject(new InsightError("Columns must be an array"));
		}
		const firstColumn: string = this.query.OPTIONS.COLUMNS[0] as string;

		const parts = firstColumn.split("_");
		if(parts.length < 1){
			return Promise.reject(new InsightError(`Invalid column ${firstColumn}`));
		}
		const id: string = parts[0];
		const dataset = this.getDatasetById(id);

		if(!Array.isArray(dataset)){
			return Promise.reject(new InsightError(`No dataset with id ${id}`));
		}
		const valid = this.validate();
		// logic to validate if a query references two different dataset ids
		if(new Set(this.getIds()).size !== 1){
			const error: string = "Multiple data sets referenced";
			return Promise.reject(new InsightError(error));

		}
		if(!valid){
			const firstError: string = this.errors[0];
			return Promise.reject(new InsightError(firstError));
		}
		const filter = this.query.WHERE;
		for(const section of dataset as unknown as InsightResult[]) {
			if(FILTER_DATA(filter as FILTER,section as unknown as Section)){
				const res: InsightResult = this.getColumns(section);
				this.result.push(res);

			}
		}
		if(this.result.length > this.QUERY_MAX){
			return Promise.reject(new ResultTooLargeError("Result too large"));
		}

		return Promise.resolve([...this.result]);

	}

	public getColumns(section: Record<string,any>): InsightResult{
		const columns: string[] = this.query.OPTIONS.COLUMNS;

		for (const key in Object.keys(section)) {
			if (!columns.includes(key)) {
				delete section[key];
			}
		}
		return section as InsightResult;
	}

	public validate(): boolean{
		//	empty errors and ids from previous validations
		this.resetValues();
		return validateQuery(this.query as QUERY,this.errors, this.ids);

	}

	private resetValues(){
		this.errors = [];
		this.ids = [];

	}

	public getErrors(): string[]{
		return this.errors;
	}

	public getIds(): string[]{
		return this.ids;
	}

	private async readPersistedData(): Promise<any[]>{
		try {
			const datasets = await fs.readJson(this.dataFolder);
			return datasets;
		} catch(error: unknown) {
			console.log("Error reading persisted data");
			return [];
		}
	}

	private async getDatasetById(id: string): Promise<any[]> {
		try {
			const datasets = await this.readPersistedData();
			let queryData = null;
			for(const d of datasets){

				if(d.id === id){
					// console.log("DATA FOUND",d.id);
					queryData = d.data;
					break;
				}
			}
			return queryData;
		}catch(error: unknown){

			return [];
		}
	}

}
