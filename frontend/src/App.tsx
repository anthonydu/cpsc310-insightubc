import {useEffect, useState} from "react";
import "./App.css";
import {InsightDataset} from "../../src/controller/IInsightFacade";
import {
	Heading,
	Container,
	Grid,
	GridItem,
	Text,
	Flex,
	Switch,
	Box,
	useColorMode,
	useColorModeValue,
} from "@chakra-ui/react";
import Insight from "./components/Insight";
import AddDatasetForm from "./components/AddDatasetForm";
import ListDatasetTable from "./components/ListDatasetTable";

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
		fetch(`${import.meta.env.VITE_SERVER_HOST}/datasets`)
			.then(async (res) => {
				if (!res.ok) throw new Error((await res.json()).error);
				return res.json();
			})
			.then((data) => setDatasets(data.result))
			.catch((err) => alert(err));
	}, [setDatasets, updateListener]);

	const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		fetch(`${import.meta.env.VITE_SERVER_HOST}/dataset/${id}/${kind}`, {
			method: "PUT",
			body: file,
		})
			.then(async (res) => {
				if (!res.ok) throw new Error((await res.json()).error);
				return res.json();
			})
			.then((data) => {
				if (data.error) alert(data.error);
				else alert("Dataset added successfully!");
			})
			.then(() => {
				setUpdateListener(!updateListener);
			});

		setId("");
	};

	const handleRemove = (id: string) => {
		fetch(`${import.meta.env.VITE_SERVER_HOST}/dataset/${id}`, {
			method: "DELETE",
		})
			.then(async (res) => {
				if (!res.ok) throw new Error((await res.json()).error);
				return res.json();
			})
			.then((data) => {
				if (data.error) alert(data.error);
				else alert("Dataset removed successfully!");
			})
			.then(() => {
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
				{/* Title Section */}
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

				{/* List Dataset Section */}
				<GridItem border="1px" padding="15px" borderColor={borderColor} borderRadius="15px">
					<Heading size="lg">List Dataset</Heading>
					<ListDatasetTable
						datasets={datasets}
						setSelectedDataset={setSelectedDataset}
						handleRemove={handleRemove}
					/>
				</GridItem>

				{/* Insights Section */}
				<GridItem rowSpan={2} border="1px" padding="15px" borderColor={borderColor} borderRadius="15px">
					<Heading size="lg">Insights</Heading>
					{selectedDataset ? (
						<Insight datasetId={selectedDataset} />
					) : (
						<Flex height="100%" minHeight="500px" justifyContent="center" alignItems="center">
							<Text>Select a dataset to get started</Text>
						</Flex>
					)}
				</GridItem>

				{/* Add Dataset Section */}
				<GridItem border="1px" padding="15px" borderColor={borderColor} borderRadius="15px">
					<AddDatasetForm
						id={id}
						setId={setId}
						kind={kind}
						setKind={setKind}
						setFile={setFile}
						handleAdd={handleAdd}
					/>
				</GridItem>
			</Grid>
		</Container>
	);
}

export default App;
