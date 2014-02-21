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
		/*
		if (typeof my.fitnessFunction !== 'function'){
			throw "Fitness function not present";	
		}*/
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
		//my.evaluatePopulation();
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
		//pruneEqualFitness:      true,
                Individual: 		DefaultIndividual,
		inhabitants: 		new Array(),
		//fitnessFunction: 	undefined,
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

	/*
    my.evaluatePopulation = function() {
		for(individual in my.inhabitants){
			my.inhabitants[individual].fitness = my.fitnessFunction(my.inhabitants[individual]);		
		}
		my.inhabitants.sort(my.sort);
    };
	*/
        
    my.nextGeneration = function() {
		/*
		var keepSize = Math.round(my.inhabitants.length * my.populationLive);
		var breedSize = Math.round(my.inhabitants.length * my.populationBreed);
		var oldGeneration = my.inhabitants;
		my.inhabitants = my.inhabitants.slice(0,keepSize);
        if (my.pruneEqualFitness){
            my.pruneFitness();
        }
        //keepSize = my.inhabitants.length;
		*/
		
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
        
        while (my.inhabitants.length < my.populationSize){
                var parentOne = oldGeneration[Math.floor(Math.random()*oldGeneration.length)];
                var parentTwo = oldGeneration[Math.floor(Math.random()*oldGeneration.length)];
        
                my.inhabitants.push(parentOne.mate(my.mutability,parentTwo));
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
		//my.evaluatePopulation();
		my.nextGeneration();
		my.currentgen++;						
	
		return my.afterGeneration(my.currentgen);
	}
	
	//default sorting of inhabitants by fitness. can be overriden if a different sort is required
	/*
	my.pruneFitness = function() {
		if (my.inhabitants.length <= 0){
			throw "Cannot sort - no inhabitants";
		}

                for (var i=0;i<my.inhabitants.length-1;i++){
                    for(var j=i+1;j<my.inhabitants.length && i<my.inhabitants.length-1;j++){
                                                
                        if(my.inhabitants[i].fitness!=my.inhabitants[j].fitness)
                            break;

                        my.inhabitants = my.inhabitants.slice(0,i).concat(my.inhabitants.slice(j-1));
                        
                    }
                }
                 return my.inhabitants;
	};
	
        my.sort = function(a,b) {
            if (b.fitness < a.fitness)
                return -1;
            if (a.fitness < b.fitness)
                return 1;
            return 0;
        };
	/*
	my.run = function() {
		try {
			checkConfiguration();
			populate();
			for (var generation = 0; generation < my.generations; generation++){
				my.beforeGeneration(generation);
				my.nextGeneration();
				my.evaluatePopulation();
				my.afterGeneration(generation);
			}			
		} 
		catch (e) {
			console.log('Error, Cannot run environment ' + my.name +  ': ' + e);
		}
		return my.inhabitants;
	}*/
	
	return my;
}());


