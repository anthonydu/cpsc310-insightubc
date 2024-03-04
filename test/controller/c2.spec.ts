import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect, use} from "chai";

import chaiAsPromised from "chai-as-promised";

import {clearDisk, getContentFromArchives, readFileQueries} from "../TestUtil";

// const validQueries = readFileQueries("c2/valid");
// const invalidQueries = readFileQueries("c2/invalid");

let facade: IInsightFacade;
let campus: string;

export default function testInsightFacade() {
	use(chaiAsPromised);

	describe("InsightFacade (c2)", () => {
		before(async () => {
			facade = new InsightFacade();
			campus = await getContentFromArchives("campus.zip");
		});

		beforeEach(async () => {
			await clearDisk();
		});

		testAddDataset();
		testListDatasets();
		testRemoveDataset();
		testPerformQuery();
	});
}

function testAddDataset() {
	describe("#addDataset()", () => {
		it("valid dataset fulfilled", async () => {
			await facade.addDataset("a", campus, InsightDatasetKind.Rooms);
			await facade.addDataset("b", campus, InsightDatasetKind.Rooms);
			return expect(facade.addDataset("c", campus, InsightDatasetKind.Rooms)).to.become(["a", "b", "c"]);
		});
	});
}
function testListDatasets() {
	describe("#listDatasets()", () => {
		it("non-empty dataset fulfilled", async () => {
			await facade.addDataset("a", campus, InsightDatasetKind.Rooms);
			await facade.addDataset("b", campus, InsightDatasetKind.Rooms);
			await facade.addDataset("c", campus, InsightDatasetKind.Rooms);
			await facade.removeDataset("b");
			return expect(facade.listDatasets()).to.become([
				{
					id: "a",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
				{
					id: "c",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
			]);
		});
	});
}

function testRemoveDataset() {
	return;
}

function testPerformQuery() {
	return;
}
