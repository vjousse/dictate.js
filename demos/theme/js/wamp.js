var url;
/* On va utiliser du pur JS histoire de pas mélanger
    des notions de jQuery dans le tas. Je ne vais
    PAS utiliser les best practices sinon vous allez
    être noyés dans des détails */
/* Lancer le code une fois que la page est chargée */
$(document).ready(function(){	

    console.log("adding listeners");

    /* Connexion au serveur WAMP. J'utilise
    les valeurs par défaut du serveur de
    dev. On ouvre explicitement la connection
    à la fin du script. */
    var connection = new autobahn.Connection({
        url: 'ws://' + window.location.hostname + ':8080/ws',
        realm: 'realm1'
    });

    /* Lancer ce code une fois que la connexion
    est réussie. Notez que je ne gère pas
    les erreurs dans dans une APP JS, c'est
    un puits sans fond. */
    connection.onopen = function (session) {
        console.log("Connexion ok", session);

        var transcriptionDiv = $('#transcription-content');
        var translationDiv = $('#translation-content');
        var transcriptionHeight = transcriptionDiv.height();
        var translationHeight = translationDiv.height();

        session.subscribe('demo.final_result', function(value){
            transcriptionDiv.append( '<p>' + value + '</p>' );
            transcriptionHeight += transcriptionDiv.height();
            transcriptionDiv.scrollTop(transcriptionHeight);
        });


        session.subscribe('demo.translation_result', function(value){
            translationDiv.append( '<p>' + value + '</p>' );
            translationHeight += translationDiv.height();
            translationDiv.scrollTop(translationHeight);
        });
    }


    /* Ouverture de la connection une fois que tous les
    callbacks sont bien en place.*/
    connection.open();
});
