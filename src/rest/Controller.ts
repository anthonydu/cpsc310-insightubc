import express, {Application, Request, Response} from "express";
import {IInsightFacade, InsightDatasetKind, NotFoundError} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

export default class Controller {
	private facade: IInsightFacade;
	constructor() {
		this.facade = new InsightFacade();
		this.addDataset = this.addDataset.bind(this);
		this.listDatasets = this.listDatasets.bind(this);
		this.deleteDataset = this.deleteDataset.bind(this);
		this.performQuery = this.performQuery.bind(this);
	}

	public async addDataset(req: Request, res: Response) {
		try {
			console.log(`Server::addDataset(..) - params: ${JSON.stringify(req.params)}`);
			const id = req.params.id;
			const kind = req.params.kind;


			const response = await this.facade.addDataset(id,req.body,
				kind as InsightDatasetKind);
			return res.status(200).json({result: response});
		} catch (err) {
			return res.status(400).json({error: err});
		}
	}

	public async listDatasets(req: Request, res: Response) {
		try {
			console.log(`Server::listDataset(..) - params: ${JSON.stringify(req.params)}`);
			const response = await this.facade.listDatasets();
			return res.status(200).json({result: response});
		} catch (err) {
			return res.status(400).json({error: err});
		}
	}

	public async deleteDataset(req: Request, res: Response) {
		try {
			console.log(`Server::deleteDataset(..) - params: ${JSON.stringify(req.params)}`);
			const id = req.params.id;
			const response = await this.facade.removeDataset(id);
			return res.status(200).json({result: response});
		} catch (err) {
			const is404 = err instanceof NotFoundError;
			return is404 ? res.status(404).json({error: err}) : res.status(400).json({error: err});

		}
	}

	public async performQuery(req: Request, res: Response) {
		try {
			console.log(`Server::performQuery(..) - params: ${JSON.stringify(req.body)}`,req.body);
			const response = await this.facade.performQuery(req.body);
			res.status(200).json({result: response});
		} catch (err) {

			console.log("Server::performQuery(..) -Error",err);
			res.status(400).json({error: err});
		}
	}
}
