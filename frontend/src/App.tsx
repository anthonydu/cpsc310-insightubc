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
	Text,
	Flex,
	Switch,
	Box,
	useColorMode,
	useColorModeValue,
} from "@chakra-ui/react";

function App() {
	const [datasets, setDatasets] = useState(Array<InsightDataset>());
	const [id, setId] = useState("");
	const [kind, setKind] = useState("sections");
	const [file, setFile] = useState<File>();
	const [updateListener, setUpdateListener] = useState(false);
	const [selectedDataset, setSelectedDataset] = useState<string>();

	const {colorMode, toggleColorMode} = useColorMode();
	const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");

	useEffect(() => {
		fetch("http://localhost:4321/datasets")
			.then((res) => res.json())
			.then((data) => setDatasets(data.result));
	}, [setDatasets, updateListener]);

	useEffect(() => {
		console.log(datasets);
	}, [datasets]);

	useEffect(() => {
		console.log(selectedDataset);
	}, [selectedDataset]);

	const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		fetch(`http://localhost:4321/dataset/${id}/${kind}`, {
			method: "PUT",
			body: file,
		}).then(() => {
			setUpdateListener(!updateListener);
		});

		setId("");

		window.scrollTo(0, 0);
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
			<Grid
				templateRows="repeat(3, auto)"
				templateColumns={{base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)"}}
				gap="10px"
			>
				<GridItem
					colSpan={{base: 1, lg: 2}}
					border="1px"
					padding="15px"
					borderColor={borderColor}
					borderRadius="15px"
				>
					<Flex alignItems="center" gap="10px">
						<Heading>InsightUBC&nbsp;&ndash; Section&nbsp;Insights</Heading>
						<Box flex="1" />
						<Text>Dark Mode</Text>
						<Switch isChecked={colorMode === "dark"} onChange={toggleColorMode} />
					</Flex>
				</GridItem>
				<GridItem border="1px" padding="15px" borderColor={borderColor} borderRadius="15px">
					<Heading size="lg">List Dataset</Heading>
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
							{datasets.map((dataset) => (
								<Tr key={dataset.id}>
									<Td>
										<input
											type="radio"
											style={{width: "20px", height: "20px", cursor: "pointer"}}
											name="datasetSelection"
											onChange={() => setSelectedDataset(dataset.id)}
										/>
									</Td>
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

				<GridItem rowSpan={2} border="1px" padding="15px" borderColor={borderColor} borderRadius="15px">
					<Heading size="lg">Insights</Heading>
					<Flex height="100%" minHeight="500px" justifyContent="center" alignItems="center">
						{selectedDataset ? (
							<Text>Selected Dataset: {selectedDataset}</Text>
						) : (
							<Text>Select a dataset to get started</Text>
							// Top Professors for a course by average
							// Top courses for each department by average
							// Grade distribution for a course
						)}
					</Flex>
				</GridItem>

				<GridItem border="1px" padding="15px" borderColor={borderColor} borderRadius="15px">
					<form onSubmit={handleAdd}>
						<Stack spacing="10px">
							<Heading size="lg">Add Dataset</Heading>
							<FormControl>
								<FormLabel>ID</FormLabel>
								<Input
									type="text"
									value={id}
									onChange={(e) => setId(e.currentTarget.value)}
									placeholder="ID must not contain '_' and has to be unique"
									onFocus={(e) => (e.target.placeholder = "")}
									onBlur={(e) =>
										(e.target.placeholder = 'ID must not contain "_" and has to be unique')
									}
								/>
							</FormControl>
							<FormControl>
								<FormLabel>Kind</FormLabel>
								<Select value={kind} onChange={(e) => setKind(e.currentTarget.value)}>
									<option value="sections">Sections</option>
									<option value="rooms">Rooms</option>
								</Select>
							</FormControl>
							<FormControl>
								<FormLabel>File</FormLabel>
								<Input
									type="file"
									accept=".zip"
									onChange={(e) => setFile(e.currentTarget.files?.[0])}
								/>
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
