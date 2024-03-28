import {Button, Table, Thead, Tbody, Tr, Th, Td} from "@chakra-ui/react";
import {InsightDataset} from "../../../src/controller/IInsightFacade";

function ListDatasetTable(props: {
	datasets: InsightDataset[];
	setSelectedDataset: (id: string) => void;
	handleRemove: (id: string) => void;
}) {
	return (
		<Table>
			<Thead>
				<Tr>
					<Th></Th>
					<Th>ID</Th>
					<Th>Kind</Th>
					<Th>Rows</Th>
					<Th>Actions</Th>
				</Tr>
			</Thead>
			<Tbody>
				{props.datasets.map((dataset) => (
					<Tr key={dataset.id}>
						<Td>
							<input
								type="radio"
								style={{
									width: "20px",
									height: "20px",
									cursor: "pointer",
								}}
								name="datasetSelection"
								onChange={() => props.setSelectedDataset(dataset.id)}
							/>
						</Td>
						<Td
							width="100%"
							maxWidth={{
								base: "100%",
								lg: "100px",
							}}
						>
							{dataset.id}
						</Td>
						<Td>{dataset.kind}</Td>
						<Td>{dataset.numRows}</Td>
						<Td>
							<Button onClick={() => props.handleRemove(dataset.id)}>Remove</Button>
						</Td>
					</Tr>
				))}
			</Tbody>
		</Table>
	);
}

export default ListDatasetTable;
