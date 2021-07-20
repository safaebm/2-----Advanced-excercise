import * as d3 from "d3";
import { geoGnomonic } from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { stats, statshoy, ResultEntry } from "./stats";

const aProjection = d3Composite
  .geoConicConformalSpain() // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);
  //
// c bon 
const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);
//
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");
// c bon 

//c bon 
svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any);
  const getAffectedCases = (comunidad: string, data: any[]) => {
    const entry = data.find((item) => item.name === comunidad);  
    return entry ? entry.value : 0;
  };
  const calculateBasedOnAffectedCases = (comunidad: string, data: any[]) => {
    const entry = data.find((item) => item.name === comunidad);
    var max = data.reduce((max, item) => (item.value > max ? item.value : max), 0);
    return entry ? (entry.value / max) * 50 : 0;
  };
  const calculateRadiusBasedOnAffectedCases = (
    comunidad: string,
    data: any[]
  ) => {
    return calculateBasedOnAffectedCases(comunidad, data);
  };
  const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  const update = (data: ResultEntry[]) => {
    svg.selectAll("path").remove();
    svg.selectAll("circle").remove();
  const calculateMaxAffected = (data) => {
    return data.reduce(
      (max, item) => (item.value > max ? item.value : max),
      0
    );
  };
  const maxAffected = calculateMaxAffected(data);

  const colorCommunity = d3
    .scaleThreshold<number, string>()
    .domain([0,
       maxAffected * 0.1,
        maxAffected * 0.25,
         maxAffected * 0.5,
          maxAffected * 0.75,
           maxAffected])
    .range([
      "#F0EFEF",
      "#DBD8D8",
      "#C6C2C1",
      "#b8b3b2",
      "#828B9E",
      "##938F8E",
      "#494747",
    ]);
    const colorCircle = d3
    .scaleThreshold<number, string>()
    .domain([0, 50, 100, 1200, 5000, 50000])
    .range([
      "#F6FAFC",
      "#DBEDF6",      
      "#C0E0EF",
      "#a6d3e9",
      "#95BDD1",
      "#40b0e7"
    ]);
    const assignColor = (comunidad: string, dataset: ResultEntry[], circle: boolean) => {
      const entry = dataset.find((item) => item.name === comunidad);
      if (circle){
        return entry ? colorCircle(entry.value) : colorCircle(0);
      }
      return entry ? colorCommunity(entry.value) : colorCommunity(0);
    };
  
    svg
      .selectAll("path")
      .data(geojson["features"])
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", geoPath as any)
      .style("fill", function (d: any) {
        return assignColor(d.properties.NAME_1, data, false)
      })
  
    svg
      .selectAll("circle")
      .data(latLongCommunities)
      .enter()
      .append("circle")
      //.transition()
      //.duration(500)
      .attr("class", "affected-marker")
      .attr("fill", (d, i) => {
        return assignColor(d.name, data, true);
      })
      .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name, data))
      .attr("cx", (d) => aProjection([d.long, d.lat])[0])
      .attr("cy", (d) => aProjection([d.long, d.lat])[1])    
      .on("mouseover", function (e: any, datum:any) {            
          const coords = { x: e.x, y: e.y };
          div.transition().duration(200).style("opacity", 0.7);
          div
            .html(`<span>${datum.name}: ${getAffectedCases(datum.name, data)}</span>`)
            .style("left", `${coords.x}px`)
            .style("top", `${coords.y - 28}px`);
        })
        .on("mouseout", function (datum) {    
          div.transition().duration(500).style("opacity", 0);
        });


  };
    
  document
  .getElementById("Results2020")
  .addEventListener("click", function handleResults() {
    update(stats);
  });

document
  .getElementById("Results2021")
  .addEventListener("click", function handleResults() {
    update(statshoy);
  });