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

use(chaiAsPromised);

export interface ITestQuery {
	title: string;
	input: unknown;
	errorExpected: boolean;
	expected: any;
}

const errors = {
	InsightError,
	NotFoundError,
	ResultTooLargeError,
};

describe("InsightFacade (antdu)", () => {
	let facade: IInsightFacade;
	let minDataset: string;
	let validQueries = readFileQueries("antdu/valid");
	let invalidQueries = readFileQueries("antdu/invalid");

	before(async () => {
		minDataset = await getContentFromArchives("antdu/cpsc310.zip");
	});

	beforeEach(() => {
		facade = new InsightFacade();
	});

	describe("static tests", () => {
		beforeEach(async () => {
			await clearDisk();
		});

		describe("#addDataset()", () => {
			it("valid dataset fulfilled", async () => {
				await facade.addDataset("a", minDataset, InsightDatasetKind.Sections);
				await facade.addDataset("b", minDataset, InsightDatasetKind.Sections);
				return expect(facade.addDataset("c", minDataset, InsightDatasetKind.Sections)).to.become([
					"a",
					"b",
					"c",
				]);
			});
			it("empty id addition rejected", () => {
				return expect(
					facade.addDataset("", minDataset, InsightDatasetKind.Sections)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("underscore id addition rejected", () => {
				return expect(
					facade.addDataset("a_b", minDataset, InsightDatasetKind.Sections)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("whitespace id addition rejected", () => {
				return expect(
					facade.addDataset(" \n", minDataset, InsightDatasetKind.Sections)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("duplicate id rejected", async () => {
				await facade.addDataset("a", minDataset, InsightDatasetKind.Sections);
				return expect(
					facade.addDataset("a", minDataset, InsightDatasetKind.Sections)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("no course content rejected", async () => {
				return expect(
					facade.addDataset(
						"a",
						await getContentFromArchives("antdu/noCourses.zip"),
						InsightDatasetKind.Sections
					)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("no section content rejected", async () => {
				return expect(
					facade.addDataset(
						"a",
						await getContentFromArchives("antdu/noSections.zip"),
						InsightDatasetKind.Sections
					)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("invalid file structure content rejected", async () => {
				return expect(
					facade.addDataset(
						"a",
						await getContentFromArchives("antdu/invalidFileStructure.zip"),
						InsightDatasetKind.Sections
					)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("invalid JSON syntax content rejected", async () => {
				return expect(
					facade.addDataset(
						"a",
						await getContentFromArchives("antdu/invalidSyntax.zip"),
						InsightDatasetKind.Sections
					)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("invalid content string rejected", async () => {
				return expect(
					facade.addDataset("a", "pair.zip", InsightDatasetKind.Sections)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("room kind rejected", async () => {
				return expect(
					facade.addDataset("a", minDataset, InsightDatasetKind.Rooms)
				).to.eventually.be.rejectedWith(InsightError);
			});
			it("invalid kind rejected", async () => {
				return expect(facade.addDataset("a", minDataset, "invalid" as any)).to.eventually.be.rejectedWith(
					InsightError
				);
			});
		});

		describe("#removeDataset()", () => {
			it("non-existent dataset rejected", async () => {
				await facade.addDataset("a", minDataset, InsightDatasetKind.Sections);
				return expect(facade.removeDataset("b")).to.eventually.be.rejectedWith(NotFoundError);
			});
			it("existent dataset fulfilled (return value)", async () => {
				await facade.addDataset("a", minDataset, InsightDatasetKind.Sections);
				await facade.addDataset("b", minDataset, InsightDatasetKind.Sections);
				return expect(facade.removeDataset("a")).to.become("a");
			});
			it("empty id removal rejected", () => {
				return expect(facade.removeDataset("")).to.eventually.be.rejectedWith(InsightError);
			});
			it("underscore id removal rejected", () => {
				return expect(facade.removeDataset("a_b")).to.eventually.be.rejectedWith(InsightError);
			});
			it("whitespace id removal rejected", () => {
				return expect(facade.removeDataset(" \n")).to.eventually.be.rejectedWith(InsightError);
			});
		});

		describe("#listDatasets()", () => {
			it("empty dataset fulfilled", () => {
				return expect(facade.listDatasets()).to.become([]);
			});
			it("non-empty dataset fulfilled", async () => {
				await facade.addDataset("a", minDataset, InsightDatasetKind.Sections);
				await facade.addDataset("b", minDataset, InsightDatasetKind.Sections);
				await facade.addDataset("c", minDataset, InsightDatasetKind.Sections);
				await facade.removeDataset("b");
				return expect(facade.listDatasets()).to.become([
					{
						id: "a",
						kind: InsightDatasetKind.Sections,
						numRows: 39,
					},
					{
						id: "c",
						kind: InsightDatasetKind.Sections,
						numRows: 39,
					},
				]);
			});
		});
	});

	describe("#performQuery()", () => {
		before(async () => {
			await clearDisk();
			await facade.addDataset("sections", await getContentFromArchives("pair.zip"), InsightDatasetKind.Sections);
			await facade.addDataset("minimal", minDataset, InsightDatasetKind.Sections);
			await facade.addDataset(
				"test5000",
				await getContentFromArchives("antdu/test5000.zip"),
				InsightDatasetKind.Sections
			);
		});
		validQueries.forEach((validQuery) => {
			it(`${validQuery.title} fulfilled`, () => {
				return expect(facade.performQuery(validQuery.input)).to.eventually.become(validQuery.expected);
			});
		});
		invalidQueries.forEach((invalidQuery) => {
			it(`${invalidQuery.title} rejected`, () => {
				return expect(facade.performQuery(invalidQuery.input)).to.eventually.be.rejectedWith(
					errors[invalidQuery.expected as keyof typeof errors]
				);
			});
		});
	});
});
