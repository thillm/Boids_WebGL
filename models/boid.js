
var wrap = true;
/**
*Constructor for an individual boid.
*  poition - vec3 that gives the initial position of the boid
*  velocity - vec3 that gives the initial velocity of the boid
*  up - what is up in the simulation
*  mass - what is the mass of the boid
*  flockId - which flock group the boid belongs to. Different flock
             groups will not interact with each other.
*/
boid = function(position,velocity,up,mass,flockId){
	this.behaviors = [];
	this.position = position;
	this.velocity = velocity;
	this.forward = vec3.create();
	this.up = up;
	this.mass = mass;
	this.side = vec3.create();
	this.flockId = flockId;
    
    /*
    *Add a behavior function. Ex) cohesion
    */
	this.addBehavior = function(toAdd){
		this.behaviors.push(toAdd);
	}

	/*
	 *Update function. Updates position and orientation.
	 *Called once per simulation step.
	 */
	this.update = function(delta){
		// update position based on velocity
		this.position[0] += (this.velocity[0]*delta);
		this.position[1] += (this.velocity[1]*delta);
		this.position[2] += (this.velocity[2]*delta);
        
        //Wrap through walls if wrap is enabled
		if (wrap){
			if(position[0] < -halfWidths[0]){
				position[0] = halfWidths[0];
			}else if(position[0] > halfWidths[0]){
				position[0] = -halfWidths[0];
			}
			if(position[1] < -halfWidths[1]){
				position[1] = halfWidths[1];
			}else if(position[1] > halfWidths[1]){
				position[1] = -halfWidths[1];
			}
			if(position[2] < -halfWidths[2]){
				position[2] = halfWidths[2];
			}else if(position[2] > halfWidths[2]){
				position[2] = -halfWidths[2];
			}
		}
		else { // 'collision avoidance' work in progress
			var distToMaxX = boxHW - this.position[0] + 0.0001;
			var distToMinX = Math.abs(-boxHW - this.position[0] + 0.0001);
			var distToMaxY = boxHW - this.position[1] + 0.0001;
			var distToMinY = Math.abs(-boxHW - this.position[1] + 0.0001);
			var distToMaxZ = boxHW - this.position[2] + 0.0001;
			var distToMinZ = Math.abs(-boxHW - this.position[2] + 0.0001);
			this.velocity[0] -= 0.1/distToMaxX;
			this.velocity[0] += 0.1/distToMinX;
			this.velocity[1] -= 1/distToMaxY;
			this.velocity[1] += 1/distToMinY;
			this.velocity[2] -= 1/distToMaxZ;
			this.velocity[2] += 1/distToMinZ;
		}

		//Recaclulate the orientation vectors
		vec3.normalize(this.velocity,this.forward);
		vec3.cross(this.forward,[0,1,0],this.side);
		vec3.normalize(this.side);
		vec3.cross(this.side,this.forward,this.up);
		vec3.normalize(this.up);
	}

	/**
	 *Update the boid's velocity vector based on the 
	 *  behavior functions applied to the boid.
	 *Called once per simulation step.
	 */
	this.updateStearing = function(others,delta){
		var steerVec = vec3.create();
		//Clear the neighborhood for each behavior
		for(var i=0; i<this.behaviors.length;i++){
			this.behaviors[i].clearNeighborhood();
		}
		//All each behavior to maintain its own neighborhood
		for(var i=0; i<others.length;i++){
			if(others[i] == this){
				continue;
			}
			for(var j=0; j<this.behaviors.length;j++){
				this.behaviors[j].addIfInNeighborhood(others[i]);
			}
		}
		//cacluate the total force from all behavior functions
		for(var i=0; i<this.behaviors.length;i++){
			var sVec = this.behaviors[i].steer();
			//console.log(sVec);
			vec3.add(steerVec,sVec);
		}
		//If the force is over Max Force, scale to Max Force
		var len = vec3.length(steerVec);
		if(len > MAX_FORCE){
			vec3.normalize(steerVec);
			vec3.scale(steerVec,MAX_FORCE);
		}
		vec3.scale(steerVec,(delta/mass)); //Use delta time
		vec3.add(velocity,steerVec);
		len = vec3.length(velocity);
		//If the speed is over maxSpeed, scale to maxSpeed
		if(len > MAX_SPEED){
			vec3.normalize(velocity);
			vec3.scale(velocity,MAX_SPEED);
		}
	}

	/**
	 * Constructs the transformation matrix for the boid's current orientation.
	 */
	this.getTransformation = function(){

		var transform = [ this.forward[0],  this.forward[1],       this.forward[2],    0,
						  this.up[0],       this.up[1],            this.up[2],         0,
						  this.side[0],     this.side[1],          this.side[2],       0,
						  this.position[0], this.position[1],      this.position[2],   1 ];
		return transform;
	}
};

/**
 * Constructor for a new behavior function.
 * Weight - Relative influence this behavior has compared to others.
 * mDist - Max distance to be in this behavior's neighborhood.
 * angle - Angle to be in the boid's perception range.
 * executor - The behavior function.
 * boid - the boid being affected.
 */
behavior = function (weight,mDist,angle,executor,boid){
	this.boid = boid;
	this.weight = weight;
	this.mDist = mDist;
	this.minCosangle = Math.cos(degToRad(angle));
	this.neighborhood = [];
	this.addIfInNeighborhood = function(other){
		var cosAngle = vec3.dot(this.boid.forward,other.forward);
		var disV = vec3.create();
		vec3.subtract(this.boid.position,other.position,disV);
		var distance = vec3.length(disV);
		if(distance <= this.mDist && cosAngle >= this.minCosangle){
			this.neighborhood.push(other);
		}
	}
	this.clearNeighborhood = function(){
		this.neighborhood.length = 0;
	}
	this.steer = function(){
		return vec3.scale(executor(this.neighborhood,this.boid),this.weight);
	}
} 