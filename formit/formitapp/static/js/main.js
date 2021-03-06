NORMAL_RADIUS = 30;
DRAGGING_RADIUS = 50;
LINES_VERT_DIST_APART = 55;
LINES_HORIZ_DIST_APART = 55;
SVG_WIDTH = 770;
SVG_HEIGHT = 550;
THUMB_WIDTH = 117;
THUMB_HEIGHT = 84;

colors = d3.scale.category10();
window.dance = {
	formations: new Array(),
	circles: new Array(),
	dragging: false,
	d_id: 0,
	f_id: 0,
	normal_opacity: "0.4",
	normal_width: "1",
	bold_opacity: "1.0",
	bold_width: "2",

	svg: d3.select('#canvas').attr('height', SVG_HEIGHT).attr('width', SVG_WIDTH).attr('class', 'stage'),
	
	init: function(){
		var obj = this,
		cache = obj.readState($('#dance_id').val());
		this.svg.on('touchstart', function(e){
			obj.deselectAll();
			obj.renderCircles();	
		});
		this.svg.on('click', function(e){
			obj.deselectAll();
			obj.renderCircles();	
		});
		this.svg.on('touchmove', function(e){
			d3.event.preventDefault();
			if(d3.event.touches.length <= 1){
				var touch = [d3.event.touches[0].clientX, d3.event.touches[0].clientY];
				for(var i = 0; i < dance.circles.length; i++){
					if(Math.abs(dance.circles[i].x + d3.event.target.offsetLeft - touch[0]) < dance.circles[i].r 
						&& Math.abs(dance.circles[i].y + d3.event.target.offsetTop - touch[1]) < dance.circles[i].r ){
						dance.circles[i].class = 'selected_dancer';
					}
				}
				dance.renderCircles();
			}
		});
		if(cache){
			this.formations = JSON.parse(cache)
			this.circles = this.formations[0];
			this.renderThumb(0,this.circles);
			for(var i=1; i < this.formations.length; i++){
				$('#next').before("<div class='thumb'><svg></svg></div>");
				this.renderThumb(i,this.formations[i]);
			}
			this.renderCircles();
		}
		else{
			this.formations.push(this.circles);
		}
	},

	addVerticalLines: function(){
		var num_vert_lines = this.svg.attr('width') / LINES_VERT_DIST_APART;
		var middle_line_index = Math.round(num_vert_lines / 2);
    for(var i=0;i<num_vert_lines;i++){
    	this.svg.append("svg:line")
		    .attr("x1", LINES_VERT_DIST_APART*i)
		    .attr("y1", 0)
		    .attr("x2", LINES_VERT_DIST_APART*i)
		    .attr("y2", this.svg.attr('height'))
		    .style("stroke", "rgb(6,120,155)")
		    .style("stroke-opacity", (i == middle_line_index) ? this.bold_opacity : this.normal_opacity)
		    .style("stroke-width", (i == middle_line_index) ? this.bold_width : this.normal_width);
    }
	},

	addHorizontalLines: function(){
		var num_horiz_lines = this.svg.attr('height') / LINES_HORIZ_DIST_APART;
		var middle_line_index = num_horiz_lines / 2;
    for(var i=0;i<num_horiz_lines;i++){
    	this.svg.append("svg:line")
			  .attr("x1", 0)
			  .attr("y1", LINES_HORIZ_DIST_APART*i)
			  .attr("x2", this.svg.attr('width'))
			  .attr("y2", LINES_HORIZ_DIST_APART*i)
			  .style("stroke", "rgb(6,120,155)")
			  .style("stroke-opacity", (i == middle_line_index) ? this.bold_opacity : this.normal_opacity)
			  .style("stroke-width", (i == middle_line_index) ? this.bold_width : this.normal_width);
    }
	},

	atEnd: function(){
		return this.f_id === this.formations.length - 1;
	},

	atBeginning: function(){
		return this.f_id === 0;
	},
	previousFormation: function(){
		if(this.f_id === 0) console.log("reached end");
		else this.f_id -= 1;
		this.showFormation(this.f_id);
	},
	// returns true is next formation already exists, and false if new one was created
	nextFormation: function(){
		if(this.f_id === this.formations.length - 1){
			// create new formation at end
			console.log("no here");
			this.newFormation();
			return false;
		} else {
			// go to next formation that already exists
			console.log("here");
			this.f_id += 1;
			this.showFormation(this.f_id);
			return true;
		}
	},
	newFormation: function(){
		// first show the last formation
		this.f_id = this.formations.length - 1;
		this.showFormation(this.f_id);

	 	this.addNewFormation();
		this.f_id += 1;
		this.showFormation(this.f_id);
		console.log(this.f_id);
		console.log(this.formations[this.f_id]);
		this.renderThumb(this.f_id, this.formations[this.f_id]);
	},
	showFormation: function(index){
		if(index >= this.formations.length || index < 0) {
			console.log("invalid formation id");
		} else {
			console.log("showing formation " + index);
			this.f_id = index;

			var children = $('.thumbnail_container').children('.thumb');
			children.removeClass('selected_thumb');
			children.eq(this.f_id).addClass('selected_thumb');

			this.circles = this.formations[this.f_id];
			this.renderCircles();
		}
	},
	addNewFormation: function(){
		var newFormation = _.map(this.circles, function(d){ var o = new Object(); return _.extend(o, d);})
		this.formations.push(newFormation);
	},
	renderCircles: function(){
		var drag = d3.behavior.drag()
								.on('drag', this.circledragmove)
								.on('dragstart', this.circledragstart)
								.on('dragend', this.circledragend);
		var groups = this.svg.selectAll('g').data(this.circles, function(d){ return d.d_id});
		this.svg.selectAll('g').transition()
			.duration(500)
			.attr('transform', function(d){ return 'translate(' + [d.x,d.y]+ ')'})
		this.svg.selectAll('g').select('circle')
				.attr('class', function(d){ return d.class })
				.style('fill', function(d){ return d.fillColor})
		new_groups = groups.enter().append('svg:g');
		new_groups.attr('transform', function(d){ return 'translate(' + [d.x,d.y]+ ')'})
			.call(drag)
				.append('svg:circle')
				.attr('r', 1)
				.attr('class', function(d){ return d.class })
				.style('fill', function(d){ return d.fillColor})
		dance.svg.selectAll('circle').transition()
					.attr('r', function(d){ return d.r;})
					.duration(500);
		new_groups.append('svg:text')
			.text(function(d){ console.log("setting normal radius of circle to " + d.r); return d.dancer_name;})
			.attr('text-anchor', 'middle');
		groups.exit()
			.transition()
				.duration(500)
				.style('opacity', 0)
				.remove();
	},
	renderThumb: function(index, circles){
		var groups = d3.select($('.thumb')[index]).selectAll('svg').selectAll('g');
		groups.data(circles,function(d){ return d.d_id})
			.enter().append('svg:g')
					.append('svg:circle');
		d3.select($('.thumb')[index]).selectAll('svg').selectAll('g')
			.attr('transform', function(d){ return 'translate(' + [d.x * THUMB_WIDTH/SVG_WIDTH ,d.y * THUMB_HEIGHT/SVG_HEIGHT]+ ')'})
			.select('circle')
					.attr('r', function(d){ return d.r * THUMB_WIDTH/SVG_WIDTH;})
					.style('fill', function(d){ return d.fillColor});
	},
	deselectAll: function(){
		console.log("deselecting all!");
		_.each(this.circles, function(d){ d.class = 'dancer';});
		this.renderCircles();
	},

	selectDancer: function(dancer){
		dancer.class = 'selected_dancer';
	},
	circledragstart: function(d){
		// set the currently selected dot's class and r
		d.class = 'selected_dancer';
		d.r = DRAGGING_RADIUS;
		dance.svg.selectAll('g').select('circle')
			.transition()
			.duration(400)
			.attr('class', function(d){ return d.class; })
			.attr('r', function(d){ return d.r; });
		d3.event.sourceEvent.stopPropagation();
	},

	circledragend: function(d){
		d.r = NORMAL_RADIUS
		d.x = Math.round(d.x / LINES_VERT_DIST_APART) * LINES_VERT_DIST_APART;
		d.y = Math.round(d.y / LINES_HORIZ_DIST_APART) * LINES_HORIZ_DIST_APART;
		// using 'dance.svg' here is important because it only retrieves the groups in the main canvas
		// d3.selectAll('g') instead (as was before) selects all the groups, including those in the thumbnails, and sets their radii to be the same
		dance.svg.selectAll('g')
			.attr('transform', function(d){ return 'translate(' + [d.x,d.y]+ ')'})
				.select('circle')
				.transition()
				.duration(200)
				.attr('class', function(d){ return d.class})
				.attr('r', function(d){ return d.r })
				.each('end', function(){ this.dragging = false;});
		d3.event.sourceEvent.stopPropagation();	
		dance.renderThumb(dance.f_id, dance.circles);
	},

	circledragmove: function(d) {
		d.x = d3.event.x;
		d.y = d3.event.y;
	  dance.svg.selectAll('g')
	  	.attr('transform', function(d){ return 'translate(' + [d.x,d.y]+ ')'});
	  d3.event.sourceEvent.stopPropagation();
	},

	nameSelected: function(name){
		var obj = this;
		var dancer = this.createDancer(this.d_id, 50, 50, name);
		this.d_id++;
		this.circles.push(dancer);
		this.renderCircles();
		dance.renderThumb(dance.f_id, dance.circles);
	},

	colorSelected: function(color){
		_.each(this.circles, function(e){ if(e.class === 'selected_dancer') e.fillColor=colors(parseInt(color))});
		this.svg.selectAll('circle').data(this.circles)
			.style('fill', function(d){ console.log(d.fillColor);return d.fillColor});
		this.deselectAll();
		dance.renderThumb(dance.f_id, dance.circles);
	},
	removeSelected: function(){
		this.circles = this.circles.filter(function(e){ return e.class != 'selected_dancer'});
		this.svg.selectAll('g').data(this.circles, function(d){ return d.d_id})
			.exit().transition()
			.duration(300)
			.style('opacity', 0)
			.remove();
	},

	toggleSelected: function(dancer){
		if(dancer.class === 'dancer') {dancer.class = 'selected_dancer'; console.log("selecting dancer..");}
		else {dancer.class = 'dancer'; console.log("deselecting dancer...");}
	},
	createDancer: function(d_id,x,y,name){
		obj = {}
		obj.d_id = d_id;
		obj.x = x;
		obj.y = y;
		obj.class = 'dancer';
		obj.r = NORMAL_RADIUS;
		obj.fillColor = 'white';
		obj.dancer_name = name;
		return obj;
	},
	readState: function(dance_id){
		return sessionStorage.getItem('dance');
	},
	saveState: function(dance_id){
		sessionStorage.setItem('dance', JSON.stringify(dance.formations));
		$.post('/save_dance/' + dance_id, {data : JSON.stringify(dance.formations)}, function(data){
			console.log("Success!");
		});
	}
}

