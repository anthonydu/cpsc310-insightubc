import {Bar} from "react-chartjs-2";
import {useEffect, useState, memo, useReducer} from "react";
import {Chart, registerables} from "chart.js";
import {useColorModeValue} from "@chakra-ui/react";

Chart.register(...registerables);

// https://stackoverflow.com/questions/32589197/how-can-i-capitalize-the-first-letter-of-each-word-in-a-string-using-javascript
function titleCase(str: string) {
	const splitStr = str.toLowerCase().split(" ");
	for (let i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	// Directly return the joined string
	return splitStr.join(" ");
}

function TopProf({datasetId, department, course}: {datasetId: string; department: string; course: string}) {
	const [profs, setProfs] = useState<Array<string>>([]);
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
				COLUMNS: [`${datasetId}_instructor`, "overallAvg"],
				ORDER: {
					dir: "DOWN",
					keys: ["overallAvg", `${datasetId}_instructor`],
				},
			},
			TRANSFORMATIONS: {
				GROUP: [`${datasetId}_instructor`],
				APPLY: [
					{
						overallAvg: {
							AVG: `${datasetId}_avg`,
						},
					},
				],
			},
		};

		fetch(`${import.meta.env.VITE_SERVER_HOST}/query`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(query),
		})
			.then(async (res) => {
				if (!res.ok) throw new Error((await res.json()).error);
				return res.json();
			})
			.then((data) => {
				setProfs(data.result.map((row: {[key: string]: string}) => row[`${datasetId}_instructor`]));
				setAverages(data.result.map((row: {[key: string]: number}) => row["overallAvg"]));
			});
	}, [datasetId, department, setProfs, setAverages, course]);

	const options = {
		indexAxis: "y" as const,
		barThickness: 30,
		aspectRatio: profs.length ? (10 / profs.length > 1.5 ? 1.5 : 10 / profs.length) : 1.5,
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
		labels: profs.map((prof) => {
			if (prof === "") {
				return "Unknown";
			} else {
				return titleCase(prof);
			}
		}),
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

const Memoized = memo(TopProf);
export default Memoized;
