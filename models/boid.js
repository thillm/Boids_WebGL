boid = function(position,velocity,up,mass){
	this.behaviors = [];
	this.position = position;
	this.velocity = velocity;
	this.forward = vec3.create();
	this.up = up;
	this.mass = mass;
	this.side = vec3.create();

	this.addBehavior = function(toAdd){
		this.behaviors.push(toAdd);
	}

	//boid functions
	this.update = function(delta){
		this.position[0] += (this.velocity[0]*delta);
		if(position[0] < -boxHW){
			position[0] = boxHW;
		}else if(position[0] > boxHW){
			position[0] = -boxHW;
		}
		this.position[1] += (this.velocity[1]*delta);
		if(position[1] < -boxHW){
			position[1] = boxHW;
		}else if(position[1] > boxHW){
			position[1] = -boxHW;
		}
		this.position[2] += (this.velocity[2]*delta);
		if(position[2] < -boxHW){
			position[2] = boxHW;
		}else if(position[2] > boxHW){
			position[2] = -boxHW;
		}
		vec3.normalize(this.velocity,this.forward);
		vec3.cross(this.forward,this.up,this.side);
		vec3.normalize(this.side);
		vec3.cross(this.forward,this.side,this.up);
		vec3.normalize(this.up);
	}

	this.updateStearing = function(others){
		var steerVec = vec3.create();
		for(var i=0; i<this.behaviors.length;i++){
			this.behaviors[i].clearNeighborhood();
		}
		for(var i=0; i<others.length;i++){
			if(others[i] == this){
				continue;
			}
			for(var j=0; j<this.behaviors.length;j++){
				this.behaviors[j].addIfInNeighborhood(others[i]);
			}
		}
		for(var i=0; i<this.behaviors.length;i++){
			vec3.add(steerVec,this.behaviors[i].steer());
		}
		var len = vec3.length(steerVec);
		if(len > MAX_FORCE){
			vec3.normalize(steerVec);
			vec3.scale(steerVec,MAX_FORCE);
		}
		vec3.scale(steerVec,(1/mass));
		vec3.add(velocity,steerVec);
		len = vec3.length(velocity);
		if(len > MAX_SPEED){
			vec3.normalize(velocity);
			vec3.scale(velocity,MAX_SPEED);
		}
	}

	this.getTransformation = function(){
		var transform = [this.forward[0],  this.up[0],       this.side[0],    0,
						  this.forward[1],  this.up[1],       this.side[1],    0,
						  this.forward[2],  this.up[2],       this.side[2],    0,
						  this.position[0], this.position[1], this.position[2],1 ];
		return transform;
	}
};

behavior = function (weight,distance,angle,executor,boid){
	this.boid = boid;
	this.weight = weight;
	this.distance = distance;
	this.minCosangle = Math.cos(degToRad(angle));
	this.neighborhood = [];
	this.addIfInNeighborhood = function(other){
		var cosAngle = vec3.dot(this.boid.forward,other.forward);
		if(cosAngle >= this.minCosangle){
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