// Initialize app
var myApp = new Framework7();
// The watch id references the current `watchAcceleration`
var watchID = null;
var changeID = 1;
// Categoria de Palabras
var categorie = null;
var timeElapse = null;
// Lista de Palabras
var palabras = [];
var inPlay = [];
var printInPlay = [];
var inAvailable = [];
var parsed = "";
// Audio player
var mediaSucess = null;
var mediaEnd = null;
var mediaStop = null;

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    
    console.log("Device is ready!");
    
    // set to either landscape
    screen.orientation.lock('landscape');
    // allow user rotate
    screen.orientation.unlock();
    
    // Habilitar pantalla siempre Encendida
    window.plugins.insomnia.keepAwake();
    
});


// CATEGORIAS - MENU
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'index') {
        //Indica Categoria
        categorie = page.name;
        console.log(categorie);
        //Reincia Pagina
        window.location.reload(true);
    }

    if (page.name === 'animales') {
        //Indica Categoria
        categorie = page.name;
        timeElapse = 60;
        console.log(categorie);
        //Confirmacion de Inicio
        showConfirm();
    }
    
    if (page.name === 'actualo') {
        //Indica Categoria
        categorie = page.name;
        timeElapse = 60;
        console.log(categorie);
        //Confirmacion de Inicio
        showConfirm();
    }
    
    if (page.name === 'deportes') {
        //Indica Categoria
        categorie = page.name;
        timeElapse = 60;
        console.log(categorie);
        //Confirmacion de Inicio
        showConfirm();
    }
    
    if (page.name === 'dibujalo') {
        //Indica Categoria
        categorie = page.name;
        timeElapse = 120;
        console.log(categorie);
        //Confirmacion de Inicio
        showConfirm();
    }
    
    if (page.name === 'instrucciones') {
        //Indica Categoria
        categorie = page.name;
        console.log(categorie);
        //Confirmacion de Inicio
        //showConfirm();
    }
})

//===============================================================================
// Show a custom confirmation dialog
function showConfirm() {
    navigator.notification.confirm(
        'Apto solo para mayores de +18', // message
         onConfirm, // callback to invoke with index of button pressed
        'Wushu!!', // title
        ['COMENZAR, SOY MAYOR DE EDAD','SALIR'] // buttonLabels
    );
}

function onConfirm(buttonIndex) {
    
    if (buttonIndex == 1){
        
        // Preloader
        myApp.showPreloader('Cargando Palabras...');
        setTimeout(function () {
            
            myApp.hidePreloader();
        
            //Carga Archivo de Palabras para la Categoria
            jQuery.ajax({
                url: "lib/"+categorie+".json",
                dataType: "json",
                success: function(data){
                    //Recupera todas las palabras
                    jQuery.each(data.dataset, function(i, item) {
                        console.log(item.word);
                        palabras.push(item.word);
                    });
                    
                    //Elige Palabra y la Muestra en Pantalla
                    selectWord();
                    //console.log(palabras);
                }
            }); 

            //Tiempo de la Sesion
            var count = timeElapse,
            timer = jQuery.timer(function() {
                count--;
                jQuery('#counter').html(count);
                if (count == 0) {
                    timer.stop();
                    timerComplete();
                    return;
                }
                if (count == 10) {
                    //Sonido Timer
                    playAudioEnd("file:///android_asset/www/sound/timer.mp3");
                    function playAudioEnd(src) {
                        if (mediaEnd == null) {
                            // Create Media object from src
                            mediaEnd = new Media(src, onSuccess, onError);
                        } // else play current audio
                        // Play audio
                        mediaEnd.play();
                    }
                    // onSuccess Callback
                    function onSuccess() {
                        console.log("playAudio():Audio End");
                    }
                    // onError Callback 
                    function onError(error) {
                        alert('code: '    + error.code    + '\n' + 
                              'messageEnd: ' + error.message + '\n');
                    }
                    return;
                }
            },
            timerComplete = function() {
                //sensor de giro - finaliza
                stopWatch();
                //Sonido Stop
                playAudioStop("file:///android_asset/www/sound/stop.mp3");
                function playAudioStop(src) {
                    if (mediaStop == null) {
                        // Create Media object from src
                        mediaStop = new Media(src, onSuccess, onError);
                    } // else play current audio
                    // Play audio
                    mediaStop.play();
                }
                // onSuccess Callback
                function onSuccess() {
                    console.log("playAudio():Audio Stop");
                }
                // onError Callback 
                function onError(error) {
                    alert('code: '    + error.code    + '\n' + 
                          'messageEnd: ' + error.message + '\n');
                }
                myApp.alert('Se agoto el tiempo', 'Wushu!!');
                
                //imprime palabras del juego
                for (i = 0; i< printInPlay.length; i++) {
                    var myobj=  printInPlay[i];
                    parsed += myobj+ "-";      
                }
                var element = document.getElementById('palabraWushu');
                element.innerHTML = '<h1 style="font-size: 25px; color: #fff; line-height: 1">' + parsed + '</h1>'; 
                
            });
            timer.set({ time : 1000, autostart : true });
            
            //Si
            //sensor de giro - inicia
            startWatch();
                
        }, 5000);
                
    } else {
        
        if (buttonIndex == 2){
            //No
            //Retorna a la Pagina Principal
            mainView.router.loadPage({url:'index.html', ignoreCache:true, reload:true });
        }
        
    }
    
}
//===============================================================================

//===============================================================================
// Start watching the acceleration (Sensor de Giro)
function startWatch() {
                   
    // Update acceleration every 0.5 seconds
    var options = { frequency: 500 };
    watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
    
}

// Stop watching the acceleration
function stopWatch() {
    if (watchID) {
        navigator.accelerometer.clearWatch(watchID);
        watchID = null;
        categorie = null;
        palabras = [];
        printInPlay = inPlay;
        inPlay = [];
        inAvailable = [];
    }
}

// onSuccess: Get a snapshot of the current acceleration
function onSuccess(acceleration) {
    /*var element = document.getElementById('accelerometer');
    element.innerHTML = 'Acceleration X: ' + acceleration.x         + '<br />' +
                        'Acceleration Y: ' + acceleration.y         + '<br />' +
                        'Acceleration Z: ' + acceleration.z         + '<br />' +
                        'Timestamp: '      + acceleration.timestamp + '<br />';*/
    
    //Giro Abajo ->  (acceleration.y >= -1.0 || acceleration.y <= 1.0) && (acceleration.z <= -5)
    //Giro Arriba -> (acceleration.y >= -1.0 || acceleration.y <= 1.0) && (acceleration.z <= 5)
    if ((acceleration.y >= -1.0 || acceleration.y <= 1.0) && (acceleration.z >= 5)){
        if (changeID == 1){
            //Elige Palabra y la Muestra en Pantalla
            selectWord();
        }
    }
    
    //Centrado
    if ((acceleration.y >= -1.0 || acceleration.y <= 1.0) && (acceleration.x >= 7)){
        //Flag - Cambio de Palabra
        changeID = 1;
        //myApp.alert(changeID);
    }

} 

// onError: Failed to get the acceleration
function onError() {
    myApp.alert('onError!');
}

// selectWord: Elige Palabra de la lista
function selectWord() {
    
    //Filtra Palabras Iguales entre las dos listas
    inAvailable = palabras.filter(function(e) {
        return inPlay.indexOf(e) == -1
    });
    //console.log(inAvailable);

    //Escoge palabra Aleatoria
    var rand = inAvailable[Math.floor(Math.random() * inAvailable.length)];
    console.log(rand);

    //Agrega palabra randon al array de juego
    inPlay.push(rand);
    
    //*****************************************
    //Sonido success
    playAudio("file:///android_asset/www/sound/success.mp3");
    // Play audio
    function playAudio(src) {
        if (mediaSucess == null) {
            // Create Media object from src
            mediaSucess = new Media(src, onSuccess, onError);
        } // else play current audio
        // Play audio
        mediaSucess.play();
    }
    // onSuccess Callback
    function onSuccess() {
        console.log("playAudio():Audio Success");
    }
    // onError Callback 
    function onError(error) {
        alert('code: '    + error.code    + '\n' + 
              'message: ' + error.message + '\n');
    }
    //*****************************************
    
    //Flag - Cambio de Palabra
    changeID = 0;

    var element = document.getElementById('palabraWushu');
    element.innerHTML = '<h1 style="font-size: 65px; color: #fff">' + rand + '</h1>';
    
}
//===============================================================================

//===============================================================================
// Cerrar APP
var back = document.getElementById("exit");
back.addEventListener("click", function(){
    
    //myApp.alert("click1 triggered");
    navigator.app.exitApp();
    
}, false);
//===============================================================================
