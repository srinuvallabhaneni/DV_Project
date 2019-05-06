/********************* BubbleChart start ***************************/
function Circle(data) {
  let maxRadius = d3.max(data, function (d) {
    return d.count;
  });
  let minRadius = d3.min(data, function (d) {
    return d.count;
  });
  let radiusScale = d3.scaleSqrt().domain([minRadius, maxRadius]).range([5, 40]);

  return data.map((circle, index) => {
    return React.createElement("circle", {
      key: index,
      className: "bubble",
      fill: `hsla(${circle.count},100%,70%,0.15)`,
      "stroke-width": "1px",
      stroke: `hsla(${circle.count},100%,70%,0.8)`,
      r: radiusScale(circle.count),
      cx: circle.x,
      cy: circle.y,
      onMouseMove: e => {
        d3.select(".bubbleChartTooltip").
        style("visibility", "visible").
        text(circle.name + " (" + circle.count + ")").
        attr('x', e.nativeEvent.clientX - 450 + "px").
        attr('y', e.nativeEvent.clientY - 210 + "px");
      },
      onMouseOut: () => {
        d3.select(".bubbleChartTooltip").
        style("visibility", "hidden");
      } });

  });
}

class BubbleChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bubbleChartData: [] };

  }

  simulation(bubbleChartData) {
    let maxRadius = d3.max(bubbleChartData, function (d) {
      return d.count;
    });
    let minRadius = d3.min(bubbleChartData, function (d) {
      return d.count;
    });
    let radiusScale = d3.scaleSqrt().domain([minRadius, maxRadius]).range([5, 40]);
    let self = this;

    self.tick = d3.forceSimulation().
    nodes(bubbleChartData).
    force("xTowardsTheCenter", d3.forceX(0).strength(0.01)).
    force("yTowardsTheCenter", d3.forceY(100).strength(0.01)).
    force("collide", d3.forceCollide(function (d) {
      return radiusScale(d.count);
    })).
    on("tick", ticked);

    // simulation.nodes([nodes]) adds properties to data.
    function ticked() {
      self.setState({
        bubbleChartData: bubbleChartData });

    }
  }
  //
  componentWillReceiveProps(nextProps) {
    this.setState({
      bubbleChartData: nextProps.bubbleChartData },
    function () {
      this.simulation(this.state.bubbleChartData);
    });
  }
  componentWillMount() {
    this.setState({
      bubbleChartData: this.props.bubbleChartData },
    function () {
      this.simulation(this.state.bubbleChartData);
    });
  }

  render() {
    const margins = { top: 20, right: 50, bottom: 20, left: 50 },
    svgDimensions = { width: window.screen.width / 2, height: window.screen.height / 2 };

    const tooltip = React.createElement("text", { fill: "#fff", fontSize: "14", className: "bubbleChartTooltip", style: { 'visibility': 'hidden' } }, "tooltip");
    return (
      React.createElement("svg", { width: svgDimensions.width, height: svgDimensions.height },
      React.createElement("g", { className: "bubbleChartGroup", transform: `translate(${svgDimensions.width / 2},${svgDimensions.height / 2 - 50})` },
      Circle(this.state.bubbleChartData)),

      tooltip));


  }}

/********************* BubbleChart end ***************************/


/********************* RangeSlider start ***************************/
class Axis extends React.Component {
  componentDidMount() {
    this.renderAxis();
  }
  renderAxis() {
    const { svgDimensions, margins } = this.props;
    const xValue = (svgDimensions.width - margins.left - margins.right) / 10;
    d3.select(this.axisElement).
    call(d3.axisBottom().
    scale(this.props.xScale).
    ticks(6).
    tickFormat(d3.format(""))).

    selectAll("text").
    style("font-size", "10px").
    style("fill", "white").
    attr("x", xValue);

    d3.select(this.axisElement).selectAll("line").attr("stroke", "white");
    d3.select(this.axisElement).select("path").style("d", "none");
  }
  render() {
    return (
      React.createElement("g", { className: "rangeSliderAxis", transform: "translate(0,10)", ref: el => this.axisElement = el }));

  }}


const xScale = d3.scaleLinear().
domain([2009, 2014]).
range([50, window.screen.width / 2 - 50]).
clamp(true);
let h1 = xScale(2009),h2 = xScale(2014);
let tempH1 = xScale(2009),tempH2 = xScale(2014);
let trueYear1 = 2009,trueYear2 = 2014;

class Handle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      handle: '' };

  }
  onMouseOver() {
    this.setState({
      handle: this.props.handle });

  }
  render() {
    const { initialValue, xScale, handle } = this.props;
    const circle = React.createElement("circle", { r: "10px", fill: "#fa7070" });

    return React.createElement("g", { className: handle, transform: `translate(${xScale(initialValue)},0)`,
      onMouseOver: this.onMouseOver.bind(this) }, circle);
  }

  componentDidUpdate(prevProps, prevState) {
    let { margins, svgDimensions, xScale, onChangeYear } = prevProps;
    let mouseValue,trueMouseValue,self = this;
    let handle = this.state.handle;
    let minWidth = (window.screen.width / 2 - margins.left - margins.right) / 5;

    const drag = d3.drag().
    on("drag", draged).on("end", dragend);

    d3.select(".rangeSliderGroup").call(drag);

    function draged() {
      mouseValue = d3.mouse(this)[0];
      trueMouseValue = getTrueMouseValue(mouseValue);

      handle === "handle1" ? h1 = mouseValue : h2 = mouseValue;

      if (h2 - h1 > minWidth && mouseValue > margins.left && mouseValue < svgDimensions.width - margins.right) {
        d3.select("." + self.state.handle).attr("transform", "translate(" + mouseValue + ",0)");
        if (handle === "handle1") {
          tempH1 = mouseValue;
          trueYear1 = trueMouseValue;
        } else {
          tempH2 = mouseValue;
          trueYear2 = trueMouseValue;
        }
      } else {
        h1 = tempH1;
        h2 = tempH2;
        handle === "handle1" ? trueMouseValue = trueYear1 : trueMouseValue = trueYear2;
      }
      d3.select(".rangeBarFilled").remove();
      d3.select(".rangeSliderGroup").
      insert("line", ".rangeSliderAxis").
      attr("x1", h1).
      attr("x2", h2).
      attr("y1", 0).
      attr("y2", 0).
      attr("class", "rangeBarFilled");

    }
    function dragend() {
      h1 = xScale(getTrueMouseValue(tempH1));
      h2 = xScale(getTrueMouseValue(tempH2));

      d3.select("." + self.state.handle).attr("transform", "translate(" + xScale(trueMouseValue) + ",0)");
      d3.select(".rangeBarFilled").remove();
      d3.select(".rangeSliderGroup").
      insert("line", ".rangeSliderAxis").
      attr("x1", xScale(trueYear1)).
      attr("x2", xScale(trueYear2)).
      attr("y1", 0).
      attr("y2", 0).
      attr("class", "rangeBarFilled");

      onChangeYear(trueYear1, trueYear2);
    }
    function getTrueMouseValue(mouseValue) {
      return Math.round(xScale.invert(mouseValue));
    }
  }}


const RangeSlider = ({ data, onChangeYear }) => {
  const margins = { top: 20, right: 20, bottom: 20, left: 50 },
  svgDimensions = { width: window.screen.width / 2, height: window.screen.height / 6 };
  const xScale = d3.scaleLinear().
  domain([2009, 2014]).
  range([margins.left, svgDimensions.width - margins.right]).
  clamp(true);

  const RangeBar = React.createElement("line", { x1: margins.left, y1: "0", x2: svgDimensions.width - margins.right, y2: "0", className: "rangeBar" });
  const RangeBarFilled = React.createElement("line", { x1: xScale(data.initialValue1), y1: "0", x2: xScale(data.initialValue2), y2: "0", className: "rangeBarFilled" });

  return React.createElement("svg", { className: "rangeSliderSvg", width: svgDimensions.width, height: svgDimensions.height },
  React.createElement("g", { className: "rangeSliderGroup", transform: `translate(0,${svgDimensions.height - margins.bottom - 40})` },
  RangeBar, RangeBarFilled,
  React.createElement(Axis, { margins: margins, svgDimensions: svgDimensions, xScale: xScale }),
  React.createElement(Handle, { onChangeYear: onChangeYear, handle: "handle1", initialValue: data.initialValue1, data: data, xScale: xScale, margins: margins, svgDimensions: svgDimensions }),
  React.createElement(Handle, { onChangeYear: onChangeYear, handle: "handle2", initialValue: data.initialValue2, data: data, xScale: xScale, margins: margins, svgDimensions: svgDimensions })));


};
/********************* RangeSlider end ***************************/

class Charts extends React.Component {
  constructor() {
    super();
    this.state = {
      rangeSliderData: '',
      bubbleChartData: [] };

  }
  componentWillMount() {
    this.setState({
      rangeSliderData: {
        initialValue1: 2009,
        initialValue2: 2014 },
	
	bubbleChartData: [{
		"name": "Hair Care",
		"count": 14789
	  },
	  {
		"name": "Health Care",
		"count": 15755
	  },
	  {
		"name": "Household Supplies",
		"count": 16238
	  },
	  {
		"name": "Makeup",
		"count": 14260
	  },
	  {
		"name": "Personal Care",
		"count": 9476
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 15525
	  },
	  {
		"name": "Skin Care",
		"count": 14996
	  },
	  {
		"name": "Men Accessories",
		"count": 12052
	  },
	  {
		"name": "Men Clothing",
		"count": 11362
	  },
	  {
		"name": "Men Watches",
		"count": 4669
	  },
	  {
		"name": "Women Clothing",
		"count": 5290
	  },
	  {
		"name": "Women Jwellery",
		"count": 5290
	  },
	  {
		"name": "Women Maternity",
		"count": 345
	  },
	  {
		"name": "Birds",
		"count": 7107
	  },
	  {
		"name": "Dogs",
		"count": 12903
	  },
	  {
		"name": "Gardening",
		"count": 14490
	  },
	  {
		"name": "Lawn Mowers",
		"count": 13317
	  },
	  {
		"name": "Others",
		"count": 7038
	  },
	  {
		"name": "Pest Control",
		"count": 15594
	  },
	  {
		"name": "Alternative Rock",
		"count": 3795
	  },
	  {
		"name": "Electrical",
		"count": 15295
	  },
	  {
		"name": "Hand Tools",
		"count": 12420
	  },
	  {
		"name": "Measuring Tools",
		"count": 9798
	  },
	  {
		"name": "PlayStation",
		"count": 7659
	  },
	  {
		"name": "Pop",
		"count": 6670
	  },
	  {
		"name": "Safety & Security",
		"count": 14122
	  },
	  {
		"name": "Sony PSP",
		"count": 1978
	  },
	  {
		"name": "Xbox 360",
		"count": 3565
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 11799
	  },
	  {
		"name": "Movies",
		"count": 9522
	  },
	  {
		"name": "Metal",
		"count": 5635
	  }] });


  }

  handleChangeYear(year1, year2) {
		if(year1==2009 && year2==2010 || year1==2013 && year2==2014){
		this.setState({
      bubbleChartData: [
	  {
		"name": "Hair Care",
		"count": 621
	  },
	  {
		"name": "Health Care",
		"count": 736
	  },
	  {
		"name": "Household Supplies",
		"count": 161
	  },
	  {
		"name": "Makeup",
		"count": 506
	  },
	  {
		"name": "Personal Care",
		"count": 1610
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 414
	  },
	  {
		"name": "Skin Care",
		"count": 552
	  },
	  {
		"name": "Men Accessories",
		"count": 368
	  },
	  {
		"name": "Men Clothing",
		"count": 1150
	  },
	  {
		"name": "Men Watches",
		"count": 391
	  },
	  {
		"name": "Women Clothing",
		"count": 506
	  },
	  {
		"name": "Women Jwellery",
		"count": 506
	  },
	  {
		"name": "Women Maternity",
		"count": 69
	  },
	  {
		"name": "Birds",
		"count": 414
	  },
	  {
		"name": "Dogs",
		"count": 989
	  },
	  {
		"name": "Gardening",
		"count": 1173
	  },
	  {
		"name": "Lawn Mowers",
		"count": 851
	  },
	  {
		"name": "Others",
		"count": 322
	  },
	  {
		"name": "Pest Control",
		"count": 989
	  },
	  {
		"name": "Alternative Rock",
		"count": 414
	  },
	  {
		"name": "Electrical",
		"count": 138
	  },
	  {
		"name": "Hand Tools",
		"count": 805
	  },
	  {
		"name": "Measuring Tools",
		"count": 1058
	  },
	  {
		"name": "PlayStation",
		"count": 1035
	  },
	  {
		"name": "Pop",
		"count": 851
	  },
	  {
		"name": "Safety & Security",
		"count": 575
	  },
	  {
		"name": "Sony PSP",
		"count": 253
	  },
	  {
		"name": "Xbox 360",
		"count": 184
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 874
	  },
	  {
		"name": "Movies",
		"count": 529
	  },
	  {
		"name": "Metal",
		"count": 667
	  }] });
	}else if(year1==2010 && year2==2011 || year1==2012 && year2==2013){
		this.setState({
      bubbleChartData: [
	  {
		"name": "Hair Care",
		"count": 1104
	  },
	  {
		"name": "Health Care",
		"count": 851
	  },
	  {
		"name": "Household Supplies",
		"count": 920
	  },
	  {
		"name": "Makeup",
		"count": 529
	  },
	  {
		"name": "Personal Care",
		"count": 2116
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 690
	  },
	  {
		"name": "Skin Care",
		"count": 943
	  },
	  {
		"name": "Men Accessories",
		"count": 437
	  },
	  {
		"name": "Men Clothing",
		"count": 874
	  },
	  {
		"name": "Men Watches",
		"count": 322
	  },
	  {
		"name": "Women Clothing",
		"count": 414
	  },
	  {
		"name": "Women Jwellery",
		"count": 414
	  },
	  {
		"name": "Birds",
		"count": 552
	  },
	  {
		"name": "Dogs",
		"count": 1564
	  },
	  {
		"name": "Gardening",
		"count": 1127
	  },
	  {
		"name": "Lawn Mowers",
		"count": 1173
	  },
	  {
		"name": "Others",
		"count": 345
	  },
	  {
		"name": "Pest Control",
		"count": 1518
	  },
	  {
		"name": "Alternative Rock",
		"count": 230
	  },
	  {
		"name": "Electrical",
		"count": 736
	  },
	  {
		"name": "Hand Tools",
		"count": 1265
	  },
	  {
		"name": "Measuring Tools",
		"count": 897
	  },
	  {
		"name": "PlayStation",
		"count": 782
	  },
	  {
		"name": "Pop",
		"count": 713
	  },
	  {
		"name": "Safety & Security",
		"count": 897
	  },
	  {
		"name": "Sony PSP",
		"count": 437
	  },
	  {
		"name": "Xbox 360",
		"count": 506
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 1035
	  },
	  {
		"name": "Movies",
		"count": 414
	  },
	  {
		"name": "Metal",
		"count": 368
	  }] });
	}else if(year1==2011 && year2==2012){
		this.setState({
      bubbleChartData: [
	  {
		"name": "Hair Care",
		"count": 1863
	  },
	  {
		"name": "Health Care",
		"count": 1817
	  },
	  {
		"name": "Household Supplies",
		"count": 1242
	  },
	  {
		"name": "Makeup",
		"count": 828
	  },
	  {
		"name": "Personal Care",
		"count": 1656
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 1794
	  },
	  {
		"name": "Skin Care",
		"count": 1495
	  },
	  {
		"name": "Men Accessories",
		"count": 713
	  },
	  {
		"name": "Men Clothing",
		"count": 598
	  },
	  {
		"name": "Men Watches",
		"count": 667
	  },
	  {
		"name": "Women Clothing",
		"count": 345
	  },
	  {
		"name": "Women Jwellery",
		"count": 345
	  },
	  {
		"name": "Birds",
		"count": 1058
	  },
	  {
		"name": "Dogs",
		"count": 1702
	  },
	  {
		"name": "Gardening",
		"count": 1587
	  },
	  {
		"name": "Lawn Mowers",
		"count": 1311
	  },
	  {
		"name": "Others",
		"count": 897
	  },
	  {
		"name": "Pest Control",
		"count": 2231
	  },
	  {
		"name": "Alternative Rock",
		"count": 506
	  },
	  {
		"name": "Electrical",
		"count": 1541
	  },
	  {
		"name": "Hand Tools",
		"count": 1518
	  },
	  {
		"name": "Measuring Tools",
		"count": 1012
	  },
	  {
		"name": "PlayStation",
		"count": 920
	  },
	  {
		"name": "Pop",
		"count": 667
	  },
	  {
		"name": "Safety & Security",
		"count": 1840
	  },
	  {
		"name": "Sony PSP",
		"count": 460
	  },
	  {
		"name": "Xbox 360",
		"count": 460
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 1679
	  },
	  {
		"name": "Movies",
		"count": 782
	  },
	  {
		"name": "Metal",
		"count": 1311
	  }] });
	}else if(year1==2009 && year2==2011 || year1==2012 && year2==2014){
		this.setState({
      bubbleChartData: [
	  {
		"name": "Hair Care",
		"count": 1725
	  },
	  {
		"name": "Health Care",
		"count": 1587
	  },
	  {
		"name": "Household Supplies",
		"count": 1081
	  },
	  {
		"name": "Makeup",
		"count": 1035
	  },
	  {
		"name": "Personal Care",
		"count": 3726
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 1104
	  },
	  {
		"name": "Skin Care",
		"count": 1495
	  },
	  {
		"name": "Men Accessories",
		"count": 805
	  },
	  {
		"name": "Men Clothing",
		"count": 2024
	  },
	  {
		"name": "Men Watches",
		"count": 713
	  },
	  {
		"name": "Women Clothing",
		"count": 920
	  },
	  {
		"name": "Women Jwellery",
		"count": 920
	  },
	  {
		"name": "Women Maternity",
		"count": 69
	  },
	  {
		"name": "Birds",
		"count": 966
	  },
	  {
		"name": "Dogs",
		"count": 2553
	  },
	  {
		"name": "Gardening",
		"count": 2300
	  },
	  {
		"name": "Lawn Mowers",
		"count": 2024
	  },
	  {
		"name": "Others",
		"count": 667
	  },
	  {
		"name": "Pest Control",
		"count": 2507
	  },
	  {
		"name": "Alternative Rock",
		"count": 644
	  },
	  {
		"name": "Electrical",
		"count": 874
	  },
	  {
		"name": "Hand Tools",
		"count": 2070
	  },
	  {
		"name": "Measuring Tools",
		"count": 1955
	  },
	  {
		"name": "PlayStation",
		"count": 1817
	  },
	  {
		"name": "Pop",
		"count": 1564
	  },
	  {
		"name": "Safety & Security",
		"count": 1472
	  },
	  {
		"name": "Sony PSP",
		"count": 690
	  },
	  {
		"name": "Xbox 360",
		"count": 690
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 1909
	  },
	  {
		"name": "Movies",
		"count": 943
	  },
	  {
		"name": "Metal",
		"count": 1035
	  }] });
	}else if(year1==2009 && year2==2012 || year1==2011 && year2==2013){
		this.setState({
      bubbleChartData: [
	  {
		"name": "Hair Care",
		"count": 3588
	  },
	  {
		"name": "Health Care",
		"count": 3404
	  },
	  {
		"name": "Household Supplies",
		"count": 2323
	  },
	  {
		"name": "Makeup",
		"count": 1863
	  },
	  {
		"name": "Personal Care",
		"count": 5382
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 2898
	  },
	  {
		"name": "Skin Care",
		"count": 2990
	  },
	  {
		"name": "Men Accessories",
		"count": 1518
	  },
	  {
		"name": "Men Clothing",
		"count": 2622
	  },
	  {
		"name": "Men Watches",
		"count": 1380
	  },
	  {
		"name": "Women Clothing",
		"count": 1265
	  },
	  {
		"name": "Women Jwellery",
		"count": 1265
	  },
	  {
		"name": "Women Maternity",
		"count": 69
	  },
	  {
		"name": "Birds",
		"count": 2024
	  },
	  {
		"name": "Dogs",
		"count": 4255
	  },
	  {
		"name": "Gardening",
		"count": 3887
	  },
	  {
		"name": "Lawn Mowers",
		"count": 3335
	  },
	  {
		"name": "Others",
		"count": 1564
	  },
	  {
		"name": "Pest Control",
		"count": 4738
	  },
	  {
		"name": "Alternative Rock",
		"count": 1150
	  },
	  {
		"name": "Electrical",
		"count": 2415
	  },
	  {
		"name": "Hand Tools",
		"count": 3588
	  },
	  {
		"name": "Measuring Tools",
		"count": 2967
	  },
	  {
		"name": "PlayStation",
		"count": 2737
	  },
	  {
		"name": "Pop",
		"count": 2231
	  },
	  {
		"name": "Safety & Security",
		"count": 3312
	  },
	  {
		"name": "Sony PSP",
		"count": 1150
	  },
	  {
		"name": "Xbox 360",
		"count": 1150
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 3588
	  },
	  {
		"name": "Movies",
		"count": 1725
	  },
	  {
		"name": "Metal",
		"count": 2346
	  }] });
	}else if(year1==2009 && year2==2013 || year1==2010 && year2==2014){
		this.setState({
      bubbleChartData: [{
		"name": "Hair Care",
		"count": 6463
	  },
	  {
		"name": "Health Care",
		"count": 6923
	  },
	  {
		"name": "Household Supplies",
		"count": 6095
	  },
	  {
		"name": "Makeup",
		"count": 4209
	  },
	  {
		"name": "Personal Care",
		"count": 6601
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 5980
	  },
	  {
		"name": "Skin Care",
		"count": 6394
	  },
	  {
		"name": "Men Accessories",
		"count": 3243
	  },
	  {
		"name": "Men Clothing",
		"count": 4600
	  },
	  {
		"name": "Men Watches",
		"count": 2323
	  },
	  {
		"name": "Women Clothing",
		"count": 2116
	  },
	  {
		"name": "Women Jwellery",
		"count": 2116
	  },
	  {
		"name": "Women Maternity",
		"count": 207
	  },
	  {
		"name": "Birds",
		"count": 3197
	  },
	  {
		"name": "Dogs",
		"count": 6670
	  },
	  {
		"name": "Gardening",
		"count": 7268
	  },
	  {
		"name": "Lawn Mowers",
		"count": 5796
	  },
	  {
		"name": "Others",
		"count": 3013
	  },
	  {
		"name": "Pest Control",
		"count": 8211
	  },
	  {
		"name": "Alternative Rock",
		"count": 2001
	  },
	  {
		"name": "Electrical",
		"count": 5428
	  },
	  {
		"name": "Hand Tools",
		"count": 5589
	  },
	  {
		"name": "Measuring Tools",
		"count": 4830
	  },
	  {
		"name": "PlayStation",
		"count": 4186
	  },
	  {
		"name": "Pop",
		"count": 3358
	  },
	  {
		"name": "Safety & Security",
		"count": 6095
	  },
	  {
		"name": "Sony PSP",
		"count": 1449
	  },
	  {
		"name": "Xbox 360",
		"count": 2162
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 5796
	  },
	  {
		"name": "Movies",
		"count": 2668
	  },
	  {
		"name": "Metal",
		"count": 3128
	  }] });
	}else if(year1==2009 && year2==2014 || year1==2012 && year2==2014){
		this.setState({
      bubbleChartData: [{
		"name": "Hair Care",
		"count": 14789
	  },
	  {
		"name": "Health Care",
		"count": 15755
	  },
	  {
		"name": "Household Supplies",
		"count": 16238
	  },
	  {
		"name": "Makeup",
		"count": 14260
	  },
	  {
		"name": "Personal Care",
		"count": 9476
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 15525
	  },
	  {
		"name": "Skin Care",
		"count": 14996
	  },
	  {
		"name": "Men Accessories",
		"count": 12052
	  },
	  {
		"name": "Men Clothing",
		"count": 11362
	  },
	  {
		"name": "Men Watches",
		"count": 4669
	  },
	  {
		"name": "Women Clothing",
		"count": 5290
	  },
	  {
		"name": "Women Jwellery",
		"count": 5290
	  },
	  {
		"name": "Women Maternity",
		"count": 345
	  },
	  {
		"name": "Birds",
		"count": 7107
	  },
	  {
		"name": "Dogs",
		"count": 12903
	  },
	  {
		"name": "Gardening",
		"count": 14490
	  },
	  {
		"name": "Lawn Mowers",
		"count": 13317
	  },
	  {
		"name": "Others",
		"count": 7038
	  },
	  {
		"name": "Pest Control",
		"count": 15594
	  },
	  {
		"name": "Alternative Rock",
		"count": 3795
	  },
	  {
		"name": "Electrical",
		"count": 15295
	  },
	  {
		"name": "Hand Tools",
		"count": 12420
	  },
	  {
		"name": "Measuring Tools",
		"count": 9798
	  },
	  {
		"name": "PlayStation",
		"count": 7659
	  },
	  {
		"name": "Pop",
		"count": 6670
	  },
	  {
		"name": "Safety & Security",
		"count": 14122
	  },
	  {
		"name": "Sony PSP",
		"count": 1978
	  },
	  {
		"name": "Xbox 360",
		"count": 3565
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 11799
	  },
	  {
		"name": "Movies",
		"count": 9522
	  },
	  {
		"name": "Metal",
		"count": 5635
	  }] });
	}else if(year1==2010 && year2==2012){
		this.setState({
      bubbleChartData: [{
		"name": "Hair Care",
		"count": 2967
	  },
	  {
		"name": "Health Care",
		"count": 2668
	  },
	  {
		"name": "Household Supplies",
		"count": 2162
	  },
	  {
		"name": "Makeup",
		"count": 1357
	  },
	  {
		"name": "Personal Care",
		"count": 3772
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 2484
	  },
	  {
		"name": "Skin Care",
		"count": 2438
	  },
	  {
		"name": "Men Accessories",
		"count": 1150
	  },
	  {
		"name": "Men Clothing",
		"count": 1472
	  },
	  {
		"name": "Men Watches",
		"count": 989
	  },
	  {
		"name": "Women Clothing",
		"count": 759
	  },
	  {
		"name": "Women Jwellery",
		"count": 759
	  },
	  {
		"name": "Birds",
		"count": 1610
	  },
	  {
		"name": "Dogs",
		"count": 3266
	  },
	  {
		"name": "Gardening",
		"count": 2714
	  },
	  {
		"name": "Lawn Mowers",
		"count": 2484
	  },
	  {
		"name": "Others",
		"count": 1242
	  },
	  {
		"name": "Pest Control",
		"count": 3749
	  },
	  {
		"name": "Alternative Rock",
		"count": 736
	  },
	  {
		"name": "Electrical",
		"count": 2277
	  },
	  {
		"name": "Hand Tools",
		"count": 2783
	  },
	  {
		"name": "Measuring Tools",
		"count": 1909
	  },
	  {
		"name": "PlayStation",
		"count": 1702
	  },
	  {
		"name": "Pop",
		"count": 1380
	  },
	  {
		"name": "Safety & Security",
		"count": 2737
	  },
	  {
		"name": "Sony PSP",
		"count": 897
	  },
	  {
		"name": "Xbox 360",
		"count": 966
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 2714
	  },
	  {
		"name": "Movies",
		"count": 1196
	  },
	  {
		"name": "Metal",
		"count": 1679
	  }] });
	}else if(year1==2010 && year2==2013){
		this.setState({
      bubbleChartData: [
	  {
		"name": "Hair Care",
		"count": 5842
	  },
	  {
		"name": "Health Care",
		"count": 6187
	  },
	  {
		"name": "Household Supplies",
		"count": 5934
	  },
	  {
		"name": "Makeup",
		"count": 3703
	  },
	  {
		"name": "Personal Care",
		"count": 4991
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 5566
	  },
	  {
		"name": "Skin Care",
		"count": 5842
	  },
	  {
		"name": "Men Accessories",
		"count": 2875
	  },
	  {
		"name": "Men Clothing",
		"count": 3450
	  },
	  {
		"name": "Men Watches",
		"count": 1932
	  },
	  {
		"name": "Women Clothing",
		"count": 1610
	  },
	  {
		"name": "Women Jwellery",
		"count": 1610
	  },
	  {
		"name": "Women Maternity",
		"count": 2012
	  },
	  {
		"name": "Birds",
		"count": 2783
	  },
	  {
		"name": "Dogs",
		"count": 5681
	  },
	  {
		"name": "Gardening",
		"count": 6095
	  },
	  {
		"name": "Lawn Mowers",
		"count": 4945
	  },
	  {
		"name": "Others",
		"count": 2691
	  },
	  {
		"name": "Pest Control",
		"count": 7222
	  },
	  {
		"name": "Alternative Rock",
		"count": 1587
	  },
	  {
		"name": "Electrical",
		"count": 5290
	  },
	  {
		"name": "Hand Tools",
		"count": 4784
	  },
	  {
		"name": "Measuring Tools",
		"count": 3772
	  },
	  {
		"name": "PlayStation",
		"count": 3151
	  },
	  {
		"name": "Pop",
		"count": 2507
	  },
	  {
		"name": "Safety & Security",
		"count": 5520
	  },
	  {
		"name": "Sony PSP",
		"count": 1196
	  },
	  {
		"name": "Xbox 360",
		"count": 1978
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 4922
	  },
	  {
		"name": "Movies",
		"count": 2139
	  },
	  {
		"name": "Metal",
		"count": 2461
	  }] });
	}else{
		this.setState({
      bubbleChartData: [{
		"name": "Hair Care",
		"count": 4738
	  },
	  {
		"name": "Health Care",
		"count": 5336
	  },
	  {
		"name": "Household Supplies",
		"count": 5014
	  },
	  {
		"name": "Makeup",
		"count": 3174
	  },
	  {
		"name": "Personal Care",
		"count": 2875
	  },
	  {
		"name": "Vitamins & Dietary Supplements",
		"count": 4876
	  },
	  {
		"name": "Skin Care",
		"count": 4899
	  },
	  {
		"name": "Men Accessories",
		"count": 2438
	  },
	  {
		"name": "Men Clothing",
		"count": 2576
	  },
	  {
		"name": "Men Watches",
		"count": 1610
	  },
	  {
		"name": "Women Clothing",
		"count": 1196
	  },
	  {
		"name": "Women Jwellery",
		"count": 1196
	  },
	  {
		"name": "Women Maternity",
		"count": 138
	  },
	  {
		"name": "Birds",
		"count": 2231
	  },
	  {
		"name": "Dogs",
		"count": 4117
	  },
	  {
		"name": "Gardening",
		"count": 4968
	  },
	  {
		"name": "Lawn Mowers",
		"count": 3772
	  },
	  {
		"name": "Others",
		"count": 2346
	  },
	  {
		"name": "Pest Control",
		"count": 5704
	  },
	  {
		"name": "Alternative Rock",
		"count": 1357
	  },
	  {
		"name": "Electrical",
		"count": 4554
	  },
	  {
		"name": "Hand Tools",
		"count": 3519
	  },
	  {
		"name": "Measuring Tools",
		"count": 2875
	  },
	  {
		"name": "PlayStation",
		"count": 2369
	  },
	  {
		"name": "Pop",
		"count": 1794
	  },
	  {
		"name": "Safety & Security",
		"count": 4623
	  },
	  {
		"name": "Sony PSP",
		"count": 759
	  },
	  {
		"name": "Xbox 360",
		"count": 1472
	  },
	  {
		"name": "Power Tool Accessories",
		"count": 3887
	  },
	  {
		"name": "Movies",
		"count": 1725
	  },
	  {
		"name": "Metal",
		"count": 2093
	  }] });
	}
  }

  render() {
    const width = window.screen.width / 2,height = window.screen.height;

    return React.createElement("div", { className: "charts", style: { width: width, margin: '0 auto' } },
    React.createElement("div", { className: "rangeSlider", style: { background: '#343042' } },
    React.createElement(RangeSlider, { onChangeYear: this.handleChangeYear.bind(this), data: this.state.rangeSliderData })),

    React.createElement("div", { className: "bubbleChart", style: { background: '#403c52' } },
    React.createElement(BubbleChart, { bubbleChartData: this.state.bubbleChartData })));


  }}


const mountingPoint = document.createElement('div');
mountingPoint.className = 'react-app';
document.body.appendChild(mountingPoint);

ReactDOM.render(
React.createElement(Charts, null),
mountingPoint);