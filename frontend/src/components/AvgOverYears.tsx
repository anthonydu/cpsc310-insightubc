import {Line} from "react-chartjs-2";
import {useEffect, useState, memo, useReducer} from "react";
import {Chart, registerables} from "chart.js";
import {useColorModeValue} from "@chakra-ui/react";

Chart.register(...registerables);

function AvgOverYears({datasetId, department, course}: {datasetId: string; department: string; course: string}) {
	const [years, setYears] = useState<Array<string>>([]);
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
				AND: [
					{
						IS: {
							[`${datasetId}_dept`]: department,
						},
					},
					{
						IS: {
							[`${datasetId}_id`]: course,
						},
					},
				],
			},
			OPTIONS: {
				COLUMNS: [`${datasetId}_year`, "overallAvg"],
				ORDER: {
					dir: "DOWN",
					keys: [`${datasetId}_year`],
				},
			},
			TRANSFORMATIONS: {
				GROUP: [`${datasetId}_year`],
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
				setYears(data.result.map((row: {[key: string]: string}) => row[`${datasetId}_year`]));
				setYears((allYears) => allYears.slice(0, 10).reverse());
				setAverages(data.result.map((row: {[key: string]: number}) => row["overallAvg"]));
			});
	}, [datasetId, department, setYears, setAverages, course]);

	const options = {
		indexAxis: "x" as const,
		barThickness: 30,
		aspectRatio: 1,
		scales: {
			x: {
				ticks: {
					color: color,
					font: {
						size: 20,
					},
				},
			},
			y: {
				suggestedMin: 60,
				suggestedMax: 90,
				ticks: {
					color: color,
				},
			},
		},
	};

	const data = {
		labels: years,
		datasets: [
			{
				label: "Overall Average",
				data: averages,
				borderColor: "rgba(75,192,192,1)",
			},
		],
	};

	return <Line options={options} data={data} key={Date.now()} onResize={forceUpdate} />;
}

const Memoized = memo(AvgOverYears);
export default Memoized;
