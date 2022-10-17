const width = window.innerWidth;
const height = window.innerHeight;
const SELECTED_MAP = localStorage.getItem("map")
	? JSON.parse(localStorage.getItem("map"))
	: {};

const COLOR_MAP = {
	5: "#FF7E7E",
	4: "#FFB57E",
	3: "#FFE57E",
	2: "#A8FFBE",
	1: "#88AEFF",
	0: "#FFFFFF",
};

let currentCity;

let svg = d3
	.select("#svg")
	.append("svg")
	.attr("viewBox", "0 0 " + width + " " + height)
	.attr("preserveAspectRatio", "xMidYMid");

let tooltip = d3
	.select("#selection")
	.style("position", "absolute")
	.style("display", "none")
	.on("click", function (e) {
		if (currentCity) {
			const level = e.target.getAttribute("data-level");
			d3.select(currentCity).style("fill", COLOR_MAP[level]);
			d3.select(currentCity).select(function (d) {
				SELECTED_MAP[d.properties.COUNTYNAME] = level;
				localStorage.setItem("map", JSON.stringify(SELECTED_MAP));
				console.log(calcScore());
			});
		}
		d3.select(this).style("display", "none");
	});

d3.json("./COUNTY_MOI_1090820.json").then((data) => {
	const counties = topojson.feature(data, data.objects.COUNTY_MOI_1090820);
	const projection = d3
		.geoMercator()
		.center([123, 24])
		.scale(14000)
		.translate([1350, 360]);
	// const projection2 = d3.geoMercator().center([123, 24]).scale(10000);
	const path = d3.geoPath().projection;

	const geoPath = svg
		.selectAll(".geo-path")
		.data(counties.features)
		.join("path")
		.attr("class", "geo-path")
		.attr("d", path(projection))
		.style("fill", "#fff")
		.style("stroke", "#000")
		.on("mouseover", function (e) {})
		.on("mouseleave", function (e) {
			// d3.select(this).style("fill", "#fff");
			// tooltip.style("display", "none");
		})
		.on("click", function (e) {
			d3.select(this).select(function (d) {
				const { x, y } = e.target.getBoundingClientRect();
				currentCity = e.target;
				tooltip.style("display", "block");
				tooltip.style("left", x + 20).style("top", y + 35);
				tooltip.select(".city-name").html(d.properties.COUNTYNAME);
			});
		});

	geoPath._groups[0].forEach((g, i) => {
		const level = SELECTED_MAP[g.__data__.properties.COUNTYNAME];
		let color;
		if (!level && isNaN(level)) {
			color = "#fff";
		} else {
			color = COLOR_MAP[level];
		}

		d3.select(g).style("fill", color);
	});

	const texts = svg
		.selectAll("text")
		.data(counties.features)
		.enter()
		.append("text")
		.attr("x", (d, i) => {
			return path(projection).centroid(d)[0];
		})
		.attr("y", (d, i) => {
			return path(projection).centroid(d)[1];
		})
		.attr("text-anchor", "middle")
		.attr("font-size", "8px")
		.text((d, i) => {
			return d.properties.COUNTYNAME;
		});
});

function calcScore() {
	let result = 0;
	for (let entry of Object.entries(SELECTED_MAP)) {
		result += +entry[1];
	}
	return result;
}
