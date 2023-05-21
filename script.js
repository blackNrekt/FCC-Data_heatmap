let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";


let values = [];
let baseTemp;

const colorArr = [
	"#313695",
	"#4575B4",
	"#74ADD1",
	"#ABD9E9",
	"#E0F3F8",
	"#FFFFBF",
	"#FEE090",
	"#FDAE61",
	"#F46D43",
	"#D73027",
	"#A50026"
];

let xScale;
let yScale;

let colorScale;
let xScaleLeg;

let startYear;
let endYear;

let width = 1400;
let height = 800;
let padding = { top: 20, right: 100, bottom: 150, left: 100 };

let legendRect = 30;

let svg = d3.select("svg");

svg.attr("width",width)
    .attr("height", height)


let generateScales = () => {
        

    startYear = d3.min(values, (d) => {        
        return d.year            
    })
    endYear = d3.max(values, (d) => {        
        return d.year
    })
    xScale = d3.scaleTime()
                .range([padding.left,width - padding.right])
                .domain(d3.extent(values, d => new Date(d.year, 0 ,1)))

    yScale = d3.scaleLinear()
                      .domain([0.5, 12.5])
                      .range([padding.top, height - padding.bottom])

    xScaleLeg = d3.scaleLinear()
                    .domain([2.8,12.8])
                    .range([padding.left + (colorArr.length*30)/11, ((colorArr.length-1) * 30 + padding.left)])                          
}

let drawCells = () => {
    
    let color = (temp, arr) => {
        switch (true) {
            case temp < 2.8:
                return arr[0];
            case temp < 3.9:
                return arr[1];
            case temp < 5.0:
                return arr[2];
            case temp < 6.1:
                return arr[3];
            case temp < 7.2:
                return arr[4];
            case temp < 8.3:
                return arr[5];
            case temp < 9.5:
                return arr[6];
            case temp < 10.6:
                return arr[7];
            case temp < 11.7:
                return arr[8];
            case temp < 12.8:
                return arr[9];
            case temp >= 12.8:
                return arr[10];
            default:
                return "white";
        }
    };

    const startDate = new Date(0, 0, 1);
    const endDate = new Date(0, 11, 31);    

    const cellWidth = (width - padding.left - padding.right) / (endYear - startYear);
    const cellHeight = (height - padding.top - padding.bottom) / 12;     
    
    let tooltip = d3.select('body')
                     .append('div')
                     .attr('id','tooltip')
                     .style('position','absolute')
                     .style('visibility',"hidden")

    svg.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class','cell')
        .attr('fill', (d) => {
            return color(baseTemp+d.variance, colorArr)
        })
        .attr('data-year', (d) => {
            return d.year
        })
        .attr('data-month', (d) => {
            return d.month-1
        })
        .attr('data-temp', (d) => {
            return baseTemp+d.variance
        })
        .attr("y", (d) => yScale(d.month - 0.5))
        .attr('x', (d) => xScale(new Date(d.year, 0, 1)))
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .on('mouseenter', function(event,d) {
            tooltip.transition()
                    .style('visibility','visible')                          
                    .style('padding', '10px')
                    .style('border-radius', '5px')
                    .style('box-shadow', '0 0 5px grey')      
            tooltip.html(d3.timeFormat("%B")(d.month)+" - "+d.year+"<br>"
                         +(baseTemp+d.variance).toFixed(2)+"°C"+"<br>"
                         +(d.variance).toFixed(2)+"°C")              
        })
        .on("mousemove", function(event,d) {
            tooltip.transition()
                   .duration(0)                   
                   .style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY + 10) + "px");
            document.querySelector("#tooltip").setAttribute("data-year",d.year)
        })
        .on("mouseleave", () => {            
            tooltip.style("visibility", "hidden")
        })
}   

let drawLegend = () => {

    let leg = d3.select("#legend")
    
    leg.selectAll('.legRect')
    .data(colorArr)
    .enter()
    .append('rect')
    .attr("class","legRect")    
    .attr("width", legendRect)
    .attr("height", legendRect)
    .attr("x", (d,i) => legendRect*i+padding.left)
    .attr("y", 0 - legendRect)
    .style("fill", (d) => d)

}


let drawAxis = () => {
    let xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat("%Y"))
    let yAxis = d3.axisLeft(yScale)                
                   .tickFormat((d)=>{                    
                    let date = new Date(0, d-1,1)
                    return d3.timeFormat('%B')(date)
                   })
    let legAxis = d3.axisBottom(xScaleLeg)
                   .tickSize(10,0)
                   .tickValues([2.8,3.9,5.1,6.1,7.2,8.3,9.5,10.6,11.7,12.8])
                   .tickFormat(d3.format(".1f"));

    svg.append('g')
        .call(xAxis)
        .attr('id','x-axis')
        .attr("transform", `translate(${0},${height - padding.bottom})`)

    svg.append('g')
        .call(yAxis)
        .attr('id','y-axis')
        .attr("transform", `translate(${padding.left},${0})`)

    svg.append("g")
        .call(legAxis)
        .attr("id", "legend")
        .attr("transform", `translate(${0},${height - padding.bottom/2})`)   

    // Adjust the position of x-axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', height - padding.bottom / 1.6)
        .text('Year');

    // Adjust the position of y-axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', (-height+padding.bottom)/2)
        .attr('y', padding.left / 3)
        .text('Month');
}


fetch(url) 
    .then(response => response.json())
    .then(data => {
        baseTemp = data.baseTemperature
        values = data.monthlyVariance        
        console.log(values)
        generateScales()        
        drawAxis() 
        drawLegend()       
        drawCells()        
    })
    