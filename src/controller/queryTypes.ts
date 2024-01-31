import {InsightDataset} from "./IInsightFacade";

export type LOGIC = "AND" | "OR";
export type MCOMPARATOR = "LT" | "GT" | "EQ";

export type MFIELD= "avg" | "pass" | "fail" | "audit" | "year";
export type SFIELD = "dept" | "id" | "instructor" | "title" | "uuid";

export type IDSTRING = string;

export type SKEY = `"${IDSTRING}_${SFIELD}"`;
export type MKEY = `"${IDSTRING}_${MFIELD}"`;
export type KEY = MKEY | SKEY;

export type KEYLIST = KEY [];

export interface SCOMPARISON {
    IS: {
        [skey in SKEY]: string;
    };
}
export interface NEGATION {
    NOT: FILTER;
}

export type LOGICCOMPARISON = {
	[key in LOGIC]: FILTER[];
};

export type MCOMPARISON = {
    [comparator in MCOMPARATOR]: {
        [mkey in MKEY]: number;
    };
};

export type FILTER = LOGICCOMPARISON | MCOMPARISON | SCOMPARISON | NEGATION;

export interface OPTIONS {
    COLUMNS: KEYLIST;
    ORDER?: KEY;
}

export interface QUERY {
    WHERE: FILTER | Record<never,never>; // FILTER of an empty object
    OPTIONS: OPTIONS;
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

export interface PersistDataset extends InsightDataset {
	sections: Section[];
}

