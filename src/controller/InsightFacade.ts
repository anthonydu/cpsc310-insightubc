/* eslint-disable max-lines */
import JSZip from "jszip";
import * as fs from "fs-extra";

import {IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError, InsightResult,
	ResultTooLargeError,
	PersistDataset,
	NotFoundError} from "./IInsightFacade";
import {QueryManager} from "./queryManager";
import {Section} from "./queryTypes";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
const persistFile = "data/datasets.json";

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
		return queryManager.execute();

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


