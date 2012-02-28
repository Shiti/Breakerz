/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function() {
	var initializing = false, fnTest = /xyz/.test(function() {
		xyz;
	}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	this.Class = function() {
	};

	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for ( var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function"
					&& typeof _super[name] == "function"
					&& fnTest.test(prop[name]) ? (function(name, fn) {
				return function() {
					var tmp = this._super;

					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];

					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);
					this._super = tmp;

					return ret;
				};
			})(name, prop[name]) : prop[name];
		}

		// The dummy class constructor
		function Class() {
			this.guid = guid();
			// All construction is actually done in the init method
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;

		return Class;
	};
})();

function guid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

var canvas, context;

var gamely = {
	CONTROL_TYPE : {
		HUMAN : 1,
		COMPUTER : 2
	}
};

var Actor = Class.extend({
	init : function(x, y, visible, color, controlType, canMove) {
		this.x = x;
		this.y = y;
		this.controlType = controlType;
		this.canMove = canMove;
		this.visible = visible;
		this.color = color;
		this.active = true;
		this.moveLeft = false;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		this.height = 0;
		this.width = 0;
		this.angle = 0;
		this.speed = 0;
		this.actorClass = "actor";
	},

	show : function() {
		this.visible = true;
	},

	hide : function() {
		this.visible = false;
	},

	kill : function() {
		this.active = false;
		this.hide();
		
	},

	drawFunction : function() {
		// Do nothing
	},

	draw : function() {
		if (this.visible && this.active)
			this.drawFunction();
	},

	move : function(x, y) {
		if (this.canMove) {
			this.x = x;
			this.y = y;
		}
	},
	enableControls : function(moveLeft, moveRight, moveUp, moveDown) {
		if (this.canMove && this.controlType == gamely.CONTROL_TYPE.HUMAN) {
			this.moveLeft = moveLeft;
			this.moveRight = moveRight;
			this.moveUp = moveUp;
			this.moveDown = moveDown;
		}
	},
	manualMove : function(direction) {
		switch (direction) {
		case "left":
			if ((this.moveLeft) && (this.x > 0))
				this.move(this.x - 5, this.y);
			break;
		case "right":
			if ((this.moveRight) && (this.x + this.width < gameBoard.boardWidth))
				this.move(this.x + 5, this.y);
			break;
		case "up":
			if ((this.moveUp) && (this.y > 0))
				this.move(this.x, this.y - 5);
			break;
		case "down":
			if ((this.moveDown) && (this.y + this.height < gameBoard.boardHeight))
				this.move(this.x, this.y+5);
			break;
		default:
			break;
		}
	}

});

var CircleActor = Actor.extend({
	init : function(x, y, radius, visible, color, controlType,
			canMove) {
		this._super(x, y, visible, color, controlType,
				canMove);
		this.radius = radius;
		this.bounceOnLeftWall=false;
		this.bounceOnRightWall=false;
		this.bounceOnTopWall=false;
		this.bounceOnBottomWall=false;
	},
	drawFunction : function() {
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	},

	act : function() {

		var radians = this.angle * Math.PI / 180;
		var xunits = Math.cos(radians) * this.speed;
		var yunits = Math.sin(radians) * this.speed;
		this.hitWalls();
		//this.collidesWith(gameBoard.actors);
		this.move(this.x + xunits, this.y + yunits);

	},
	hitWalls: function(){
		//left side wall
		if((this.x - this.radius < 0)&&	(this.bounceOnLeftWall))
 
		{
			this.bounce('left');
		}
		//right side wall
		else if((this.x + this.radius > gameBoard.boardWidth)&&(this.bounceOnRightWall))
		{
			this.bounce('right');	
		}
		//top wall
		if((this.y - this.radius <= 0.0)&&(this.bounceOnTopWall))
		{
			this.bounce('top');
		}
		//bottom wall
		else if((this.y + this.radius >= gameBoard.boardHeight)&&(this.bounceOnBottomWall))
		{
			this.bounce('bottom');
		}
	},

	bounce : function(side) {
		switch(side){
		case "left":
			if (this.angle > 90 && this.angle < 180)
				this.angle = this.angle - 90;

			if (this.angle < 270 && this.angle > 180)
				this.angle = this.angle + 90;
			break;

		case "right":
			if (this.angle > 270)
				this.angle = this.angle - 90;

			if (this.angle < 90)
				this.angle = this.angle + 90;
			break;

		case "top":
			if(this.angle > 180)	
				this.angle = 360 - this.angle;
			break;

		case "bottom":
			if(this.angle < 180)
				this.angle = 360 - this.angle;
			break;
		}

	},
	collidesWith: function(actors){
		for(a in actors)
		{
			var actor = actors[a];
			if(actor.guid != this.guid)
			{
				if(actor.visible){
					

					if((this.x+this.radius>actor.x-1)&&(this.x+this.radius<actor.x+actor.width+1))
					{
						if((this.y+this.radius>actor.y-1)&&(this.y+this.radius<actor.y+actor.height+1))
						{
							if(actor.actorClass == "bar")			
								this.bounce('bottom');						
						}
					}				
					else if((this.y-this.radius>=actor.y)&&(this.y-this.radius<=actor.y+actor.height))					
					{
						if((this.x-this.radius>=actor.x)&&(this.x-this.radius<=actor.x+actor.width))
						{
							if(actor.actorClass=='brick')
							{
								actor.kill();
								this.bounce('top');
							}
						}
					}
				}
			}
		}
	}
});
var RectActor = Actor.extend({
	init : function( x, y, height, width, visible, color, controlType,
			canMove) {
		this._super( x, y, visible, color, controlType, canMove);
		this.height = height;
		this.width = width;
	},

	drawFunction : function() {
		context.fillStyle = this.color;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.strokeRect(this.x, this.y, this.width, this.height);
	}

});
var gameBoard = {
	actors : actors = new Array,
	boardHeight: boardHeight = 500,
	boardWidth: boardWidth = 500,
	clean : function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	},
	draw : function() {
		context.strokeStyle='black';
		context.strokeRect(0,0,this.boardWidth,this.boardHeight);
		for ( var i in actors) {
			actors[i].draw();
		}
	},
	redraw : function() {
		gameBoard.clean();
		gameBoard.draw();
	},
	addActor : function(actor) {
		actors.push(actor);
	},
	isGameOver: function(actor){
		if(actor.x>this.boardWidth||actor.y>this.boardHeight)
			{
				return true;
			}
	},
	drawGameOver: function(){
		context.fillText("Game Over!!",this.boardWidth/2,this.boardHeight/2);
	}
};


var moveRight, moveLeft;
var direction;

function initialScreen() {
	
	const BARHEIGHT = 10;
	const BARWIDTH = 120;

	const RADIUS = 15;

	const BRICKROWS=5;
	const BRICKCOLUMNS=10;
	const BRICKHEIGHT=20;
	const BRICKWIDTH=50;
	
	canvas = document.getElementById("board");
	context = canvas.getContext("2d");

	// starting positions of the ball rectWidth/2,canvas.height-30
	var ball = new CircleActor(gameBoard.boardWidth/2,gameBoard.boardHeight-30, RADIUS, true,
			"black", 2, true);
	ball.angle = 35;
	ball.speed = 5;
	ball.bounceOnLeftWall=true;
	ball.bounceOnRightWall=true;
	ball.bounceOnTopWall=true;
	//ball.bounceOnBottomWall=true;
	ball.actorClass = "ball";

	var bar = new RectActor(gameBoard.boardWidth/2 - 60, gameBoard.boardHeight - 10,
			BARHEIGHT, BARWIDTH, true, "orange", 1, true);
	bar.actorClass = "bar";

	gameBoard.addActor(ball);

	gameBoard.addActor(bar);
	
	var posx = 0;
	var posy = 0;
	
	for ( var j = 0; j < BRICKROWS; j++) {

		for ( var k = 0; k < BRICKCOLUMNS; k++) {
			brick=new RectActor(posx,posy,BRICKHEIGHT, BRICKWIDTH, true, "red",2, false);
			brick.actorClass = "brick";
			gameBoard.addActor(brick);
			posx += BRICKWIDTH;
		}
		posy += BRICKHEIGHT;
		posx = 0;
	}
	
	gameBoard.draw();

	setInterval(function() {
		ball.collidesWith(gameBoard.actors);
		ball.act();
		bar.enableControls(moveLeft, moveRight, false, false);
		bar.manualMove(direction);
		
		if(!gameBoard.isGameOver(ball)){
			gameBoard.redraw();
		}
		else gameBoard.drawGameOver();
	}, 33);
	
}

// event handler for key press
function onKeyDown(event) {

	if (event.keyCode == 39) {
		moveRight = true;
		direction = "right";
	} else if (event.keyCode == 37) {
		moveLeft = true;
		direction = "left";
	}
}

// event handler for key release
function onKeyUp(event) {
	if (event.keyCode == 39) {
		moveRight = false;
	} else if (event.keyCode == 37) {
		moveLeft = false;
	}
}

