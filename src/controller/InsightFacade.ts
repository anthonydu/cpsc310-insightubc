/* eslint-disable max-lines */
import JSZip from "jszip";
// eslint-disable-next-line max-len
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {QueryManager} from "./queryManager";


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
		const maxLength: number = 5000;
		const ids = queryManager.getIds();
		const datasets = await this.listDatasets();
		const result = await queryManager.execute();

		return new Promise((resolve, reject) =>{

			let match: string = "";
			for(const dset of datasets){
				if(dset.id === ids[0]){
					match = dset.id;

				}
			}
			if(match === ""){
				return reject(new InsightError("Provided id does not have an associated dataset"));
			}

			const validated = queryManager.validate();
			if(validated){
				if(result.length > maxLength){
					return reject(new ResultTooLargeError("Result size exceeds the maximum allowed threshold"));
				}
				return resolve(result);
			}
			const errors: string[] = queryManager.getErrors();
			return reject(new InsightError(errors[0]));

		});

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

