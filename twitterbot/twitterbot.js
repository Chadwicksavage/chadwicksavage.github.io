var Twit = require('twit');
var fs = require('fs');
var csvparse = require('csv-parse');
var rita = require('rita');
var inputText = '';
var sleep = require('sleep');

function tweet(){
var bot = new Twit({
	consumer_key: process.env.GRAMMAR_CONSUMER_KEY,
	consumer_secret: process.env.GRAMMAR_CONSUMER_SECRET,
	access_token: process.env.GRAMMAR_ACCESS_TOKEN,
	access_token_secret: process.env.GRAMMAR_ACCESS_TOKEN_SECRET,
	

});

var filePath = './quotes_all.csv';


var tweetData = fs.createReadStream(filePath)
	.pipe(csvparse({delimiter: ','}))
	.on('data', function(row){
		inputText = inputText + ' ' + cleanText(row[0]);
	})
	.on('end', function(){
		var markov = new rita.RiMarkov(4);
		markov.loadText(inputText);
		var sentences = markov.generateSentences(1) + ' #isitreal?';
		bot.post('statuses/update', {status: sentences}, function(err, data, response){
			if (err){
				console.log(err);
			} else{
				console.log('Status tweeted.');
			}
		});
	});

function hasNoStopWords(token){
	var stopwords = ['@', 'http', 'RT'];
	return stopwords.every(function(sw){
		return !token.includes(sw);
	});

}

function cleanText(text){
	return rita.RiTa.tokenize(text, ' ')
		.filter(hasNoStopWords)
		.join(' ')
		.trim();
}
}

tweet();

setInterval(function(){
	tweet();
}, 5000);


