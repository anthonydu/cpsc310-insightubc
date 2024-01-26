import * as fs from "fs-extra";


/**
 *
 * The directory where data is persisted.
 *
 * NOTE: this variable should _not_ be referenced from production code.
 */

const persistDir = "./data";


/**
 * Convert a file into a base64 string.
 *
 * @param name  The name of the file to be converted.
 *
 * @return Promise A base 64 representation of the file
 */

async function getContentFromArchives(name: string): Promise<string> {

	const buffer = await fs.readFile("test/resources/archives/" + name);

	return buffer.toString("base64");

}


/**
 * Removes all files within the persistDir.
 */

async function clearDisk(): Promise<void> {

	await fs.remove(persistDir);

}


export {getContentFromArchives, clearDisk} ;
