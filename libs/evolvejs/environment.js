var Environment = (function () {
	var checkConfiguration = function(){
		if (my.populationSize <= 0)
			throw "Population size must be positive";
		if (my.mutability > 1 || this.mutability < 0)
			throw "Mutability must be 0 <= mutability <= 1";
		if (my.populationLive > 1 || this.populationLive < 0)
			throw "Population Live percent must be 0 < populationLive <= 1";
		if (my.populationBreed > 1 || this.populationBreed < 0)
			throw "Population Breed percent must be 0 < populationBreed <= 1"
		if (my.generations <= 0)
			throw "Generations must be positive";
		if (my.Individual == undefined){
			throw "Individuals are undefined";
		} 
		else {
			var myIndividual = new my.Individual();
			if (typeof myIndividual.mate !== 'function'){
				throw "Individual has no mate function";
			} 
			if (!myIndividual.chromosome){
				throw "Individual has no chromosome";
			} 
			
		}
	};

	var populate = function(){
		for (var i = 0; i < my.populationSize; i++){
			var inhabitant = new my.Individual(my.nextUId);
			my.nextUId++;
			my.inhabitants.push(inhabitant);	
		}
	};

    var DefaultIndividual = function(uid) {
		this.uid = uid;
		this.save = false;
		this.kill = false;
		this.chromosome = [Math.random()];
		this.chromosomeLength = 1;
		this.mate = function(mateIndividual){
			if (mateIndividual.chromosome[0]){
				;
			}		
		};
	};

	//This is my return var public on the module
	var my = {
		name: 			'default environment',
		nextUId:			1,
		populationSize:  	0,
		mutability: 		0.0,
		populationLive: 	0.0,
		populationBreed:    0.0, 
		generations: 		0,
                Individual: 		DefaultIndividual,
		inhabitants: 		new Array(),
		beforeGeneration: 	function(){},
		afterGeneration: 	function(){},
		generation: 		function(){},
		interactiveStep:    function(){}, 
		generationAfterInteractiveStep: function(){},

	};

	
	
	my.configure = function (configArray){
		for (prop in configArray){
                    
			if (my[prop] != undefined){
				my[prop] = configArray[prop];
			}
		}		
	};
        
    my.nextGeneration = function() {	
		var oldGeneration = new Array();
		var newGeneration = new Array();
		for(var i=0; i < my.inhabitants.length; i++){
			var individual = my.inhabitants[i];
			if( individual.save === true ){
				newGeneration.push(individual);
			}			
			if( individual.kill === false){
				oldGeneration.push(individual);
			}
		}
		my.inhabitants = newGeneration;
        if(oldGeneration.length > 0){
			while (my.inhabitants.length < my.populationSize){
					var parentOne = oldGeneration[Math.floor(Math.random()*oldGeneration.length)];
					var parentTwo = oldGeneration[Math.floor(Math.random()*oldGeneration.length)];
			
					my.inhabitants.push(parentOne.mate(my.mutability,parentTwo));
        }
		}else{
			while (my.inhabitants.length < my.populationSize){
				var newGuy = new Environment.Individual(Environment.nextUId++);
				my.inhabitants.push(newGuy);
			}
		}
	};

	my.init = function() {
		my.inhabitants = new Array();
		checkConfiguration();
		my.currentgen = 0;
		my.nextUId = 1;
		populate();
		my.generation();
	};
	
	my.generation = function(){
                
		if (my.currentgen >= my.generations)
			return;
		my.beforeGeneration(my.currentgen);
        my.interactiveStep();
	};

	my.interactiveStep = function(){
		my.generationAfterInteractiveStep();
	}

	my.generationAfterInteractiveStep = function(){
		my.nextGeneration();
		my.currentgen++;						
	
		return my.afterGeneration(my.currentgen);
	}
	
	return my;
}());


