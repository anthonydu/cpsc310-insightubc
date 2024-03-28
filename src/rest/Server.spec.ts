import {getContentFromArchives} from "../../test/TestUtil";

const request = require("supertest");
const express = require("express");

const app = express();
let campus: string;
let sections: string;
async function testInsightFacade() {
	campus = await getContentFromArchives("campus.zip");
	sections =  await getContentFromArchives("pair.zip");
	describe("API endpoints tests", () => {
		testAddDatasetEndpoint(campus);
		testListDatasetsEndpoint(sections);
		testRemoveDatasetEndpoint(sections);
		testPerformQueryEndpoint(campus);
	});
}

function testAddDatasetEndpoint(data: string){
	describe("PUT /", function() {
		it("responds with json", function(done) {
			request(app)
				.put("/dataset/sections/sections")
				.set("Accept", "application/json")
				.expect("Content-Type", /json/)
				.expect(200, done);
		});
	});
}
function testListDatasetsEndpoint(data: string){
	describe("PUT /", function() {
		it("responds with json", function(done) {
			request(app)
				.put("/dataset/sections/sections")
				.set("Accept", "application/json")
				.expect("Content-Type", /json/)
				.expect(200, done);
		});
	});

}
function testRemoveDatasetEndpoint(data: string){
	describe("PUT /", function() {
		it("responds with json", function(done) {
			request(app)
				.put("/dataset/sections/sections")
				.set("Accept", "application/json")
				.expect("Content-Type", /json/)
				.expect(200, done);
		});
	});

}
function testPerformQueryEndpoint(data: string ){
	describe("PUT /", function() {
		it("responds with json", function(done) {
			request(app)
				.put("/dataset/sections/sections")
				.set("Accept", "application/json")
				.expect("Content-Type", /json/)
				.expect(200, done);
		});
	});

}

