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

import {ITestQuery, clearDisk, getContentFromArchives, readFileQueries} from "../TestUtil";

import fs from "fs-extra";


let facade: IInsightFacade;
let campus: string;
let sections: string;

export default function testInsightFacade() {
	use(chaiAsPromised);

	describe("InsightFacade (c2)", () => {
		before(async () => {
			facade = new InsightFacade();
			campus = await getContentFromArchives("campus.zip");
			sections =  await getContentFromArchives("pair.zip");
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
		it("correctly adds dataset to disk", async () => {
			await facade.addDataset("a", campus, InsightDatasetKind.Rooms);
			const data = fs.readJsonSync("data/datasets.json")[0].data;
			const expected = readFileQueries("c2/valid").find(
				(query) => query.title === "room all rows all cols"
			)?.expected;
			for (const key in expected) {
				// remove "rooms_" prefix
				expected[key.substring(6)] = expected[key];
				delete expected[key];
			}
			return expect(data).to.deep.members(expected);
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
	describe("C2 PerformQuery", () => {

		beforeEach(async () => {
			await facade.addDataset("rooms", campus, InsightDatasetKind.Rooms);
			// await facade.addDataset("sections", sections, InsightDatasetKind.Sections);

		});

		describe("C2 PerformQuery-Invalid queries", () => {
			let invalidQueries: ITestQuery[];
			try {
				invalidQueries = readFileQueries("c2/invalid");
			} catch (e: unknown) {
				expect.fail(`Failed to read one or more test queries. ${e}`);
			}

			invalidQueries.forEach((test: ITestQuery) => {
				it(`${test.title}`, async () => {
					const RESULT_TOO_LARGE_ERROR: string = "ResultTooLargeError";
					try {
						const res = await facade.performQuery(test.input);
						expect.fail("performQuery should have thrown an error because query is invalid}");
					} catch (error: any) {
						if (test.errorExpected && test.expected === RESULT_TOO_LARGE_ERROR) {
							expect(error).to.be.instanceOf(ResultTooLargeError);
						} else if (test.errorExpected) {
							expect(error).to.be.instanceOf(InsightError);
						}
					}
				});
			});
		});

		describe("PerformQuery-Valid queries", () => {
			let validQueries: ITestQuery[];
			try {
				validQueries = readFileQueries("c2/valid");
			} catch (e: unknown) {
				expect.fail(`Failed to read one or more test queries. ${e}`);
			}
			validQueries.forEach((test: ITestQuery) => {

				it(test.title, async () => {
					try {
						const queryResult = await facade.performQuery(test.input);

						expect(queryResult).to.deep.members(test.expected);
						expect(test.expected).to.deep.members(queryResult);
						expect(queryResult.length).to.deep.equal(test.expected.length);
					} catch (error: any) {
						console.log("ERROR",error);
						expect.fail("performQuery threw unexpected error");
					}
				});

			});
		});
	});
}
