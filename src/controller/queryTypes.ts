import {InsightDataset} from "./IInsightFacade";

export type LOGIC = "AND" | "OR";
export type MCOMPARATOR = "LT" | "GT" | "EQ";

export type MFIELD= "avg" | "pass" | "fail" | "audit" | "year" | "lat" | "lon" | "seats";
export type SFIELD = "dept" | "id" | "instructor" | "title" | "uuid" | "fullname" |
 "shortname" | "number" | "name" | "address" | "type"| "furniture" | "href";

export type IDSTRING = string;

export type SKEY = `"${IDSTRING}_${SFIELD}"`;
export type MKEY = `"${IDSTRING}_${MFIELD}"`;
export type KEY = MKEY | SKEY;
export type KEYLIST = KEY [];
export type DIRECTION = "UP" | "DOWN";

export interface SCOMPARISON {
    IS: {
        [skey in SKEY]: string;
    };
}
export interface NEGATION {
    NOT: FILTER;
}

export type LOGICCOMPARISON = Partial<{
	[key in LOGIC]: FILTER[];
}>;

export type MCOMPARISON = Partial<{
    [comparator in MCOMPARATOR]: Partial<{
        [mkey in MKEY]: number;
    }>;
}>;

export type FILTER = LOGICCOMPARISON | MCOMPARISON | SCOMPARISON | NEGATION;

export interface OPTIONS {
    COLUMNS: ANYKEY[];
    ORDER?: any;
}

export interface QUERY {
    WHERE: FILTER | Record<never,never>; // FILTER of an empty object
    OPTIONS: OPTIONS;
	TRANSFORMATIONS: TRANSFORMATIONS
}

export interface Section {
	uuid: string;
	id: string;
	title: string;
	instructor: string;
	dept: string;
	year: number;
	avg: number;
	pass: number;
	fail: number;
	audit: number;
}
export interface Room {
    fullname: string; // Full building name
    shortname: string; // Short building name
    number: string; // Room number (represented as string)
    name: string; // Room id (rooms_shortname + "_" + rooms_number)
    address: string; // Building address
    lat: number; // Latitude of the building
    lon: number; // Longitude of the building
    seats: number; // Number of seats in the room
    type: string; // Room type
    furniture: string; // Room furniture
    href: string; // Link to the full details online
}

export interface PersistDataset extends InsightDataset {
	data: Section[];
}

export interface ValidationResponse{
	valid: boolean,
	error?: string
}


/**
 * "TRANSFORMATIONS": {
 * "GROUP": ["sections_title"],
 *
 * "APPLY": [{
 *
 * "overallAvg": {
 *
 * "AVG": "sections_avg"
 *
 * }
 *
 * }]
 *
 * }
 */

export type APPLYKEY = string;
export type GROUP = KEY[];
export type APPLYTOKEN = "MAX" | "MIN" | "AVG" | "COUNT" | "SUM";
export type APPLYRULE = {
    [key in APPLYKEY]: {
        [token in APPLYTOKEN]: KEY;
    };
};
export type APPLY = APPLYRULE[] ;
export type ANYKEY = KEY | APPLYKEY;
export interface ORDER {
	dir: DIRECTION,
	keys: ANYKEY[]
}
export type ORDER2 = ANYKEY;
/**
 * "TRANSFORMATIONS": {
 * "GROUP": ["sections_title"],
 *
 * "APPLY": [{
 *
 * "overallAvg": {
 *
 * "AVG": "sections_avg"
 *
 * }
 *
 * }]
 *
 * }
 */
export interface TRANSFORMATIONS {GROUP: KEY[], APPLY: APPLY}
export const mkeys = ["avg","pass","fail","audit","year","lat","lon","seats"];
export const skeys = ["dept","id","instructor","title","uuid","fullname",
	"shortname","number","name","address","type","furniture","href"];
export const applyTokens = ["MAX","MIN","SUM","COUNT","AVG"];
