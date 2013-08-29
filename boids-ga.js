readyForRating = false; //Are we waiting for user raiting
memberIndex = 0; //Index of the current boid simulation in the population
userRating = []; //Array holding rating of current generation
DEFAULT_RATING = 3; //Default user rating


$(document).ready(function(){
	$('#evaluationControls').hide(); //hide evaluation controls at start
	$('#start').click(function(){ //start button callback function
		var popSize = $('#populationSize').val();
		var generations = $('#numGenerations').val();
		var mutability = Math.min($('#mutabilityPercent').val()/100,1);
		var popDie = Math.min($('#populationLive').val()/100,1);
		var popBreed = Math.min($('#populationBreed').val()/100,1);
		Environment.configure({'populationSize':popSize,'generations':generations, 'mutability':mutability,'populationLive':popDie,'populationBreed':popBreed,'pruneEqualFitness':false});
        Environment.init();
		$('#configOptions').hide();
		$('#result').hide();
		$('#evaluationControls').show();
	});

	$('#next').click(function(){ //next button callback function
		if(readyForRating){
			memberIndex+=1;
			if(memberIndex >= Environment.inhabitants.length){
				memberIndex = 0;
			}
			loadMember(memberIndex);
			$('#result').hide();
		}
	});

	$('#previous').click(function(){ //previous button callback function
		if(readyForRating){
			memberIndex-=1;
			if(memberIndex < 0){
				memberIndex = Environment.inhabitants.length-1;
			}
			loadMember(memberIndex);
			$('#result').hide();
		}
	});

	$('#rateButton').click(function(){ //rateButton callback function
		if(readyForRating){
			readyForRating = false;
			clearBoids();
			Environment.generationAfterInteractiveStep();
		}
	});

	$('#rateGroup').click(function(){ //handles radio button clicks
		if(readyForRating){
			userRating[memberIndex] = $('input[name=rating]:checked').val();
		}
	});
	$('#showSave').click(function(){ //save button callback
		if(readyForRating){
			$('#result').html(getLoadText(Environment.inhabitants[memberIndex].chromosome));
			$('#result').show();
		}
	});
	$('#quit').click(function(){ //quit button callback
		$('#result').hide();
		$('#evaluationControls').hide();
		$('#configOptions').show();
		readyForRating = false;
	});
	$('#loadButton').click(function(){ //load button callback
		var loadString = $('#loadField').val();
		var boidParams;
		try{
			boidParams = JSON.parse(loadString);
			loadBoids(boidParams);
			$('#result').html(getLoadText(boidParams));
			$('#result').show();
			$('#configOptions').hide();
		}catch (e){
			alert("Error: Invalid Load String.");
		}
	});
});

/*
 *Load a member of the current population.
 *index - index in the population
 */
function loadMember(index){
	if(index < Environment.inhabitants.length){
		memberChromosome = Environment.inhabitants[index].chromosome;
		loadBoids(memberChromosome);
		console.log("Loading"+index+"\n"+memberChromosome);
		$('#count').html((index+1)+' of '+Environment.inhabitants.length);
		//$('input[name=rating][val='+userRating[index]+']').prop("checked", true);
		switch(parseInt(userRating[index]))
		{
			case 1:
				$('#rate1').prop("checked",true);
				break;
			case 2:
				$('#rate2').prop("checked",true);
				break;
			case 3:
				$('#rate3').prop("checked",true);
				break;
			case 4:
				$('#rate4').prop("checked",true);
				break;
			case 5:
				$('#rate5').prop("checked",true);
				break;
			default:
				alert("Invalid state");
		}
		
	}
}

/*
 *Constructor for a new individual
 */
Environment.Individual = function(){
	this.fitness = 0;
	this.chromosomeLength = 43;
	this.chromosome = new Array();
	for (var i = 0; i < this.chromosomeLength;i++){
		this.chromosome.push(Math.random());
    }
    this.mate = function(mutability, mate){
        if (!mate.chromosome){
                throw "Mate does not have a chromosome";
        }
        var newGuy = new Environment.Individual();
        var crossOverPoint = Math.floor(Math.random()*this.chromosomeLength);
        newGuy.chromosome = this.chromosome.slice(0,crossOverPoint).concat(mate.chromosome.slice(crossOverPoint,this.chromosomeLength));

        while (Math.random() < mutability){
                var mutateIndex = Math.floor(Math.random()*this.chromosomeLength); //a random gene will be mutated;
                newGuy.chromosome[mutateIndex] = Math.random();
        }
        return newGuy;
    }
}

/*
 *Fitness function. Just looks at user rating.
 */
Environment.fitnessFunction = function(individual){
	return userRating[Environment.inhabitants.indexOf(individual)];
}

/*
 *Starts the interactive rating for the current generation.
 */
Environment.interactiveStep = function(){
	for(var i=0; i<Environment.inhabitants.length;i++){
		userRating[i] = DEFAULT_RATING;
	}
	memberIndex = 0;
	loadMember(memberIndex);
    readyForRating = true;
}

/*
 *Updates the generation count.
 */
Environment.beforeGeneration = function(generation){
	$('#genCount').html('Generation #: '+generation);
}

/*
 *Check if the IGA is finished.
 *If it is, shows the best individual.
 *If not, continues to the next generation.
 */
Environment.afterGeneration = function(generation){
	if(generation >= Environment.generations){
		$('#evaluationControls').hide();
		var best = Environment.inhabitants[0];
		loadMember(0);
		$('#result').html(
			"The most fit individual is being displayed! <br/>"+
			getLoadText(best.chromosome)
		);
		$('#result').show();
	}else{
		Environment.generation();
	}
}

/*
 *Generates the text needed to load a boid simulation.
 */
function getLoadText(params){
	var text = "Copy the text below to save the information for this boid animation. <br/> It can be loaded later by pasting the text and pressing the load button at the Main screen <br/>"+
			"<textarea rows='1' cols='50' onclick='this.focus();this.select()' readonly='readonly'>["+params.toString()+"]</textarea>";
	return text;
}