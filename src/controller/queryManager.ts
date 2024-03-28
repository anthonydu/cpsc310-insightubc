import * as fs from "fs-extra";
import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {FILTER_DATA, orderResults} from "./queryExecutor";
import {APPLY, FILTER, Item, QUERY, Section,mkeys} from "./queryTypes";
import {validateQuery} from "./queryValidator";
import {executeTransformations} from "./aggregations";
import {getApplyKeys} from "./transformationsValidators";


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
		const firstRequirement: boolean = !this.query?.OPTIONS?.COLUMNS || this.query.OPTIONS.COLUMNS.length < 1;
		if (firstRequirement || !Array.isArray(this.query.OPTIONS.COLUMNS)) {
			return Promise.reject(new InsightError("Empty or missing or non-array columns"));
		}
		// let firstColumn: string;
		// try {
		// 	firstColumn = this.query.OPTIONS.COLUMNS[0] as string;
		// } catch (error) {
		// 	return Promise.reject(new InsightError("Error reading data"));
		// }
		// const parts = firstColumn.split("_");
		// if (parts.length < 1) {
		// 	return Promise.reject(new InsightError(`Invalid column ${firstColumn}`));
		// }

		const valid = this.validate();
		// logic to validate if a query references two different dataset ids
		if (new Set(this.getIds()).size > 1) {
			return Promise.reject(new InsightError("Multiple data sets referenced"));
		}
		if (!valid) {

			const firstError: string = this.errors[0];
			return Promise.reject(new InsightError(firstError));
		}
		const id: string = this.ids[0];
		const dataset = await this.getDatasetById(id);
		if (!Array.isArray(dataset)) {
			return Promise.reject(new InsightError(`No dataset with id ${id}`));
		}
		return this.handleFinalQuery(dataset);

	}

	public handleFinalQuery(dataset:  InsightResult[]):  Promise<InsightResult[]> {
		const filter = this.query.WHERE;
		// empty WHERE, get everything
		if (Object.keys(filter).length === 0) {
			this.result = dataset;
		} else {
			for (const item of dataset as unknown as InsightResult[]) {
				if (FILTER_DATA(filter as FILTER, item as unknown as Item)) {
					this.result.push(item);
				}
			}
		}

		if(this.query.TRANSFORMATIONS !== undefined){
			this.result = executeTransformations(this.query.TRANSFORMATIONS,this.result,this.query.OPTIONS.COLUMNS);
		}

		const tempResults: InsightResult[] = [];
		for(const item of this.result){
			const res: InsightResult = this.getColumns(item);
			tempResults.push(res);
		}
		this.result = tempResults;
		if (this.result.length > this.QUERY_MAX) {
			return Promise.reject(new ResultTooLargeError("Result too large"));
		}
		if (this.query.OPTIONS.ORDER) {
			if (typeof this.query.OPTIONS.ORDER === "string" &&
			!this.query.OPTIONS.COLUMNS.includes(this.query.OPTIONS.ORDER)) {
				return Promise.reject(new InsightError("Order key not in columns"));
			}
			orderResults(this.query.OPTIONS.ORDER,this.result);
		}
		return Promise.resolve(this.result);
	}

	public getColumns(section: InsightResult): InsightResult {
		const columns: string[] = this.query.OPTIONS.COLUMNS;
		let res: InsightResult = {};
		const apply = this.query.TRANSFORMATIONS?.APPLY || [] as APPLY;
		const applykeys = getApplyKeys(apply as APPLY);

		for (const col of columns) {
			const parts = col.split("_");
			const fieldName = parts[1];

			if(applykeys?.includes(col)){
				res[col] = section[col] as number; // handling column names that are apply keys
			}else if(col in section){
				res[col] = section[col];
			}else if (mkeys.includes(fieldName)) {
				res[col] = section[fieldName] as number;
			} else {
				res[col] = section[fieldName];
			}
		}

		return res;
	}

	public validate(): boolean {
		//	empty errors and ids from previous validations
		this.resetValues();
		return validateQuery(this.query as QUERY, this.errors, this.ids);
	}

	private resetValues() {
		this.errors = [];
		this.ids = [];
		this.result = [];
	}

	public getErrors(): string[] {
		return this.errors;
	}

	public getIds(): string[] {
		return this.ids;
	}

	private async readPersistedData(): Promise<any[]> {
		try {
			const datasets = await fs.readJson(this.dataFolder);
			return datasets;
		} catch (error: unknown) {
			console.log(`Error reading persisted data: ${error}`);
			throw new InsightError("Error reading data");
		}
	}

	private async getDatasetById(id: string): Promise<InsightResult[]> {

		try {
			const datasets: InsightResult[] = await this.readPersistedData();

			for (const d of datasets) {
				if (d.id === id) {
					return d.data as unknown as InsightResult[];
				}
			}

			throw new InsightError();
		} catch (error: unknown) {
			throw new InsightError("Error reading data");
		}
	}

}
