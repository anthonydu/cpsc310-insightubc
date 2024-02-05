/* eslint-disable max-lines */
// eslint-disable-next-line max-len
import {FILTER, QUERY, Section} from "./queryTypes";
import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {validateQuery} from "./queryValidator";
import * as fs from "fs-extra";
import {FILTER_DATA} from "./queryExecutor";


export class QueryManager {
	private query: QUERY;
	private result: Set<InsightResult>;
	private errors: string[];
	private ids: Set<string>;
	private dataFolder: string;
	protected QUERY_MAX: number = 5000;
	constructor(query: unknown) {
		this.query = query as QUERY;
		this.result = new Set();
		this.errors = [];
		this.ids = new Set();
		this.dataFolder = "data/datasets.json";

	}

	public async execute(): Promise<InsightResult[]> {

		try {
			const dataset = this.getDatasetById(this.getQueryDatasetId());
			const valid = this.validate();
			if(!valid){
				const firstError: string = this.errors[0];
				return Promise.reject(firstError);
			}
			const filter = this.query.WHERE;
			for(const section of dataset as unknown as InsightResult[]) {
				if(FILTER_DATA(filter as FILTER,section as unknown as Section)){
					const res: InsightResult = this.getColumns(section);
					this.result.add(res);

				}
			}
			if(this.result.size > this.QUERY_MAX){
				return Promise.reject(new ResultTooLargeError("Result too large"));
			}
			return Promise.resolve([...this.result]);
		} catch (error) {
			throw new Error();
		}
	}

	public getQueryDatasetId(){
		const arr = [...this.ids];
		return arr[0];
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
		return validateQuery(this.query as QUERY,this.errors, [...this.ids]);

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

	private async readPersistedData(){
		try {
			const datasets = await fs.readJson(this.dataFolder);
			return datasets;
		} catch(error: unknown) {

			return [];
		}
	}

	private async getDatasetById(id: string) {
		try {
			const datasets = await this.readPersistedData();
			for(const d of datasets){
				if(d.id === id){
					return d.data;
				}
			}
			return [];
		}catch(error: unknown){

			return [];
		}
	}

}
