import {Bar} from "react-chartjs-2";
import {useEffect, useState, memo, useReducer} from "react";
import {Chart, registerables} from "chart.js";
import {useColorModeValue} from "@chakra-ui/react";

Chart.register(...registerables);

function TopCourse({datasetId, department}: {datasetId: string; department: string}) {
	const [courses, setCourses] = useState<Array<string>>([]);
	const [averages, setAverages] = useState<Array<number>>([]);
	const color = useColorModeValue("black", "white");
	// https://stackoverflow.com/questions/46240647/how-to-force-a-functional-react-component-to-render/53837442#53837442
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	// https://iq.js.org/questions/react/how-to-re-render-the-view-when-the-browser-is-resized
	useEffect(() => {
		// Attach the event listener to the window object
		window.addEventListener("resize", forceUpdate);

		// Remove the event listener when the component unmounts
		return () => {
			window.removeEventListener("resize", forceUpdate);
		};
	}, []);

	useEffect(() => {
		const query = {
			WHERE: {
				IS: {
					[`${datasetId}_dept`]: department,
				},
			},
			OPTIONS: {
				COLUMNS: [`${datasetId}_id`, "overallAvg"],
				ORDER: {
					dir: "DOWN",
					keys: ["overallAvg", `${datasetId}_id`],
				},
			},
			TRANSFORMATIONS: {
				GROUP: [`${datasetId}_id`],
				APPLY: [
					{
						overallAvg: {
							AVG: `${datasetId}_avg`,
						},
					},
				],
			},
		};

		fetch("http://localhost:4321/query", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(query),
		})
			.then((res) => res.json())
			.then((data) => {
				setCourses(data.result.map((row: {[key: string]: string}) => row[`${datasetId}_id`]));
				setAverages(data.result.map((row: {[key: string]: number}) => row["overallAvg"]));
			});
	}, [datasetId, department, setCourses, setAverages]);

	const options = {
		indexAxis: "y" as const,
		barThickness: 30,
		aspectRatio: courses.length ? (10 / courses.length > 1.5 ? 1.5 : 10 / courses.length) : 1.5,
		scales: {
			x: {
				min: 0,
				max: 100,
				ticks: {
					color: color,
				},
			},
			y: {
				ticks: {
					color: color,
					font: {
						size: 20,
					},
				},
			},
		},
	};

	const data = {
		labels: courses,
		datasets: [
			{
				label: "Overall Average",
				data: averages,
				backgroundColor: "rgba(75,192,192,1)",
			},
		],
	};

	return <Bar options={options} data={data} key={Date.now()} onResize={forceUpdate} />;
}

const Memoized = memo(TopCourse);
export default Memoized;
