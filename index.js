var w=window.innerWidth;
var h=400;

// data here is an array of arrays
// var mockData = 

var svg = d3.selectAll('.svg')
  .append('svg')
  .attr('width', w)
  .attr('height', h)
  .attr('class', 'svg');

var cat = [], startTime=[], endTime=[], taskType=[], uniqCat = [], countCat = {};
 
for(var i=0; i<mockData.length;i++) {
  cat.push(mockData[i][1])
  startTime.push(mockData[i][6])
  endTime.push(mockData[i][7])
  taskType.push(mockData[i][8])
}

uniqcat = _.uniq(cat);
countCat = _.countBy(cat);
labelCount = _.values(countCat);

var numOfOccu=[];
var k=0;
  
for(var i=0;i<uniqcat.length;i++){
  var j=0, temp=[];
  temp[j]=uniqcat[i];
  temp[j+1] = labelCount[i];
  numOfOccu[k] = temp;
  k=k+1;
}

var duration=[];
var c=0;

for(var i=0;i<startTime.length;i++){
  var j=0, temp=[];
  temp[j]=startTime[i];
  temp[j+1] = endTime[i];
  temp[j+2] = cat[i];
  temp[j+3] = taskType[i];
  duration[c] = temp;
  c=c+1;
}

var sortedArray=[];
var dateFormat = d3.time.format('%m/%d/%Y');
var timeScale = d3.time.scale()
                .domain([d3.min(startTime, function(data) { return dateFormat.parse(data); }),
                        d3.max(endTime, function(data) { return dateFormat.parse(data); })])
                .range([0, w-150]);

makeGantt(duration, w, h);

function makeGantt(duration, pageWidth, pageHeight){
var barHeight = 6;
var gap=barHeight;
var topPadding = 2;
var sidePadding = 75;
var colorScale = d3.scale.linear()
                 .domain([0, cat.length])
                 .range(['#00B9FA', '#F95002'])
                 .interpolate(d3.interpolateHcl);
makeGrid(sidePadding, topPadding, pageWidth, pageHeight);
drawRects(duration, gap, topPadding, sidePadding, barHeight, colorScale, pageWidth, pageHeight);
vertLabels(gap, topPadding, sidePadding, barHeight, colorScale, numOfOccu);
}

function drawRects(theArray, theGap, theTopPad, theSidePad, theBarHeight, theColorScale, w, h){
  var bigRects = svg.append('g')
                    .selectAll('rect')
                    .data(theArray)
                    .enter()
                    .append('rect')
                    .attr('x', 10)
                    .attr('y', function(d, i){
                      return i*theGap + theTopPad -2;
                    })
                    .attr('width', function(d){
                      return w-theSidePad/2;
                    })
                    .attr('height', theGap)
                    .attr('stroke', 'none')
                    .attr('fill', function(d){
                      for (var i = 0; i < cat.length; i++){
                          if (d[2] == cat[i]){
                            return d3.rgb(theColorScale(i));
                          }
                      }
                    })
                    .attr('opacity', 0.2);

  var rectangles = svg.append('g')
                    .selectAll('rect')
                    .data(theArray)
                    .enter();

  var innerRects = rectangles.append('rect')
                    .attr('rx', 3)
                    .attr('ry', 3)
                    .attr('x', function(d){
                      return timeScale(dateFormat.parse(d[0])) + theSidePad;
                    })
                    .attr('y', function(d, i){
                        return i*theGap + theTopPad;
                    })
                    .attr('width', function(d){
                      return (timeScale(dateFormat.parse(d[1]))-timeScale(dateFormat.parse(d[0])));
                    })
                    .attr('height', theBarHeight)
                    .attr('stroke', 'none')
                    .attr('fill', function(d){
                      for (var i = 0; i < cat.length; i++){
                          if (d[2] == cat[i]){
                            return d3.rgb(theColorScale(i));
                          }
                      }
                    })
  innerRects.on('mouseover', function(e) {
    var tag = "";
        tag = "Task: " + d3.select(this).data()[0][3] + "<br/>" + 
                "Type: " + d3.select(this).data()[0][2] + "<br/>" + 
                "Starts: " + d3.select(this).data()[0][0] + "<br/>" + 
                "Ends: " + d3.select(this).data()[0][1] + "<br/>"; 

    var output = document.getElementById("tag");
    var x = (this.x.animVal.value + this.width.animVal.value/2) + "px";
    var y = this.y.animVal.value + 25 + "px";
    output.innerHTML = tag;
    output.style.top = y;
    output.style.left = x;
    output.style.display = "block";
  }).on('mouseout', function() {
    var output = document.getElementById('tag');
    output.style.display = 'none';
  })
}

function makeGrid(theSidePad, theTopPad, w, h){

  var xAxis = d3.svg.axis()
      .orient('bottom')
      .scale(timeScale)
      .ticks(d3.time.days, 1)
      .tickSize(-h+theTopPad+20, 0, 0)
      .tickFormat(d3.time.format('%d %b'));
  
  var grid = svg.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' +theSidePad + ', ' + (h - 50) + ')')
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('fill', '#000')
      .attr('stroke', 'none')
      .attr('font-size', 10)
      .attr('dy', '1em');
  }
 
function vertLabels(theGap, theTopPad, theSidePad, theBarHeight, theColorScale, numOfOccu){
    var prevGap = 0;
    var axisText = svg.append('g') 
                      .selectAll('text')
                      .data(numOfOccu)
                      .enter()
                      .append('text')
                      .text(function(d){
                        return d[0];
                      })
                      .attr('x', 0)
                      .attr('y', function(d, i){
                        if (i > 0){
                            for (var j = 0; j < i; j++){
                              prevGap += numOfOccu[i-1][1];
                            console.log('gapppp',prevGap);
                              return d[1]*theGap/2 + prevGap*theGap + theTopPad;
                            }
                        } else{
                        return d[1]*theGap/2 + theTopPad;
                        }
                      })
                      .attr('font-size', 11)
                      .attr('text-anchor', 'start')
                      .attr('text-height', 14)
                      .attr('fill', function(d){
                        for(var i=0;i<cat.length;i++){
                          if(d[0] == cat[i]){
                            return d3.rgb(theColorScale(i)).darker();
                          }
                        }
                      });
}
  