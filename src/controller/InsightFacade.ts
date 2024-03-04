import * as fs from "fs-extra";
import JSZip from "jszip";

import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";
import {QueryManager} from "./queryManager";
import {Building, GeoResponse, PersistDataset, Room, Section} from "./queryTypes";
import {parse as parse5} from "parse5";
import {NodePlus} from "./NodePlus";

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
			return [];
		}
	}

	// file should be index.htm
	private static async parseBuildings(file: string): Promise<Building[]> {
		const buildings: Building[] = [];
		try {
			const document = new NodePlus(parse5(file));
			const tables = document.getElementsBy("tagName", "table");
			const buildingTable = tables.filter((table) => {
				return table.getElementsBy("className", "views-field-field-building-code").length > 0;
			})[0];
			const tbody = buildingTable.getElementsBy("tagName", "tbody")[0];
			const rows = tbody.getElementsBy("tagName", "tr");
			await Promise.all(
				rows.map(async (row) => {
					const titleNode = row.getElementsBy("className", "views-field-title")[0];
					const address = row.getElementsBy("className", "views-field-field-building-address")[0].getText();
					const response = await fetch(
						encodeURI(`http://cs310.students.cs.ubc.ca:11316/api/v1/project_team142/${address}`)
					);
					const geoResponse: GeoResponse = await response.json();
					if (geoResponse.error) {
						throw new Error("GeoResponse error");
					}
					buildings.push({
						fullname: titleNode.getElementsBy("tagName", "a")[0].getText(),
						shortname: row.getElementsBy("className", "views-field-field-building-code")[0].getText(),
						address,
						lat: geoResponse.lat as number,
						lon: geoResponse.lon as number,
						href: titleNode.getElementsBy("tagName", "a")[0].getAttributes().href,
					});
				})
			);
		} catch (e) {
			throw new InsightError(`Parse index.htm failed: ${e}`);
		}
		if (buildings.length === 0) {
			throw new InsightError("No valid buildings.");
		}
		return buildings;
	}

	// assume all file is linked from index.htm
	private static parseRoom(file: string, building: Building): Room[] {
		const rooms: Room[] = [];
		try {
			const document = new NodePlus(parse5(file));
			const tables = document.getElementsBy("tagName", "table");
			const roomTable = tables.filter((table) => {
				return table.getElementsBy("className", "views-field-field-room-number").length > 0;
			})[0];
			if (!roomTable) {
				return [];
			}
			const tbody = roomTable.getElementsBy("tagName", "tbody")[0];
			const rows = tbody.getElementsBy("tagName", "tr");
			rows.forEach((row) => {
				const roomNumberNode = row.getElementsBy("className", "views-field-field-room-number")[0];
				const roomNumber = roomNumberNode.getElementsBy("tagName", "a")[0].getText();
				rooms.push({
					...building,
					number: roomNumber,
					name: building.shortname + "_" + roomNumber,
					seats: parseInt(row.getElementsBy("className", "views-field-field-room-capacity")[0].getText(), 10),
					type: row.getElementsBy("className", "views-field-field-room-type")[0].getText(),
					furniture: row.getElementsBy("className", "views-field-field-room-furniture")[0].getText(),
					href: roomNumberNode.getElementsBy("tagName", "a")[0].getAttributes().href,
				});
			});
		} catch (e) {
			throw new InsightError(`Parse room failed: ${e}`);
		}
		return rooms;
	}

	private static parseSections(files: string[]): Section[] {
		const sections: Section[] = [];
		for (const file of files) {
			try {
				for (const section of JSON.parse(file).result) {
					sections.push({
						uuid: String(section.id),
						id: section.Course as string,
						title: section.Title as string,
						instructor: section.Professor as string,
						dept: section.Subject as string,
						year: section.Section === "overall" ? 1900 : parseInt(section.Year, 10),
						avg: parseFloat(section.Avg),
						pass: parseInt(section.Pass, 10),
						fail: parseInt(section.Fail, 10),
						audit: parseInt(section.Audit, 10),
					} as Section);
				}
			} catch {
				continue;
			}
		}
		return sections;
	}

	private static async processSections(content: string): Promise<Section[]> {
		const zip = new JSZip();
		let sections: Section[];
		try {
			const courses = await zip.loadAsync(content, {base64: true});
			if (!courses.files["courses/"]) {
				throw new InsightError("No courses folder.");
			}
			const files: Array<Promise<string>> = [];
			for (const file of Object.values(courses.files)) {
				files.push(file.async("string"));
			}
			sections = await this.parseSections(await Promise.all(files));
		} catch (e) {
			throw new InsightError(e as string);
		}
		if (sections.length === 0) {
			throw new InsightError("No valid sections.");
		}
		return sections;
	}

	private static async processRooms(content: string): Promise<Room[]> {
		const zip = new JSZip();
		let rooms: Room[][] = [];
		try {
			const campus = await zip.loadAsync(content, {base64: true});
			if (!campus.file("index.htm")) {
				throw new InsightError("No index.htm file.");
			}
			const buildingsFolder = campus.folder("campus/discover/buildings-and-classrooms/");
			if (!buildingsFolder) {
				throw new InsightError("No campus/discover/buildings-and-classrooms folder.");
			}
			const buildings = await this.parseBuildings(await campus.files["index.htm"].async("string"));
			await Promise.all(
				buildings.map(async (building) => {
					const buildingFile = campus.file(building.href.split("./").slice(-1)[0]);
					if (!buildingFile) {
						return;
					}
					rooms.push(await this.parseRoom(await buildingFile.async("string"), building));
				})
			);
		} catch (e) {
			throw new InsightError(e as string);
		}
		if (rooms.length === 0) {
			throw new InsightError("No valid rooms.");
		}
		return rooms.flat();
	}

	private static idInvalid(id: string) {
		return id.includes("_") || id.trim() === "";
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let datasets: PersistDataset[] = await InsightFacade.readPersist();
		if (InsightFacade.idInvalid(id) || datasets.some((dataset) => dataset.id === id)) {
			throw new InsightError("Invalid id.");
		}
		let data: Section[] | Room[];
		if (kind === InsightDatasetKind.Sections) {
			data = await InsightFacade.processSections(content);
		} else {
			data = await InsightFacade.processRooms(content);
		}
		datasets.push({id, kind, numRows: data.length, data});
		await fs.outputJSON(persistFile, datasets);
		return datasets.map((dataset) => dataset.id);
	}

	public async removeDataset(id: string): Promise<string> {
		let datasets: PersistDataset[] = await InsightFacade.readPersist();
		if (InsightFacade.idInvalid(id)) {
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
