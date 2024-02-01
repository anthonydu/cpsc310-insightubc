import syabreTests from "./syabre.spec";

// Taken from the specification page as recommended
export interface ITestQuery {
	title: string; // title of the test case

	input: unknown; // the query under test

	errorExpected: boolean; // if the query is expected to throw an error

	expected: any; // the expected result
}

syabreTests();
