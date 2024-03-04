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

const validQueries = readFileQueries("c2/valid");
const invalidQueries = readFileQueries("c2/invalid");

export default function testInsightFacade() {
	use(chaiAsPromised);
	testAddDataset();
	testListDatasets();
	testRemoveDataset();
	testPerformQuery();
}

function testAddDataset() {
	throw new Error("Function not implemented.");
}
function testListDatasets() {
	throw new Error("Function not implemented.");
}

function testRemoveDataset() {
	throw new Error("Function not implemented.");
}

function testPerformQuery() {
	throw new Error("Function not implemented.");
}
