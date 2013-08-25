readyForRating = false; //Are we waiting for user raiting
memberIndex = 0;
userRating = [];
DEFAULT_RATING = 3;


$(document).ready(function(){
	$('#evaluationControls').hide();
	$('#start').click(function(){
		var popSize = $('#populationSize').val();
		var generations = $('#numGenerations').val();
		var mutability = Math.min($('#mutabilityPercent').val()/100,1);
		var popDie = Math.min($('#populationLive').val()/100,1);
		var popBreed = Math.min($('#populationBreed').val()/100,1);
		Environment.configure({'populationSize':popSize,'generations':generations, 'mutability':mutability,'populationLive':popDie,'populationBreed':popBreed,'pruneEqualFitness':false});
        Environment.init();
		$('#configOptions').hide();
		$('#evaluationControls').show();
		//webGLStart();
	});

	$('#next').click(function(){
		if(readyForRating){
			memberIndex+=1;
			if(memberIndex >= Environment.inhabitants.length){
				memberIndex = 0;
			}
			loadMember(memberIndex);
		}
	});

	$('#previous').click(function(){
		if(readyForRating){
			memberIndex-=1;
			if(memberIndex < 0){
				memberIndex = Environment.inhabitants.length-1;
			}
			loadMember(memberIndex);
		}
	});

	$('#rateButton').click(function(){
		if(readyForRating){
			readyForRating = false;
			clearBoids();
			Environment.generationAfterInteractiveStep();
		}
	});

	$('#rateGroup').click(function(){
		if(readyForRating){
			userRating[memberIndex] = $('input[name=rating]:checked').val();
		}
	});
});

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

Environment.fitnessFunction = function(individual){
	return userRating[Environment.inhabitants.indexOf(individual)];
}

Environment.interactiveStep = function(){
	for(var i=0; i<Environment.inhabitants.length;i++){
		userRating[i] = DEFAULT_RATING;
	}
	memberIndex = 0;
	loadMember(memberIndex);
    readyForRating = true;
}

Environment.afterGeneration = function(generation){
	Environment.generation();
}