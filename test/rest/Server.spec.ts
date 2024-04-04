import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";
const fs = require("fs-extra");

describe("Facade D3", function () {
	let campus: Buffer;
	let sections: string;
	let facade: InsightFacade;
	let server: Server;

	before(async function () {
		campus = fs.readFileSync("test/resources/archives/campus.zip");
		sections = fs.readFileSync("test/resources/archives/pair.zip");
		facade = new InsightFacade();
		server = new Server(4321);
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

	// it("PUT test for courses dataset", function () {
	// 	const endpoint = `dataset/random/${InsightDatasetKind.Rooms}`;
	// 	try {
	// 		return request("http://localhost:4321")
	// 			.put(endpoint)
	// 			.send(campus)
	// 			.set("Content-Type", "application/x-zip-compressed")
	// 			.then(function (res: Response) {
	// 				// some logging here please!
	// 				console.log(res);
	// 				expect(res.status).to.be.equal(200);
	// 			})
	// 			.catch(function (err) {
	// 				console.log(err);
	// 				expect.fail();
	// 			});
	// 	} catch (err) {
	// 		console.log(err);
	// 		expect.fail();
	// 	}
	// });

	it("Test add dataset", function () {
		const endpoint = "/dataset/random/rooms";
		try {
			return request("http://localhost:4321")
				.put(endpoint)
				.send(campus)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					console.log(res);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			console.log(err);
			expect.fail();
		}
	});

	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
});
