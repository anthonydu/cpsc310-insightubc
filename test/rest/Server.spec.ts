import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";
import {ITestQuery, clearDisk, getContentFromArchives, readFileQueries} from "../TestUtil";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";
const fs = require("fs-extra");

describe("Facade D3", function () {
	let campus: Buffer;
	let sections: string;
	let facade: InsightFacade;
	let server: Server;
	let validQueries: ITestQuery[];
	let invalidQueries: ITestQuery[];


	before(async function () {
		campus = fs.readFileSync("test/resources/archives/campus.zip");
		sections = fs.readFileSync("test/resources/archives/pair.zip");
		facade = new InsightFacade();
		server = new Server(4321);
		validQueries = readFileQueries("syabre/valid");
		invalidQueries = readFileQueries("syabre/invalid");
		await server.start();
	});

	after(async function () {
		await server.stop();
	});

	beforeEach(async function () {
		await clearDisk();
	});

	// afterEach(function () {
	// 	// might want to add some process logging here to keep track of what is going on
	// });

	// Sample on how to format PUT requests

	it("PUT test for Rooms- Fail", function () {
		const endpoint = `dataset/random_rooms/${InsightDatasetKind.Rooms}`;
		try {
			return request("http://localhost:4321")
				.put(endpoint)
				.send(campus)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {

					console.log(res);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					console.log(err);
					// expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// expect.fail();
		}
	});

	it("Test add dataset-Pass", function () {
		const endpoint = "/dataset/random/rooms";
		try {
			return request("http://localhost:4321")
				.put(endpoint)
				.send(campus)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			expect.fail();
		}
	});
	// it("PerformQuery-Pass", function () {
	// 	const endpoint = "/dataset/rooms/rooms";
	// 	try {
	// 		request("http://localhost:4321")
	// 			.put(endpoint)
	// 			.send(campus)
	// 			.set("Content-Type", "application/x-zip-compressed")
	// 			.then(function (res: Response) {
	// 				// console.log(res);
	// 				expect(res.status).to.be.equal(200);
	// 			})
	// 			.catch(function (err) {
	// 				// console.log(err);
	// 				expect.fail();
	// 			});
	// 		return request("http://localhost:4321")
	// 			.post("/query")
	// 			.send(validQueries[8].input as string)
	// 			.set("Content-Type", "application/json")
	// 			.then(function (res: Response) {
	// 						// console.log(res);
	// 				expect(res.status).to.be.equal(200);
	// 			})
	// 			.catch(function (err) {
	// 						// console.log(err);
	// 				expect.fail();
	// 			});


	// 	} catch (err) {
	// 		// console.log(err);
	// 		expect.fail();
	// 	}
	// });

	it("Delete dataset-Pass", function () {
		const endpoint = "/dataset/sections/sections";
		try {
			request("http://localhost:4321")
				.put(endpoint)
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});

			request("http://localhost:4321")
				.delete("/dataset/sections")
				.then(function (res: Response) {
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			expect.fail();
		}
	});

	it("List datasets-Pass", function () {
		const endpoint = "/dataset/sections/sections";
		try {
			request("http://localhost:4321")
				.put(endpoint)
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});

			request("http://localhost:4321")
				.get("/datasets")
				.then(function (res: Response) {
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			expect.fail();
		}
	});
	it("PerformQuery-Fail", function () {
		const endpoint = "/dataset/sections/sections";
		try {
			request("http://localhost:4321")
				.put(endpoint)
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// console.log(err);
					expect.fail();
				});
			return request("http://localhost:4321")
				.post("/query")
				.send(validQueries[8].input as string)
				.set("Content-Type", "application/json")
				.then(function (res: Response) {
							// console.log(res);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
							// console.log(err);
					// expect.fail();
				});


		} catch (err) {
			// console.log(err);
			// expect.fail();
		}
	});
	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
});
