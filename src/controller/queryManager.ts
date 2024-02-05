/* eslint-disable max-lines */
// eslint-disable-next-line max-len
import {QUERY} from "./queryTypes";
import {InsightResult} from "./IInsightFacade";
import {DataManager} from "./DataManager";
import {validateQuery} from "./queryValidator";


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
			const valid = this.validate();
			return Promise.reject("Nothing");
		} catch (error) {
			throw new Error();
		}
	}

	public getQueryDatasetId(){
		const arr = [...this.ids];
		return arr[0];
	}

	public validate(): boolean{
		//	empty errors and ids from previous validations
		this.resetValues();
		return validateQuery(this.query as QUERY,this.errors);

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
}
