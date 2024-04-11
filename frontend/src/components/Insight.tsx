import {Stack, Select} from "@chakra-ui/react";
import {useState, useEffect} from "react";
import AvgOverYears from "./AvgOverYears";
import TopCourse from "./TopCourse";
import TopProf from "./TopProf";

function Insight({datasetId}: {datasetId: string}) {
	const [selectedInsight, setSelectedInsight] = useState("top-course");
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [selectedCourse, setSelectedCourse] = useState("");

	return (
		<Stack spacing="10px" marginTop="10px">
			<Select value={selectedInsight} onChange={(e) => setSelectedInsight(e.currentTarget.value)}>
				<option value="top-course">Top courses for a department by average</option>
				<option value="top-prof">Top Professors for a course by average</option>
				<option value="grade-dist">Average of a course over the years</option>
			</Select>
			{selectedInsight === "top-course" ? (
				<>
					<DepartmentSelector
						datasetId={datasetId}
						selectedDepartment={selectedDepartment}
						setSelectedDepartment={setSelectedDepartment}
					/>
					<TopCourse datasetId={datasetId} department={selectedDepartment} />
				</>
			) : selectedInsight === "top-prof" ? (
				<>
					<DepartmentSelector
						datasetId={datasetId}
						selectedDepartment={selectedDepartment}
						setSelectedDepartment={setSelectedDepartment}
					/>
					<CourseSelector
						datasetId={datasetId}
						department={selectedDepartment}
						selectedCourse={selectedCourse}
						setSelectedCourse={setSelectedCourse}
					/>
					<TopProf datasetId={datasetId} department={selectedDepartment} course={selectedCourse} />
				</>
			) : selectedInsight === "grade-dist" ? (
				<>
					<DepartmentSelector
						datasetId={datasetId}
						selectedDepartment={selectedDepartment}
						setSelectedDepartment={setSelectedDepartment}
					/>
					<CourseSelector
						datasetId={datasetId}
						department={selectedDepartment}
						selectedCourse={selectedCourse}
						setSelectedCourse={setSelectedCourse}
					/>
					<AvgOverYears datasetId={datasetId} department={selectedDepartment} course={selectedCourse} />
				</>
			) : null}
		</Stack>
	);
}

export default Insight;

function DepartmentSelector({
	datasetId,
	selectedDepartment,
	setSelectedDepartment,
}: {
	datasetId: string;
	selectedDepartment: string;
	setSelectedDepartment: (department: string) => void;
}) {
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

		fetch(`${import.meta.env.VITE_SERVER_HOST}/query`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(departmentsQuery),
		})
			.then(async (res) => {
				if (!res.ok) throw new Error((await res.json()).error);
				return res.json();
			})
			.then((data) => {
				setDepartments(data.result.map((row: {[key: string]: string}) => row[`${datasetId}_dept`]));
			});
	}, [datasetId, setDepartments]);

	return (
		<Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
			<option value="">Select a department</option>
			{departments.map((department) => (
				<option key={department} value={department}>
					{department.toUpperCase()}
				</option>
			))}
		</Select>
	);
}

function CourseSelector({
	datasetId,
	department,
	selectedCourse,
	setSelectedCourse,
}: {
	datasetId: string;
	department: string;
	selectedCourse: string;
	setSelectedCourse: (course: string) => void;
}) {
	const [courses, setCourses] = useState<string[]>([]);

	useEffect(() => {
		const coursesQuery = {
			WHERE: {
				IS: {
					[`${datasetId}_dept`]: department,
				},
			},
			OPTIONS: {
				COLUMNS: [`${datasetId}_id`],
			},
			TRANSFORMATIONS: {
				GROUP: [`${datasetId}_id`],
				APPLY: [],
			},
		};

		console.log(JSON.stringify(coursesQuery));

		fetch(`${import.meta.env.VITE_SERVER_HOST}/query`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(coursesQuery),
		})
			.then(async (res) => {
				if (!res.ok) throw new Error((await res.json()).error);
				return res.json();
			})
			.then((data) => {
				setCourses(data.result.map((row: {[key: string]: string}) => row[`${datasetId}_id`]));
			});
	}, [datasetId, department, setCourses]);

	return (
		<Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
			<option value="">Select a course</option>
			{department === "" ? <option value="">Select a department first!</option> : null}
			{courses.map((course) => (
				<option key={course} value={course}>
					{course}
				</option>
			))}
		</Select>
	);
}
