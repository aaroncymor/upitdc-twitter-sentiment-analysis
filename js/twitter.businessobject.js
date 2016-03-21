function TwitterAnalysis(data){
	this.data = data;
	var countryCodes = new Array();
	var countryNames = new Array();
	var englishData = new Array();
	var tweetWords = new Array();
	var tweetHashtags = new Array();
	
	this.processData = function processData(){

		for(i = 0; i < data.length; i++){
			if(data[i].hasOwnProperty("text")  && data[i].hasOwnProperty("user") && data[i].hasOwnProperty("place") && data[i].hasOwnProperty("lang")){
				if(data[i].lang == "en"){
					englishData.push(data[i]);
					
					if(data[i].hasOwnProperty("entities")){
						if(data[i].entities.hasOwnProperty("hashtags")){
							if(data[i].entities.hashtags.length > 0){
								for(j = 0; j < data[i].entities.hashtags.length; j++){
									var hashtag = data[i].entities.hashtags[j].text.toLowerCase();
									if($.inArray(hashtag,tweetHashtags) == -1)
										tweetHashtags.push(hashtag);
								}
							}
						}
					}	
					
					var words = data[i].text.toLowerCase().split(" ");
					for(j = 0; j < words.length; j++){
						if($.inArray(words[j],tweetWords) == -1)
							tweetWords.push(words[j])
					}
						
					if(data[i].user.hasOwnProperty("geo_enabled")){
						if( data[i].user.geo_enabled == true && data[i].place != null)
							if($.inArray(data[i].place.country_code,countryCodes) == -1){
								countryCodes.push(data[i].place.country_code);
								countryNames.push(data[i].place.country);
							}
					}
				}
			}
		};
	};
	
    this.getEnglishTweetsByPage = function getEnglishTweetsByPage(page, numOfElements){
        var x = (page * numOfElements) - numOfElements;
        var tweets = englishData.slice(x,x+numOfElements);

		return tweets;
    };
	
	this.getEnglishTweetsByHashTag = function getEnglishTweetsByHashTag(hashtag){
		var tweetsByHashtag = new Array();
		hashtag = hashtag.replace("#","").toLowerCase();
		for(i = 0; i < englishData.length; i++){
			if(englishData[i].hasOwnProperty("entities")){
				if(englishData[i].entities.hasOwnProperty("hashtags")){
					var arrHashtags = englishData[i].entities.hashtags;
					if(arrHashtags.length > 0){
						for(j = 0; j < arrHashtags.length; j++){
							if(hashtag == arrHashtags[j].text.toLowerCase()){
								tweetsByHashtag.push(englishData[i]);
								break;
							}
						}
					}
				}
			}
		}
		return tweetsByHashtag;
	}
	
	this.getCountryCodes = function getCountryCodes(){
		return countryCodes;	
	}
	
	this.getCountryNames = function getCountryNames(){
		return countryNames;
	}
	
	this.getCountryScores = function getCountryScores() {
		var countriesData = new Array();
		var stemmedCorpus = getStemmedCorpus();
		
		for(i = 0; i < countryCodes.length; i++){
			var averageScores = new Array();
			var ctr = 0; divisor = 0;
			var countryName = "";
			for(j = 0; j < englishData.length; j++){
				if(englishData[j].user.hasOwnProperty("geo_enabled")){
					if(englishData[j].place != null && englishData[j].user.geo_enabled==true){
						if(englishData[j].place.country_code == countryCodes[i]){
							var value = getTweetScore(englishData[j].text,stemmedCorpus);
							countryName = englishData[j].place.country;
							 if(!isNaN(value))
								ctr +=  value;
							divisor++;
						}
					}
				}
			}
			
			var average = (divisor!=0)?(ctr/divisor):0;
			
			//get only positive scores (more than zero)
			if(average > 0){
				averageScores.push(average);
				var country = new Country(countryCodes[i],countryName,averageScores);
				countriesData.push(country);			
			}
		}
		
		countriesData.sort(function(countryOne, countryTwo){
			return countryTwo.value - countryOne.value;
		});
		
		return countriesData;
	}
	
	this.getHashtags = function getHashtags(){
		
		var hashTagsData = new Array();
		for(i = 0; i < tweetHashtags.length; i++){
			var hashtagCtr = 0;
			for(j = 0; j < englishData.length; j++){
				if(englishData[j].hasOwnProperty("entities")){
					if(englishData[i].entities.hasOwnProperty("hashtags")){
						if(englishData[j].entities.hashtags.length > 0){
							for(k = 0; k < englishData[j].entities.hashtags.length; k++)
								if(tweetHashtags[i] == englishData[j].entities.hashtags[k].text.toLowerCase())
									hashtagCtr++;
						}
					}
				}
			}
			var dataArray = new Array();
			dataArray.push(hashtagCtr);
			var hashTagObj = new Hashtag(tweetHashtags[i],dataArray);
			hashTagsData.push(hashTagObj);
		}
		
		hashTagsData.sort(function(hashTagOne, hashTagTwo){
			return hashTagTwo.data - hashTagOne.data;
		});
		
		return hashTagsData;
	};
	
	this.getWords = function getWords(){
	
		var wordsData = new Array();
		for(i = 0; i < tweetWords.length; i++){
			var wordCtr = 0;
			for(j = 0; j < englishData.length; j++){
				var words = englishData[j].text.toLowerCase().split(" ");
				for(k = 0; k < words.length; k++){
					if(tweetWords[i] == words[k])
						wordCtr++;
				}
			}
			var dataArray = new Array();
			dataArray.push(wordCtr);
			var wordObj = new Word(tweetWords[i],dataArray);
			wordsData.push(wordObj);
		}
		
		wordsData.sort(function(wordOne, wordTwo){
			return wordTwo.data - wordOne.data;
		});
		
		return wordsData.slice(0,10);
	};
    
    this.getLength = function getLength(){
        return englishData.length;
    };
}

/** INDEPENDENT FUNCTIONS */
function getTweetScore(tweet,stemmedCorpus) {
	var tweetWords = tweet.toLowerCase().split(" ");
	var a, ctr = 0, divisor = 0;
	
	for(a=0;a<tweetWords.length;a++){
		if(stemmedCorpus.hasOwnProperty(stemmer(tweetWords[a]))){
			ctr+=stemmedCorpus[tweetWords[a]];
			divisor++;
		}
	}
	
	var average = (divisor!=0)?(ctr/divisor):0; 
	
	if(isNaN(average))
		average = 0;
	
	return average;
}

function getStemmedCorpus(){
	var stemmedCorpus = {};
	for(word in corpus){
		Object.defineProperty(stemmedCorpus, stemmer(word), {
			value: corpus[word],
			writable: true,
			enumerable: true,
			configurable: true
		});		
	}
	return stemmedCorpus;
}