if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

var app = {};

var Word = {};

Word.findAll = function() {
    return m.request({method: "GET", url: jsonFile});
}

//define the view-model
app.vm = (function() {
    var vm = {}
    vm.init = function() {
        vm.words = m.prop([]);
        Word.findAll().then(vm.words).then(function(words) {
            vm.wordsArray = services.getWordArray(words.speaker_turns);
        });
        
        vm.currentTurn = null;
    }

    vm.jumpToTime = function(time) {
        var video = document.getElementById('main_video');
        video.player.pause();
        video.player.currentTime(time);
        video.player.play();
        document.getElementById('main').scrollIntoView();
    }

    vm.displayTime = function(time) {
        var wordIndex = services.search(vm.wordsArray, time, function(item) { return item.start; });
        if(wordIndex >= 0) {
            wordIndex++;
            var word = vm.wordsArray[wordIndex];

            if(vm.currentTurn != word.turn) {
                $('.turn').removeClass('panel-info');
                $('.turn').addClass('panel-default');
                $('.turn').show();
            }

            vm.currentTurn = word.turn;

            $('.turn').removeClass('old');
            $('.word').removeClass('current');

            //$('#turn-' + word.turn).prevAll().addClass('panel-default old');
            $('#turn-' + word.turn).prevAll().hide();
            $('#turn-' + word.turn).addClass('panel-info');
            $('#word-' + word.turn + '-' + word.sentence + '-' + word.index).prevAll().addClass('current');
            $('#sentence-' + word.turn + '-' + word.sentence).prevAll().addClass('old');
            $('#sentence-' + word.turn + '-' + word.sentence).removeClass('old');
            $('#sentence-' + word.turn + '-' + word.sentence).nextAll().removeClass('old');
        }
    };

    return vm;
}())


app.controller = function() {
    app.vm.init()

}

function updateNe(element, isInitialized) {
   if (isInitialized) return;

    $('.ne').tooltip();
}

app.view = function() {
    return [
        m("div", { class: "col-md-12", config: updateNe }, [
            app.vm.words().speaker_turns.map(function(turn, i) {
                return m("div", {class: "turn txt-left", id: "turn-" + i}, [
                    m("div", {class: "quote_sections turn-header"}, [
                        m('div', { class: "testimonial-icon-disc cont-large pull-right" },
                            m('i', { class: "fa fa-user testimonial-icon-large magnolia" })
                        ),
                        m("span", {class: "hue"}, turn.id),
                        m("span", " — " + turn.gender)    
                    ]),
                    m("div", {class: "bs-example"}, [
                        m('div', { class: "testimonial-icon-disc2 cont-large pull-right" },
                            m('i', { class: "fa fa-quote-right testimonial-icon-large magnolia" })
                        ),
                        turn.sentences.map(function(sentence, j) {
                            return m("p", {id: "sentence-" + i + "-" + j}, [
                                // First, parse EN words to merge them to a single word
                                sentence.map(function(word, k) {

                                    if(word.ne != null) {
                                        var classes = null;
                                        var ne = "";

                                        if(word.ne.startsWith('E-B-')) {
                                            classes="one";
                                        } else if (word.ne.startsWith('B-')) {
                                            classes="left";
                                        } else if (word.ne.startsWith('E-')) {
                                            classes="right";
                                        } else {
                                            classes="middle";
                                        }

                                        if(word.ne.length > 0) {
                                            var parts = word.ne.split('-');
                                            ne = parts[parts.length-1];
                                        }

                                        return [
                                            m("span", { 'data-start': word.start, 'data-toggle':'tooltip', class:'word label label-default ne ' + classes, 'data-original-title': ne, title: ne, id:'word-' + i + '-' + j + '-' + k, onclick:app.vm.jumpToTime.bind(app.vm, word.start)}, word.word + (classes.indexOf("middle") != -1 || classes.indexOf("left") != -1 ? " " : "")),
                                            classes.indexOf("right") != -1 || classes.indexOf("one") != -1 ? " " : ""
                                        ];
                                    } else {
                                        return m("span", { class:'word', 'data-start': word.start, id: 'word-' + i + '-' + j + '-' + k, onclick:app.vm.jumpToTime.bind(app.vm, word.start) }, word.word + " ");
                                    }
                                })
                            ])
                        })
                    ])
                ])
            })
        ])
    ];
};

//initialize the application
m.module(document.getElementById("main"), {controller: app.controller, view: app.view});


//init event listener
window.addEventListener("load", function () {
    var video = document.getElementById("main_video");

    video.addEventListener("timeupdate", function (e) {
        app.vm.displayTime(e.target.currentTime);
    }, true);
}, false);

