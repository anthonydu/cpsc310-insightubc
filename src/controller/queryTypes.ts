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
	TRANSFORMATIONS?: TRANSFORMATIONS
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

export interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}

export interface Building {
	fullname: string;
	shortname: string;
	address: string;
	lat: number;
	lon: number;
	href: string;
}

export interface Room extends Building {
	number: string;
	name: string;
	seats: number;
	type: string;
	furniture: string;
}

export interface PersistDataset extends InsightDataset {
	data: Section[] | Room[];
}

export interface ValidationResponse {
	valid: boolean;
	error?: string;
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
