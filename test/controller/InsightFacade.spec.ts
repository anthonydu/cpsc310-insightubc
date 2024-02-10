import antduTests from "./antdu.spec";
import syabreTests from "./syabre.spec";

describe("InsightFacade (syabre)", () => {
	syabreTests();
});
describe("InsightFacade (antdu)", () => {
	antduTests();
});

