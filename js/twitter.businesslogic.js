var twitterObj = new TwitterAnalysis(data);
twitterObj.processData();

function generateNumberOfPages(numOfPages) {
	var options = "";
	for (i = 1; i <= Math.ceil(twitterObj.getLength() / numOfPages); i++) {
        options += '<option value="' + i + '">Page ' + i + '</option>';		
	}
	
	$("#page").html(options);
	$("#page").change(function() {
		$( "select option:selected" ).each(function() {
			$("#btnShowAndHide").prop('value', 'Hide');
			$("#twitter").html(parseTable(twitterObj.getEnglishTweetsByPage($(this).val(),numOfPages)));
		});
	}).trigger( "change" );
}

function generateNumberOfPagesForHash(numOfPages,hashtag) {
	var hashtagTweets = twitterObj.getEnglishTweetsByHashTag(hashtag);
	var options = "";
	for (i = 1; i <= Math.ceil(hashtagTweets.length / numOfPages); i++) {
        options += '<option value="' + i + '">Page ' + i + '</option>';		
	}
	
	$("#page").html(options);
	$("#page").change(function() {
		$( "select option:selected" ).each(function() {
			var x = ($(this).val() * numOfPages) - numOfPages;
			$("#twitter").html(parseTable(hashtagTweets.slice(x,x+numOfPages)));
		});
	}).trigger( "change" );
}

function getEnglishTweetsByPage(page, numOfElements, hashtag){
	var x = (page * numOfElements) - numOfElements;
	var tweets = twitterObj.getEnglishTweetsByHashTag(hashtag).slice(x,x+numOfElements);

	return tweets;
};

function parseTable(tweets){
	twitterTable = '<table border="1">';
	for(i = 0; i < tweets.length; i++){
		if(tweets[i].hasOwnProperty("text") && tweets[i].hasOwnProperty("user")) {
			var value = getTweetScore(tweets[i].text,getStemmedCorpus());
			var cleanImgLink = "";
			if(tweets[i].user.hasOwnProperty("profile_image_url_https") && tweets[i].user.hasOwnProperty("screen_name") ){
				var img = tweets[i].user.profile_image_url_https;
				cleanImgLink = img.replace('\\','');
				twitterTable += '<tr><td><div class="twitter-user-container"><img src="' + cleanImgLink + '" />';
				twitterTable += '@'  + tweets[i].user.screen_name + '</div>' 
				twitterTable += '<div class="twitter-text">' + twitterLinks(tweets[i].text) + '</div></td>';
				twitterTable += '<td><div class="twitter-score">' + parseSmiley(value) + '</div></td></tr>';
			}
		}
	}
	twitterTable += '</table>';
	return twitterTable;
}

function parseSmiley(tweetScore){
	var imageHtml = '<img src="';
	if(tweetScore > 0){
		imageHtml += "images/happy.png";
	} else if (tweetScore < 0){
		imageHtml += "images/sad.png";
	} else {
		imageHtml += "images/neutral.png";
	}
	imageHtml += '" height="75" width="75" />';
	return imageHtml;
}

function drawMap(){
	var countryScores = twitterObj.getCountryScores();
	
	for(i = 0; i < countryScores.length; i++){
		var rankArr = new Array();
		rankArr.push(i + 1);
		countryScores[i].rank = rankArr;
	}
	
	$(function () {
		// Instanciate the map
		$('#map-container').highcharts('Map', {
			chart : {
				borderWidth : 1,
				height: 500,
				width: 800,
				marginLeft: 100,
			},

			title : {
				text : 'Top 5 Happiest Countries'
			},
			subtitle : {
				text : 'Top 5 happiest countries based on twitter data'
			},

			legend: {
				enabled: false
			},

			series : [{
				name: 'Country',
				mapData: Highcharts.maps['custom/world'],
				data: countryScores.slice(0,5),
				joinBy: ['iso-a2', 'code'],
				dataLabels: {
					enabled: true,
					color: 'white',
					formatter: function () {
						if (this.point.value) {
							return  this.point.rank + " " + this.point.name;
						}
					}
				},
				tooltip: {
					headerFormat: '',
					pointFormat: 'Country: {point.name} <br> Score: {point.value} '
				}
			}]
		});
	});
}

function drawCountryBarGraph(){
	var countryScores =  twitterObj.getCountryScores();
	var countriesData = new Array();
	var countryNames = twitterObj.getCountryNames();
	var topTenCountries = countryScores.slice(0,10);
	
	for(i = 0; i < topTenCountries.length; i++){
		var country = {};
		country.name = topTenCountries[i].name;
		country.data = topTenCountries[i].value;
		countriesData.push(country);
	}
	
	$('#country-bar-graph-container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Top 10 Happiest Countries'
        },
        subtitle: {
            text: 'Top 10 happiest countries based on twitter data'
        },
        xAxis: {
            categories: ['Countries']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Mood Score'
            }
        },
       tooltip: {
            valueSuffix: ' mood score'
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: countriesData
    });
}

function drawHashtagBarGraph(){
	var hashtagScores = twitterObj.getHashtags();

	$('#hashtag-bar-graph-container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Top 10 Frequently Used Hashtags'
        },
        subtitle: {
            text: 'Top 10 frequently used hashtags based on twitter data'
        },
        xAxis: {
            categories: ['Hashtags']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Frequency'
            }
        },
       tooltip: {
            valueSuffix: ' times'
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: hashtagScores.slice(0,10)
    });
}

function drawWordBarGraph() {
	var wordScores = twitterObj.getWords();

	$('#word-bar-graph-container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Top 10 Frequently Used Words'
        },
        subtitle: {
            text: 'Top 10 frequently used words based on twitter data'
        },
        xAxis: {
            categories: ['Word']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Frequency'
            }
        },
       tooltip: {
            valueSuffix: ' times'
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: wordScores.slice(0,10)
    });
}

//Source: http://roadha.us/2011/03/create-anchor-links-in-twitter-status-text-with-javascript/
// Convert URLs (w/ or w/o protocol), @mentions, and #hashtags into anchor links
function twitterLinks(text)
{
    var base_url = 'http://twitter.com/';   // identica: 'http://identi.ca/'
    // convert URLs into links
    text = text.replace(
        /(>|<a[^<>]+href=['"])?(https?:\/\/([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.,]*[^ !#?().,])?)/gi,
        function($0, $1, $2) {
            return ($1 ? $0 : '<a href="' + $2 + '" target="_blank">' + $2 + '</a>');
        });
    // convert protocol-less URLs into links
    text = text.replace(
        /(:\/\/|>)?\b(([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.]*[^ !#?().,])?)/gi,
        function($0, $1, $2) {
            return ($1 ? $0 : '<a href="http://' + $2 + '">' + $2 + '</a>');
        });
    // convert @mentions into follow links
    text = text.replace(
        /(:\/\/|>)?(@([_a-z0-9\-]+))/gi,
        function($0, $1, $2, $3) {
            return ($1 ? $0 : '<a href="' + base_url + $3
                + '" title="Follow ' + $3 + '" target="_blank">@' + $3
                + '</a>');
        });
    // convert #hashtags into tag search links
    text = text.replace(
        /(:\/\/[^ <]*|>)?(\#([_a-z0-9\-]+))/gi,
        function($0, $1, $2, $3) {
            return ($1 ? $0 : '<a href="#' + $3
                + '" class="twitter-hashtag" title="Search tag: ' + $3 + '">#' + $3
                + '</a>');
        });
    return text;
}