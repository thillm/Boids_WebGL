
boxHW = 50.0;
MAX_FORCE = 1.0;
MAX_SPEED = 15.0;

spawnFlock = function(){
	var start = [5,0.0,-50];
    var velocity = [1.0, 0.0, 0.0];
    var flockUp = [0.0, 1.0, 0.0];

	boids = [];
	for(var i=0; i < 3; i++){
		var position = vec3.create();
		vec3.add(start,[-2 * i,0,0],position);
		var vel = vec3.create();
		vel.set(velocity);
		var up = vec3.create();
		up.set(flockUp); 
		var boidMember = new boid(position,vel,up,1.0);
		boidMember.update(0.0);
		var sep = new behavior(0.1,10.0,180,seperation,boidMember);
		var coh = new behavior(100,10.0,180,cohesion,boidMember);
		boidMember.addBehavior(sep);
		boids.push(boidMember);
	}
	return boids;
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
	var average = vec3.create();
	for(var i=0; i<neighborhood.length; i++){
		vec3.add(average,neighborhood[i].position);
	}
	average.scale(average,neighborhood.length);
	vec3.subtract(average,boid.position,stear);
	vec3.normalize(stear);
	return stear;
}


