import InsightFacade from "../../src/controller/InsightFacade";
// eslint-disable-next-line max-len
import {InsightDatasetKind, InsightError, NotFoundError, ResultTooLargeError} from "../../src/controller/IInsightFacade";
import {clearDisk, getContentFromArchives} from "../resources/archives/TestUtil";
import {expect} from "chai";
import "mocha";
import "chai-as-promised";
import * as fs from "fs-extra";
import JSZip from "jszip";


// Taken from the specification page as recommended
export interface ITestQuery {

	title: string; // title of the test case

	input: unknown; // the query under test

	errorExpected: boolean; // if the query is expected to throw an error

	expected: any; // the expected result

}


function isIDValid(id: string): boolean {
	const trimmedId = id.trim();
	const emptyString = "";
	const underscore = "_";

	return trimmedId === emptyString || trimmedId.includes(underscore);
}

// check if any of the sections is missing a query key
function isSectionValid(section: {[x: string]: undefined;}): boolean {
	const queryKeys: string[] = ["id", "Course", "Title", "Professor",
		"Subject", "Year", "Avg", "Pass", "Fail", "Audit"];
	for (const key of queryKeys) {
		if (section[key] === undefined) {
			return false;
		}
	}

	return true;
}

function isCourseValid(course: string): boolean {
	try {
		const data = JSON.parse(course); // any JSOn error will be caught within catch
		const sections = data.result;

		// a course is valid if it has no invalid section
		// therefore, invalidate course if any such section is found :)
		// waiting on piazza confirmation to see if this interpretation is correct
		for (const section of sections) {
			if (!isSectionValid(section)) {
				return false;
			}
		}
		return true;
	} catch (error) {
		return false;
	}
}
async function isDataSetValid(content: string): Promise<boolean> {

	return false;
}

async function getCoursesJSONData(content: string) {
	try {
		const zipObj = new JSZip();
		await zipObj.loadAsync(content).then(async (zip: JSZip) => {
			const subfolder = zip.folder("courses");
			const allCourses: string[] = [];

			if (subfolder) {
				const filesObj = subfolder.files;
				const filePaths = Object.keys(filesObj);
				for (const coursePath of filePaths) {
					const courseFile = subfolder.file(coursePath);
					const courseContent = await courseFile?.async("string");
					if (courseContent) {
						allCourses.push(courseContent);
					}

				}
			}
			return allCourses;
		});
	} catch (error: any) {
		throw new Error(error.message);
	}


}

function testAddDataset() {


	describe("addDataset-Id tests", () => {
		let sections: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("valid1.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject with  an empty string as dataset id", async () => {
			try {
				const id = "";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("SHould have rejected as id is empty string");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});
		it("should reject with  an empty-space dataset id", async () => {
			try {
				const id = "  ";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should have rejected with empty characters as id");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);

			}


		});

		it("should reject with  an  dataset id with an underscore1", async function () {
			try {
				const id = "ubc_okanagan";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should have rejected because id contains underscore");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});
		it("should reject with  an  dataset id with an underscore2", async () => {
			try {
				const id = "ubc_";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);

				expect.fail("Should have rejected with dataset id `ubc_`");

			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});
		it("should reject with  an  dataset id with an underscore3", async () => {
			try {
				const id = "_ubc";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should reject  operation add dataset with id `_ubc`");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});
		it("should reject with  an  dataset id with an underscore4", async () => {
			try {
				const id = "_ubc_";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should reject  operation add dataset with id `_ubc_`");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}

		});


		it("should reject if id already exists", async () => {
			try {
				const id = "ubc";
				const result1 = await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect(result1).to.contain(id);
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should reject  operation add dataset with id `ubc` already existent");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}
		});
		it("should add successfully", async function () {
			try {
				const id = "cs";
				const result = await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect(result).to.contain(id);
			} catch (error: any) {
				expect.fail("Dataset should have been added successfully with id `cs`");
			}

		});
		it("should add successfully, remove and be able to add succesffully again", async () => {
			try {
				const id = "csd";
				const result1 = await facade.addDataset(id, sections, InsightDatasetKind.Sections);

				expect(result1).to.contain(id);
				await facade.removeDataset(id);
				const result2 = await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect(result2).to.contain(id);
			} catch (error: any) {
				expect.fail("Should have added without error--adding, removing and adding again");
			}


		});


	});
	// Test - Add invalid dataset
	describe("addDataset-Invalid Sections-courses not within the /courses folder", () => {
		let sections: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("nodir-courses-valid-content.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject with  missing courses folder", async () => {
			try {
				const id = "ubc2";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should have rejected data without /courses folder");

			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}
		});


	});
	// Test - Add invalid dataset
	describe("addDataset-Invalid Sections-courses not within the /courses folder", () => {
		let sections: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("invalid-sections.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject with invalid sections1", async () => {
			try {
				const id = "ubcok";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should reject dataset with invalid sections");

			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});


	});
	// Test - Add invalid dataset--missing JSON brackets
	describe("addDataset-Invalid -- missing JSON brackets", () => {
		let sections: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("invalidJSON-missing-brackets.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject with invalid sections2", async () => {
			try {
				const id = "ubco";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should not add dataset with invalid course sections");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});


	});

	// Test - Add invalid dataset--missing JSON quotations
	describe("addDataset-Invalid --missing JSON quotations", () => {
		let sections: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("invalidJSON-missing-quotations.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject with invalid sections4", async () => {
			try {
				const id = "ubc3";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should not add dataset with invalid course sections");

			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});


	});
	// Test - Add invalid dataset--missing JSON format
	describe("addDataset-Invalid Missing JSON", () => {
		let sections: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("no-JSON.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject with invalid sections5", async () => {
			try {
				const id = "ubc4";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should reject dataset with invalid course sections");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}
		});


	});
	// Test - Add invalid dataset--empty course
	describe("addDataset-Invalid Missing JSON", () => {
		let sections: string;
		let sections2: string;
		let sections3: string;


		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("empty.zip");
			sections2 = await getContentFromArchives("2empty.zip");
			sections3 = await getContentFromArchives("multiple-empty.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject with invalid dataset because of course with empty sections", async () => {
			try {
				const id = "ubc4";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect.fail("Should reject dataset with invalid course sections");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}
		});
		it("should reject with invalid dataset because of courses with empty sections", async () => {
			try {
				const id = "ubc-empty";
				await facade.addDataset(id, sections2, InsightDatasetKind.Sections);
				expect.fail("Should reject dataset with invalid course sections");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}
		});
		it("should reject with invalid dataset because of many courses with empty sections", async () => {
			try {
				const id = "ubc-m-empty";
				await facade.addDataset(id, sections3, InsightDatasetKind.Sections);
				expect.fail("Should reject dataset with invalid course sections");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}
		});


	});


	// Test - Add multiple valid courses
	describe("addDataset-valid-multiple courses", () => {
		let sections: string;
		let sections2: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("multiple-valid.zip");
			sections2 = await getContentFromArchives("1.empty-1.valid.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should add dataset with valid sections", async () => {
			try {
				let id = "ubc5";
				const result = await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect(result).to.contain(id);
				id = "ubc-courses";
				const result1 = await facade.addDataset(id, sections2, InsightDatasetKind.Sections);
				expect(result1).to.contain(id);
			} catch (error: any) {
				expect.fail("Should not have rejected an error courses with valid sections");
			}


		});
		it("should add dataset with valid sections 2", async () => {
			try {
				const id = "ubc-5";
				const result = await facade.addDataset(id, sections2, InsightDatasetKind.Sections);
				expect(result).to.contain(id);
			} catch (error: any) {
				expect.fail("Should not have rejected an error courses with valid sections");
			}


		});


	});

	// Test Sections
	describe("addDataset-Sections tests", () => {
		let sections: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("valid1.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject with  empty section", async () => {
			try {
				const id = "ubc1";

				await facade.addDataset(id, "", InsightDatasetKind.Sections);
				expect.fail("Should reject dataset with empty string as sections");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}
		});
		it("should reject with  sections other than Base64 encoded string' ", async () => {
			try {
				const id = "ubc1";
				await facade.addDataset(id, "Ayo Cheatah, Wassup", InsightDatasetKind.Sections);
				expect.fail("Should not add non-encoded sections");
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}

		});
		it("should accept valid sections ", async () => {
			try {
				const id = "ubc1";
				const result = await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				expect(result).to.contain(id);
			} catch (error: any) {
				expect.fail("Expected dataset to be added successfully");
			}


		});


	});

}// here ends add tests-


function testRemoveDataset() {
	describe("RemoveDataset", () => {
		let sections: string;

		let facade: InsightFacade;


		before(async () => {

			sections = await getContentFromArchives("valid1.zip");

		});


		beforeEach(async () => {
			await clearDisk();
			facade = new InsightFacade();

		});


		it("should reject removal with  an empty dataset id", async () => {
			try {
				const id = "new-data";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				const result = await facade.removeDataset("");
				expect(result).to.be.instanceOf(NotFoundError);
			} catch (error: any) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});
		it("should reject with  an invalid dataset id", async () => {
			try {
				const id = "new";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				const result = await facade.removeDataset("new_");
				expect(result).to.be.instanceOf(NotFoundError);
			} catch (error) {
				expect(error).to.be.instanceOf(InsightError);
			}


		});
		it("should remove successfully", async () => {
			try {
				const id = "new";
				await facade.addDataset(id, sections, InsightDatasetKind.Sections);
				const result = await facade.removeDataset("new");
				expect(result).to.be.equal(id);
			} catch (error) {
				expect.fail("Should have removed data successfully");
			}


		});

	});
}

function testListDatasets() {
	describe("listDatasets", () => {
		let sections1: string;
		let sections2: string;
		let sections3: string;


		let facade: InsightFacade;


		before(async function () {

			sections1 = await getContentFromArchives("valid1.zip");
			sections2 = await getContentFromArchives("multiple-valid.zip");
			sections3 = await getContentFromArchives("1.empty-1.valid.zip");

		});


		beforeEach(async () => {
			await clearDisk();

			facade = new InsightFacade();

		});

		it("should list all dataset", async () => {
			try {

				await facade.addDataset("test1", sections1, InsightDatasetKind.Sections);
				await facade.addDataset("test2", sections2, InsightDatasetKind.Sections);
				await facade.addDataset("test3", sections3, InsightDatasetKind.Sections);
				const datasets = await facade.listDatasets();

				datasets.forEach((dataset) => {
					expect(dataset).to.have.property("id");
					expect(dataset).to.have.property("kind");
					expect(dataset).to.have.property("numRows");
				});
			} catch (error: any) {
				expect.fail("Should not return any error-datasets should have been listed.");
			}


		});

	});
}

/**
 *
 * Searches for test query JSON files in the path.
 *
 * @param path The path to the sample query JSON files.
 */

function readFileQueries(path: string): ITestQuery[] {

	// Note: This method *must* be synchronous for Mocha

	const fileNames = fs.readdirSync(`test/resources/queries/${path}`);


	const allQueries: ITestQuery[] = [];

	for (const fileName of fileNames) {

		const fileQuery = fs.readJSONSync(`test/resources/queries/${path}/${fileName}`);


		allQueries.push(fileQuery);

	}


	return allQueries;

}
function testPerformQuery() {
	describe("PerformQuery", () => {
		let sections: string;
		let facade: InsightFacade;


		before(async () => {
			facade = new InsightFacade();
			sections = await getContentFromArchives("pair.zip");

			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);


		});

		describe("PerformQuery-Invalid queries", () => {

			let invalidQueries: ITestQuery[];
			try {

				invalidQueries = readFileQueries("invalid");


			} catch (e: unknown) {

				expect.fail(`Failed to read one or more test queries. ${e}`);

			}

			invalidQueries.forEach((test: ITestQuery) => {

				it(`${test.title}`, async () => {
					const RESULT_TOO_LARGE_ERROR: string = "ResultTooLargeError";
					try {
						await facade.performQuery(test.input);
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


				validQueries = readFileQueries("valid");

			} catch (e: unknown) {

				expect.fail(`Failed to read one or more test queries. ${e}`);

			}

			validQueries.forEach((test: ITestQuery) => {

				it(test.title, async () => {
					try {
						const queryResult = await facade.performQuery(test.input);
						expect(queryResult).to.deep.equal(test.expected);

					} catch (error: any) {
						expect.fail("performQuery threw unexpected error");
					}

				});

			});

		});
	});


}


describe("InsightFacade Test Suite", () => {
	testAddDataset();
	testListDatasets();
	testRemoveDataset();
	testPerformQuery();

});
