import {Stack, Select} from "@chakra-ui/react";
import {useState, useEffect} from "react";
import GradeDist from "./GradeDist";
import TopCourse from "./TopCourse";
import TopProf from "./TopProf";

function Insight({datasetId}: {datasetId: string}) {
	const [selectedInsight, setSelectedInsight] = useState("top-course");
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [departments, setDepartments] = useState<string[]>([]);

	useEffect(() => {
		const departmentsQuery = {
			WHERE: {},
			OPTIONS: {
				COLUMNS: [`${datasetId}_dept`],
			},
			TRANSFORMATIONS: {
				GROUP: [`${datasetId}_dept`],
				APPLY: [],
			},
		};

		console.log(JSON.stringify(departmentsQuery));

		fetch("http://localhost:4321/query", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(departmentsQuery),
		})
			.then((res) => res.json())
			.then((data) => {
				setDepartments(data.result.map((row: {[key: string]: string}) => row[`${datasetId}_dept`]));
			});
	}, [datasetId, setDepartments]);

	return (
		<Stack spacing="10px" marginTop="10px">
			<Select value={selectedInsight} onChange={(e) => setSelectedInsight(e.currentTarget.value)}>
				<option value="top-course">Top courses for a department by average</option>
				<option value="top-prof">Top Professors for a course by average</option>
				<option value="grade-dist">Grade distribution for a course</option>
			</Select>
			{selectedInsight === "top-course" ? (
				<>
					<Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
						<option value=""></option>
						{departments.map((department) => (
							<option key={department} value={department}>
								{department.toUpperCase()}
							</option>
						))}
					</Select>
					<TopCourse datasetId={datasetId} department={selectedDepartment} />
				</>
			) : selectedInsight === "top-prof" ? (
				<>
					<Select value="placeholder" onChange={() => {}}>
						<option value="placeholder">course selector goes here</option>
					</Select>
					<TopProf />
				</>
			) : selectedInsight === "grade-dist" ? (
				<>
					<Select value="placeholder" onChange={() => {}}>
						<option value="placeholder">course selector goes here</option>
					</Select>
					<GradeDist />
				</>
			) : null}
		</Stack>
	);
}

export default Insight;
