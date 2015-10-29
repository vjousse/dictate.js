'use strict';

var services = {};


services.getWordArray = function(speaker_turns) {
    var words = [];

    if (typeof speaker_turns != 'undefined') {
        var nb_turns = speaker_turns.length;

        for (var i=0; i < nb_turns; ++i) {
            var turn = speaker_turns[i];

            var nb_sentences = turn.sentences.length;

            for(var j = 0; j < nb_sentences; j++) {
                var sentence = turn.sentences[j];

                var nb_words = sentence.length;

                for(var k = 0; k < nb_words; k++) {
                    var word = sentence[k];
                    word.turn = i;
                    word.sentence = j;
                    word.index = k;
                    words.push(word);
                }

            }

        }
    }

    return words;
};

services.search = function binarySearch(items, value, accessFunction){

    accessFunction = typeof accessFunction !== 'undefined' ? accessFunction : function(b) { return b; };
    var startIndex  = 0;
    var stopIndex   = items.length - 1;
    var middle      = Math.floor((stopIndex + startIndex)/2);

    var found = function(index, collection, toFind) {
        if (index <= 0 || index >= collection.length -1) {
            return true;
        }

        var value = accessFunction(collection[index]);

        //if 2 following items share the same start: avoids an infinity loop.
        if(toFind==accessFunction(collection[index+1])){
            return value==toFind;
        }
        else{
            if(toFind >= value && toFind < accessFunction(collection[index+1])) {
                return true;
            } else {
                return false;
            }
        }

    }

    //No items or the value is out of range, return not found
    //We return different values to determine if we are searching before or after the items (ie if we click outside of the video, we want to know if it's before or after).
    if(items.length == 0) {
        return -1;
    }
    else if(value < accessFunction(items[0])){
        return -2;
    }
    else if(value > accessFunction(items[items.length - 1])){
        return -3;
    }

    while(!found(middle, items, value) && startIndex < stopIndex){
        //adjusts search area
        if (value < accessFunction(items[middle])){
            stopIndex = middle - 1;
        } else if (value > accessFunction(items[middle])){
            startIndex = middle + 1;
        } else if (value != accessFunction(items[middle])) {
            //value is not < or > and is not equal: we are comparing apples and bananas
            return -1;
        }

        //recalculates middle
        middle = Math.floor((stopIndex + startIndex)/2);
    }

    return middle;
}
