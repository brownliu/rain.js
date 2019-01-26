var canvas, ctx, DPR, options, canvasWidth, canvasHeight, wind_anger;
var hasBounce, maxNum, numLevel, size_range, speed, wind_direction, drop_chance, gravity;
var speed_x, speed_y;
var drops = [], bounces = [];
//将角度乘以 0.017453293 （2PI/360）即可转换为弧度。
var eachAnger = 0.017453293; 

window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback) {
	window.setTimeout(callback, 1000 / 30);
};


function Rain(opts) {
	options = opts;
	canvas = document.createElement( 'canvas' );
	document.body.appendChild( canvas );
	canvas.style.position = 'fixed';
	canvas.style.top = 0;
	canvas.style.zIndex = 1000;
	canvas.style.pointerEvents = 'None';
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
	ctx = canvas.getContext("2d");
	////兼容高清屏幕，canvas画布像素也要相应改变
	DPR = window.devicePixelRatio;
	//canvas画板像素大小， 需兼容高清屏幕，故画板canvas长宽应该乘于DPR
	canvas.width = canvas.clientWidth * DPR;
	canvas.height = canvas.clientHeight * DPR;
	// 获取设置的值
	speed = opts.speed || [10,100]; //风速范围，初始值加随机范围
	size_range = opts.size_range || [0.5,1.5]; //大小半径范围
	hasBounce = opts.hasBounce == undefined ? true : opts.hasBounce; //是否有反弹效果or false,
	var wind_max = 270 + Math.atan(canvas.width/canvas.height) / eachAnger
	var wind_min = 270 - Math.atan(canvas.width/canvas.height) / eachAnger
	//风的角度
	if(opts.wind_direction > wind_max) {
		wind_direction = wind_max
	}else if(opts.wind_direction < wind_min){
		wind_direction = wind_min
	}else{
		wind_direction = opts.wind_direction || 270;
	}
	maxNum = opts.maxNum || 1000; 
	numLevel = opts.numLevel || 10;
	drop_chance = opts.drop_chance || 0.1; // 下雨的概率
	gravity = opts.gravity || 0.163; // 重力
	//设置样式
	setStyle();
	update();
};

function setStyle(){

	ctx.lineWidth = 1.5 * DPR;
	// ctx.strokeStyle = 'rgba(223,223,223,0.6)';
	ctx.fillStyle = 'rgba(223,223,223,0.6)';

};

function easeIn(t, b, c, d) {
    return c * (t /= d) * t + b;
}

function easeOut(t, b, c, d) {
    return -c *(t /= d)*(t-2) + b;
}

function update() {
	//清理画图
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var i = drops.length;
	while (i--) {
		var drop = drops[i];
		drop.update();
		//如果drop实例下降到底部，则需要在drops数组中清除该实例对象
		if (drop.pos.y >= canvas.height) {
			//如果需要回弹，则在bouncess数组中加入bounce实例
			if(hasBounce){
				var n = Math.round(4 + Math.random() * 4);
				while (n--) bounces.push(new Bounce(drop.pos.x, canvas.height));
			};
			//如果drop实例下降到底部，则需要在drops数组中清楚该实例对象
			drops.splice(i, 1);
		}
		drop.draw();
	};
	//如果需要回弹
	if(hasBounce){
		var i = bounces.length;
		while (i--) {
			var bounce = bounces[i];
			bounce.update();
			bounce.draw();
			if (bounce.pos.y > canvas.height) bounces.splice(i, 1);
		};
	};

	//每次产生的数量
	if(drops.length < maxNum){
		if (Math.random() < drop_chance) {
			var i = 0, len = numLevel;
			for(; i<len; i++){
				drops.push(new Drop());
			};
		};
	};
	window.addEventListener( 'resize', onWindowResize, false );
	//不断循环update
	requestAnimFrame(update);
};

function onWindowResize() {
	canvas.style.width = window.innerWidth + 'px';
	canvas.style.height = window.innerHeight + 'px';
	//设置画板宽高
	canvas.width = canvas.clientWidth * DPR;
	canvas.height = canvas.clientHeight * DPR;
	setStyle();
};

var Vector = function(x, y) {
	//私有属性 横向速度x ,纵向速度y
	this.x = x || 0;
	this.y = y || 0;
};

//下落加速
Vector.prototype.add = function(v) {
	if (v.x != null && v.y != null) {
		this.x += v.x;
		this.y += v.y;
	} else {
		this.x += v;
		this.y += v;
	};
	return this;
};

Vector.prototype.copy = function() {
	//返回一个同等速度属性的Vector实例
	return new Vector(this.x, this.y);
};

//构造函数
var Drop = function() {
	//随机设置drop的初始坐标 
	var edge = Math.tan((270 - wind_direction) * eachAnger) * canvas.height;
	if(edge >= 0){
		this.pos = new Vector(Math.random() * (canvas.width + edge), 0)
	}else{
		this.pos = new Vector(Math.random() * (canvas.width - edge) + edge, 0)
	}
	//设置下落元素的大小
	//通过调用的OPTS函数的半径范围进行随机取值
	this.radius = (size_range[0] + Math.random() * size_range[1]) * DPR;
	//获得drop初始速度
	//通过调用的OPTS函数的速度范围进行随机取值
	this.speed = (speed[0] + Math.random() * speed[1]) * DPR;
	this.prev = this.pos;
	//获得风向的角度
	wind_anger = wind_direction * eachAnger;
	//获得横向加速度 
	speed_x = this.speed * Math.cos(wind_anger);
	//获得纵向加速度
	speed_y = - this.speed * Math.sin(wind_anger);
	//绑定一个速度实例
	this.vel = new Vector(speed_x, speed_y);
};

//公有方法-update 
Drop.prototype.update = function() {
	this.prev = this.pos.copy();
	//如果是有重力的情况，则纵向速度进行增加
	if (gravity) {
		this.vel.y += gravity;
	};
	this.pos.add(this.vel);
	this.setStyle();
};

Drop.prototype.setStyle = function() {
	var color = ctx.createLinearGradient(this.prev.x,this.prev.y,this.pos.x,this.pos.y);
   	color.addColorStop(0,'rgba(0,0,0,0');
   	color.addColorStop(0.5,'rgba(223,223,223,0.6)');
   	ctx.strokeStyle = color;
};

//公有方法-draw
Drop.prototype.draw = function() {
	ctx.beginPath();
	ctx.moveTo(this.prev.x, this.prev.y);
	// var ax = Math.abs(this.radius * Math.cos(wind_anger));
	// var ay = Math.abs(this.radius * Math.sin(wind_anger));
	// ctx.bezierCurveTo(this.pos.x + ax, this.pos.y + ay, this.prev.x + ax , this.prev.y + ay, this.pos.x, this.pos.y);
	ctx.lineTo(this.pos.x, this.pos.y);
	ctx.stroke();
};

var Bounce = function(x, y) {
	var dist = Math.random() * 7;
	var angle = Math.PI + Math.random() * Math.PI;
	this.pos = new Vector(x, y);
	this.radius = 0.2+ Math.random()*0.8;
	this.vel = new Vector( Math.cos(angle) * dist, Math.sin(angle) * dist);
};

Bounce.prototype.update = function() {
	this.vel.y += gravity;
	this.vel.x *= 0.95;
	this.vel.y *= 0.95;
	this.pos.add(this.vel);
};

Bounce.prototype.draw = function() {
	ctx.beginPath();
	ctx.arc(this.pos.x, this.pos.y, this.radius*DPR, 0, Math.PI * 2);
	ctx.fill();
};
