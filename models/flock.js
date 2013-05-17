boxHW = 22.0;
halfWidths = [72.0,72.0,60.0];
MAX_FORCE = 155;
MAX_SPEED = 15.0;
spread = 5
buffer = 10.0;

spawnFlock = function(startPos,initVel,numBoids,flockId){
	//var start = [5,0.0,0];
    //var velocity = [1, 0, 0.0];
    var flockUp = [1.0, 0.0, 0.0];
    var velocity = initVel;

	var boids = [];
	for(var i=0; i < numBoids; i++){
		var position = vec3.create();
		position[0] = (Math.random()*spread*2-spread);
		position[1] = (Math.random()*spread*2-spread);
		position[2] = (Math.random()*spread*2-spread);
		vec3.add(startPos,position,position);
		var vel = vec3.create();
		vel.set(velocity);
		var up = vec3.create();
		up.set(flockUp); 
		var boidMember = new boid(position,vel,up,1.0,1);
		boidMember.update(0.0);
		//var sep = new behavior(0.1,3.0,180,seperation,boidMember);
		//var coh = new behavior(0.5,10.0,180,cohesion,boidMember);
		//var aln = new behavior(0.1,5,180,alignment,boidMember);
		//boidMember.addBehavior(sep);
		//boidMember.addBehavior(coh);
		//boidMember.addBehavior(aln);
		boids.push(boidMember);
	}
	return boids;
}

function linkBehavior(boidsList,weight,distance,angle,executor){
	for (var j=0; j<boidsList.length; j++){
		boidsList[j].addBehavior(new behavior(weight,distance,angle,executor,boidsList[j]));
	}
}

seperation = function(neighborhood,boid){
	var stear = vec3.create();
	var toBoid = vec3.create();
	var distace;
	for(var i=0; i<neighborhood.length; i++){
		vec3.subtract(boid.position,neighborhood[i].position,toBoid);
		distace = vec3.length(toBoid);
		vec3.normalize(toBoid);
		vec3.scale(toBoid,1/distace);
		vec3.add(stear,toBoid);
	}
	vec3.normalize(stear);
	return stear;
}

cohesion = function(neighborhood,boid){
	var stear = vec3.create();
	if(neighborhood.length > 0){
		var average = vec3.create();
		for(var i=0; i<neighborhood.length; i++){
			vec3.add(average,neighborhood[i].position);
		}
		vec3.scale(average,1.0/neighborhood.length);
		vec3.subtract(average,boid.position,stear);
		vec3.normalize(stear);
	}
	return stear;
}

alignment = function(neighborhood,boid){
	var steer = vec3.create(); 
	if (neighborhood.length > 0){
		for (var i=0; i<neighborhood.length; i++){
			vec3.add(steer,neighborhood[i].forward,steer);
		}
		vec3.scale(steer,neighborhood.length);
		vec3.normalize(steer);
	}
	return steer;

}

wallAvoidance = function(neighborhood,boid){
	var steer = vec3.create();
	var distToMaxX = boxHW - boid.position[0] + 0.0001;
	var distToMinX = Math.abs(-boxHW - boid.position[0] + 0.0001);
	var distToMaxY = boxHW - boid.position[1] + 0.0001;
	var distToMinY = Math.abs(-boxHW - boid.position[1] + 0.0001);
	var distToMaxZ = boxHW - boid.position[2] + 0.0001;
	var distToMinZ = Math.abs(-boxHW - boid.position[2] + 0.0001);
	
	var posXWallDir = [0,0.5,1];
	vec3.normalize(posXWallDir);
	var negXWallDir = [0,-0.5,-1];
	vec3.normalize(negXWallDir);
	var posZWallDir = [-1,0,0];
	var negZWallDir = [1,0,0];
	var posYWallDir = [1,0,0];
	var negYWallDir = [-1,0,0];

	vec3.add(steer,vec3.scale(posXWallDir,1/distToMaxX));
	vec3.add(steer,vec3.scale(negXWallDir,1/distToMinX));
	vec3.add(steer,vec3.scale(posZWallDir,1/distToMaxZ));
	vec3.add(steer,vec3.scale(negZWallDir,1/distToMinZ));
	vec3.add(steer,vec3.scale(posYWallDir,1/distToMaxY));
	vec3.add(steer,vec3.scale(negYWallDir,1/distToMinY));
	//vec3.normalize(steer);
	return steer;
}


