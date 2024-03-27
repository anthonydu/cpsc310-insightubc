import {useEffect, useState} from "react";
import "./App.css";
import {InsightDataset} from "../../src/controller/IInsightFacade";
import {
	Heading,
	FormControl,
	Input,
	Button,
	FormLabel,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Select,
	Container,
	Stack,
	Grid,
	GridItem,
} from "@chakra-ui/react";

function App() {
	const [datasets, setDatasets] = useState(Array<InsightDataset>());
	const [id, setId] = useState<string>();
	const [kind, setKind] = useState("sections");
	const [file, setFile] = useState<File>();
	const [updateListener, setUpdateListener] = useState(false);

	useEffect(() => {
		fetch("http://localhost:4321/datasets")
			.then((res) => res.json())
			.then((data) => setDatasets(data.result));
	}, [setDatasets, updateListener]);

	useEffect(() => {
		console.log(datasets);
	}, [datasets]);

	const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		fetch(`http://localhost:4321/dataset/${id}/${kind}`, {
			method: "PUT",
			body: file,
		}).then(() => {
			setUpdateListener(!updateListener);
		});
	};

	const handleRemove = (id: string) => {
		fetch(`http://localhost:4321/dataset/${id}`, {
			method: "DELETE",
		}).then(() => {
			setUpdateListener(!updateListener);
		});
	};

	return (
		<Container maxW="container.lg" padding="20px">
			<Grid templateRows="repeat(3, auto)" templateColumns="repeat(2, 1fr)" gap="10px">
				<GridItem colSpan={2} border="1px" padding="10px" borderColor="gray.200" borderRadius="10px">
					<Heading>Section Insights</Heading>
				</GridItem>
				<GridItem border="1px" padding="10px" borderColor="gray.200" borderRadius="10px">
					<Heading size="lg">List Dataset</Heading>
					<Table>
						<Thead>
							<Tr>
								<Th>ID</Th>
								<Th>Kind</Th>
								<Th>Rows</Th>
								<Th>Actions</Th>
							</Tr>
						</Thead>
						<Tbody>
							{datasets.map((dataset) => (
								<Tr key={dataset.id}>
									<Td>{dataset.id}</Td>
									<Td>{dataset.kind}</Td>
									<Td>{dataset.numRows}</Td>
									<Td>
										<Button onClick={() => handleRemove(dataset.id)}>Remove</Button>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</GridItem>

				<GridItem rowSpan={2} border="1px" padding="10px" borderColor="gray.200" borderRadius="10px">
					<Heading size="lg">Query Result</Heading>
				</GridItem>

				<GridItem border="1px" padding="10px" borderColor="gray.200" borderRadius="10px">
					<form onSubmit={handleAdd}>
						<Stack spacing="10px">
							<Heading size="lg">Add Dataset</Heading>
							<FormControl>
								<FormLabel>Dataset ID</FormLabel>
								<Input type="text" onChange={(e) => setId(e.currentTarget.value)} />
							</FormControl>
							<FormControl>
								<FormLabel>Kind</FormLabel>
								<Select value={kind} onChange={(e) => setKind(e.currentTarget.value)}>
									<option selected value="sections">
										Sections
									</option>
									<option value="rooms">Rooms</option>
								</Select>
							</FormControl>
							<FormControl>
								<FormLabel>Dataset File</FormLabel>
								<Input type="file" onChange={(e) => setFile(e.currentTarget.files?.[0])} />
							</FormControl>
							<Button type="submit">Submit</Button>
						</Stack>
					</form>
				</GridItem>
			</Grid>
		</Container>
	);
}

export default App;
