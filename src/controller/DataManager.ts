import {PersistDataset} from "./queryTypes";

export class DataManager {
	private datasets: PersistDataset[];

	constructor(datasets: PersistDataset[]) {
		this.datasets = datasets;
	}

	public getDatasetById(id: string): PersistDataset {
		for (const dataset of this.datasets) {
			if (dataset.id === id) {
				return dataset;
			}
		}
		return {} as PersistDataset;
	}

	public getDatasets(): PersistDataset[] {
		return this.datasets;
	}
}
