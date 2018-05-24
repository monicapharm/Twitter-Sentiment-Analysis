'use strict';

//SENTIMENTS, EMOTIONS, and SAMPLE_TWEETS have already been "imported"

/* Your script goes here */
// The function to split up the tweet's text (a string) into 
// individual words (an array).
function splitText(text) {  
    var individualWds = text.split(/\W+/);
    var lowerCaseWds = individualWds.map(function(n) {
        return n.toLowerCase();
    });
    var res = lowerCaseWds.filter(function(n) {
        return n.length > 1;
    });
    return res;
}
// test:
var string = "Amazingly, I prefer a #rainy day to #sunshine."
var words = splitText(string);
console.log(words);


// The function that filters an array of words to only get 
// those words that contain a specific emotion.
function wordsWithEmotion(words, emotion) {
    var res = words.filter(function(n) {
        if (SENTIMENTS[n]) {
            return SENTIMENTS[n][emotion];
        } 
    });
    return res;
}
//test:
var wordsOne = wordsWithEmotion(words, 'positive');
console.log(wordsOne);


// The function that determines which words from an array have each emotion, 
// returning an object that contains that information.
function getEmotionWordsInfo(words) {
    var res = {};
    for (var i = 0; i < EMOTIONS.length; i++) {
        res[EMOTIONS[i]] = wordsWithEmotion(words, EMOTIONS[i]);
    }
    return res;
}
// test:
var emotionWordsInfo = getEmotionWordsInfo(words);
console.log(emotionWordsInfo);


// The function that gets an array of the "most common" words in an array, 
// ordered by their frequency.
function mostCommonWds(words) {
    var frequencies = {};
    for (var i = 0; i < words.length; i++) {
        if (frequencies[words[i]]) {
            frequencies[words[i]] = frequencies[words[i]] + 1;
        } else {
            frequencies[words[i]] = 1;
        }
    }
    var list_of_keys = Object.keys(frequencies);
    sorted_list =  list_of_keys.sort(function(a,b) {
        return frequencies[b] - frequencies[a];
    });
    return sorted_list;
}
//test:
var test_words = ['a','b','c','c','c','a','a','a'];
var sorted_list = mostCommonWds(test_words);
console.log(sorted_list);


// The function that takes in an array of tweet objects and 
// returns an array of all the words included in those tweets.
function getAllWords(tweets) {
    var allWords = [];
    for (var i = 0; i < tweets.length; i++) {
        var words = splitText(tweets[i]['text']);
        allWords = allWords.concat(words);
    }
    return allWords;
}
//test 
var tweets = SAMPLE_TWEETS;
var allWords = getAllWords(tweets);
console.log(allWords);


// The function takes in two parameters: an array of tweet objects and a single emotion 
// and return a new array of all the hashtags that are used in tweets that have at least 
// one word with that emotion.
function getEmotionHashtags(tweets, emotion) {
    var allHashtags = [];
    for (var i = 0; i < tweets.length; i++) {
        var words = splitText(tweets[i]['text']);
        if (wordsWithEmotion(words, emotion).length > 0) {
            for (var j = 0; j < tweets[i]['entities']['hashtags'].length; j++){
                var words = '#' + tweets[i]['entities']['hashtags'][j]['text'];
                allHashtags = allHashtags.concat(words);
            }
        }
    }
    return allHashtags;
}
//test:
var allHashtags = getEmotionHashtags(tweets, 'anticipation');
console.log(allHashtags);


// rounding decimals
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}


// The function that takes in an array of tweets 
// and returns an object containing the data of interest.
function analyzeTweets(tweets) {
    var results = [];
    var allWords = getAllWords(tweets);
    var numberOfWds = allWords.length;
    var emotionWordsInfo = getEmotionWordsInfo(allWords); 
    for (var i = 0; i < EMOTIONS.length; i++) {
        var result = {};
        var emotion = EMOTIONS[i];
        result['Emotion'] = emotion;
        result['% of Words'] = round(emotionWordsInfo[emotion].length/numberOfWds*100, 2);
        result['Example Words'] = mostCommonWds(emotionWordsInfo[emotion]).slice(0, 3);
        result['Hashtags'] = mostCommonWds(getEmotionHashtags(tweets, emotion)).slice(0, 3);
        results = results.concat(result);
    }
    var res = results.sort(function(a,b) {
        return b['% of Words'] - a['% of Words'];
    });
    return res;
}
//test:
var analyzedRes = analyzeTweets(tweets)
console.log(analyzedRes);


// The function will display the table. The function take as an argument the data structure 
// returned from your analyzeTweets() function. 
function showEmotionData(analyzedRes) {
    var tbody = d3.select('#emotionsTableContent');
    // var alltds = tbody.selectAll('td');
    // console.log(alltds);
    tbody.html('');
    //console.log(alltds);
    for (var i = 0; i < analyzedRes.length; i++) {
        var newRow = tbody.append('tr');
        var newtdOne = newRow.append('td');
        newtdOne.html(analyzedRes[i]['Emotion']);
        var newtdTwo = newRow.append('td');
        newtdTwo.html(analyzedRes[i]['% of Words'] + '%');

        var wordsList = analyzedRes[i]['Example Words'];
        var listToString = wordsList.reduce(function(total, current) {
            var newTotal = total.concat(current) + ', ';
            return newTotal;
        }, '');
        var newtdThree = newRow.append('td');
        newtdThree.html(listToString.slice(0,-2));

        var HashtagList = analyzedRes[i]['Hashtags'];
        console.log(HashtagList);
        var taglistToString = HashtagList.reduce(function(total, current) {
            var newTotal = total.concat(current) + ', ';
            return newTotal;
        }, '');     
        var newtdFour = newRow.append('td');
        newtdFour.html(taglistToString.slice(0,-2));
    }
}
//test:
showEmotionData(analyzedRes);


// The function takes in a Twitter username (as a string). This function should send an 
// AJAX request (an asynchronous HTTP request) for the user's timeline data, 
// analyze that data, and then display the results.
async function loadTweets(username) {
   var uri = 'https://faculty.washington.edu/joelross/proxy/twitter/timeline/?'+'screen_name='+username+'&count=100';
   tweets = await d3.json(uri);
   var result = analyzeTweets(tweets);
   showEmotionData(result);
}
//test:
//loadTweets('uw_ischool');


var button = d3.select('#searchButton');
button.on('click', function() {
    var searchBox = d3.select('#searchBox');
    var value = searchBox.property('value');
    loadTweets(value);
});



