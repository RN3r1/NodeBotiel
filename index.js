'use strict';
const BootBot = require('bootbot');
const config = require('config');
const emoji = require('node-emoji');

const bot = new BootBot({
    accessToken:config.get('accessToken'),
    verifyToken:config.get('verifyToken'),
    appSecret:config.get('appSecret')
});

const mongoose = require('mongoose');

mongoose.connect(config.get('mongoConnection'), {
    useMongoClient: true,
    promiseLibrary: global.Promise
}); //string connection, ip, port, db

const User = require('./mongoose_models/User'); //import the model

const express = require('express');

let port = process.env.PORT || 3000;

bot.setGreetingText('Hola! Soy Botiel, soy el ángel virtual de Lety Neri. Conmigo podrás obtener información acerca de ella, sus cursos, sus talleres y sus actividades.');

bot.setGetStartedButton('GET_STARTED');

bot.setPersistentMenu([
    {
        title: 'Menú Principal',
        type: 'postback',
        payload: 'MENU_INICIO'
    },
    {
        title: 'Todo Está Bien',
        type: 'nested',
        call_to_actions: [
            {
                title: 'Ir a la página web',
                type: 'web_url',
                url: 'https://www.todoestabien.com.mx'
            },
            {
                title: '¿Quién es Lety Neri?',
                type: 'postback',
                payload: 'MENU_LETY'
            },
            {
                title: '¿Qué/Quién es Botiel?',
                type: 'postback',
                payload: 'MENU_BOTIEL'
            }
        ]
    },
    {
        title: 'Ayuda',
        type: 'postback',
        payload: 'MENU_AYUDA'
    }
], false);

function sendStartupMenu(convo) {

    const menu_principal = [
        {
            "title": "Información",
            "image_url": "https://i.imgur.com/0cW9P4p.jpg",
            "subtitle": "¿Quiénes somos?",
            "default_action": {
                "type": "web_url",
                "url": "https://www.todoestabien.com.mx",
            },
            "buttons": [
                {
                    "type": "postback",
                    "payload": "MENU_PRINCIPAL_UBICACION",
                    "title": "Ubicación"
                }, {
                    "type": "postback",
                    "title": "¿Quién es Lety Neri?",
                    "payload": "MENU_PRINCIPAL_LETY"
                }, {
                    "type": "phone_number",
                    "title": "Llamar",
                    "payload": "+52 5555192018"
                }
            ]
        },
        {
            "title": "Suscripción a nuestro boletín",
            "image_url": "https://goo.gl/TTsv7b",
            "subtitle": "Registra tu correo para poder recibir rituales, mensajes angelicales, y más!",
            "default_action": {
                "type": "web_url",
                "url": "https://www.todoestabien.com.mx",
            },
            "buttons": [
                {
                    "type": "postback",
                    "title": "Registrar Mail",
                    "payload": "MENU_PRINCIPAL_SUSCRIPCION"
                }
            ]
        },
        {
            "title": "Eventos",
            "image_url": "https://goo.gl/RwyVcX",
            "subtitle": "Acompáñanos en nuestros eventos",
            "default_action": {
                "type": "web_url",
                "url": "https://www.todoestabien.com.mx",
            },
            "buttons": [
                {
                    "type": "postback",
                    "title": "Ver eventos",
                    "payload": "MENU_PRINCIPAL_EVENTOS"
                }
            ]
        }
    ];

    convo.getUserProfile().then((user) => {

        convo.say(emoji.emojify(`Hola ${user.first_name}. ¿En qué te puedo ayudar hoy? :blush:`));
        convo.sendGenericTemplate(menu_principal, {
            typing:true
        });
        convo.end();

    });

}

function sendMenuLety(convo){

    convo.say(emoji.emojify('Lety Neri es angelóloga :angel:, numeróloga :100:, terapeuta holística :hibiscus:,' +
        ' escritora :black_nib:, conferencista :microphone: y es la fundadora de Todo Está Bien'))
        .then(() => askIfContinue(convo));

}

function sendMenuBotiel(convo){

    convo.say(emoji.emojify('Soy Botiel, y soy el ángel virtual 🤖 de Lety Neri. Estoy diseñado por Blue Infinity Technologies para ayudarte '+
        'en tareas básicas, aunque aún no soy tan listo como un humano. Si requieres de'+
        'más ayuda, comunícate al espacio de Todo Está Bien (+52 55 55192018).'))
        .then(() => askIfContinue(convo));

}

function sendMenuAyuda(convo){

    convo.say(emoji.emojify('Intenta escribir un hola :blush:'));
    convo.end();

}

function askIfContinue(convo){

    const question = {
        text: emoji.emojify('¿Te puedo ayudar en algo más? :blush:'),
        quickReplies: ['No', 'Sí']
    };

    const answer = (payload, convo) => {

        // console.log(payload);

        if(payload.message !== undefined){

            const text = payload.message.text;

            if(text === 'Sí') {

                sendStartupMenu(convo);

            } else if(text === 'No') {

                convo.say(emoji.emojify('Adiós, bendiciones!:angel:'))
                    .then(convo.end());

            } else {

                convo.say('Lo siento, no entendí tu respuesta.')
                    .then(() => askIfContinue(convo));

            }

        } else {

            let postback = payload.postback.payload;

            if(postback !== undefined){

                if(postback === 'MENU_LETY'){

                    sendMenuLety(convo);

                } else if(postback === 'MENU_BOTIEL') {

                    sendMenuBotiel(convo);

                } else if(postback === 'MENU_AYUDA') {

                    sendMenuAyuda(convo);

                } else if(postback === 'MENU_INICIO'){

                    sendStartupMenu(convo);

                }else {

                    convo.say('Lo siento, no entendí tu respuesta.')
                        .then(() => askIfContinue(convo));

                }

            } else {

                convo.say('Lo siento, no entendí tu respuesta.')
                    .then(() => askIfContinue(convo));

            }

        }

    };

    convo.ask(question, answer);

}

function sendTimeInfoEvent1(convo){

    convo.say(emoji.emojify(':date: Fecha: 5 de Noviembre\n:clock10: Hora: 10 a 18 hrs\n:hospital: Lugar: Centro Médico Siglo XXI'))
        .then(convo.say(emoji.emojify(':round_pushpin: Ubicación del Lugar: https://goo.gl/maps/zs5hDkiu8H32')))
        .then(() => sendMoreInfoEvent1(convo));

}

function sendInscriptionInfoEvent1(convo){

    convo.say(emoji.emojify('En esta ocasión para apoyar a los que pasaron un mal momento por la tragedia del sismo,' +
        ' estaremos haciendo acopio de medicinas:syringe:, herramientas:wrench: y cobijas.'))
        .then(()=>sendMessage2(convo));

    const sendMessage2 = (convo) => {

        convo.say(emoji.emojify('Ahora, en el caso que tú decidas donar una cobija nueva, se te hará un descuento' +
            ' en tu aportación del 50%.'))
            .then(() => sendMessage3(convo));

    };

    const sendMessage3 = (convo) => {

        convo.say(emoji.emojify('Asimismo, si eres de los primeros 50 en hacer una donación en especie, Lety ' +
            'te dará un regalo muy especial para tu 2018, en agradecimiento a tu apoyo.:raised_hands:'))
            .then(() => sendMessage4(convo));

    };

    const sendMessage4 = (convo) => {

        convo.say(emoji.emojify('La aportación es de $222, recuerda aprovechar las promociones :wink:'))
            .then(() => sendMessage5(convo));

    };

    const sendMessage5 = (convo) => {

        convo.say(emoji.emojify('Los datos para depositar son:\nCuenta CLABE: 002073560107413492\n' +
            'No. de Cuenta: 56010741349\nA nombre de Carmen Nery Guzmán.\nSe llama cuenta transfer Banamex.'))
            .then(() => sendMessage6(convo));

    };

    const sendMessage6 = (convo) => {

        convo.say('En esta ocasión no habrá cuenta para depositar en OXXO.')
            .then(() => sendMessage7(convo))

    };

    const sendMessage7 = (convo) => {

        convo.say('Recuerda que después de hacer tu depósito debes de enviar por email el recibo.')
            .then(() => sendMessage8(convo))
    };

    const sendMessage8 = (convo) => {

        convo.say(emoji.emojify('¡Te esperamos allá! :innocent:'))
            .then(() => sendMoreInfoEvent1(convo));

    };

}

function sendInfoEvent1(convo){

    convo.say(emoji.emojify('Con tiempo para comer, veremos cómo Sanar con Ángeles :angel: y Rodrigo Mejía canalizará a los ' +
        'seres de luz de Kryon, Gaia y la Madre María :hibiscus:'))
        .then(() => sendMoreInfoEvent1(convo));

}

function sendMoreInfoEvent1(main_convo){

    const question = {
        text: `¿Te gustaría saber más información de este evento?`,
        quickReplies: ['Salir', 'Ver Información', 'Ver Hora y Lugar', 'Ver Inscripción']
    };

    const answer = (payload, convo) => {

        let postback = payload.message;

        if(postback !== undefined){

            const text = payload.message.text;

            if(text === 'Salir'){

                askIfContinue(convo);

            } else if(text === 'Ver Información'){

              sendInfoEvent1(convo);

            } else if(text === 'Ver Hora y Lugar'){

                sendTimeInfoEvent1(convo);

            } else if(text === 'Ver Inscripción'){

                sendInscriptionInfoEvent1(convo);

            }else{

                convo.say('Lo siento, no entendi tu respuesta.')
                    .then(() => sendMoreInfoEvent1(convo));

            }


        } else {

          convo.say('Lo siento, no entendi tu respuesta.')
              .then(() => sendMoreInfoEvent1(convo));

        }


    };

    main_convo.ask(question, answer);

}

bot.on('postback:MENU_INICIO', (payload, chat) => {

    chat.conversation((convo) => {

        sendStartupMenu(convo);

    });

});

bot.on('postback:MENU_LETY', (payload, chat) => {

    chat.conversation((convo) => {

        sendMenuLety(convo);

    });

});

bot.on('postback:MENU_BOTIEL', (payload, chat) => {

    chat.conversation((convo) => {

        sendMenuBotiel(convo);

    });

});

bot.on('postback:MENU_AYUDA', (payload, chat) => {


    chat.conversation((convo) => {

        sendMenuAyuda(convo);

    });

});

bot.on('postback:GET_STARTED', (payload, chat) => {

    chat.conversation((convo) => {

        convo.say('Soy Botiel, soy el ángel virtual de Lety Neri. Conmigo podrás obtener información acerca de ella' +
            ', sus cursos, sus talleres y sus actividades.');
        sendStartupMenu(convo);

    });

});

bot.on('postback:MENU_PRINCIPAL_UBICACION', (payload, chat) => {

    const sendLocation = (convo) => {

        let ubicacion = 'https://goo.gl/maps/uoLhKX9Q8w92';

        convo.say(emoji.emojify('Aquí podrás ver la ubicación de nuestro centro holístico :house_with_garden:'))
            .then(convo.say(ubicacion))
            .then(() => askIfContinue(convo));

    };

    chat.conversation((convo) => {
        sendLocation(convo);
    });

});

bot.on('postback:MENU_PRINCIPAL_LETY', (payload, chat) => {

    const sendLetyBio = (convo) => {

        convo.say(emoji.emojify('Lety Neri es angelóloga :angel:, numeróloga :100:, terapeuta holística :hibiscus:,' +
            ' escritora :black_nib:, conferencista :microphone: y es la fundadora de Todo Está Bien'))
            .then(() => askIfContinue(convo));

    };

    chat.conversation((convo) => {
        sendLetyBio(convo);
    });

});

bot.on('postback:MENU_PRINCIPAL_EVENTOS', (payload, chat) => {

    const eventos = [
        {
            "title": "Magna Reunión para Sanar con Ángeles",
            "image_url": "https://goo.gl/jEy3Tp",
            "subtitle": "La salud holística a tu alcance",
            "default_action": {
                "type": "web_url",
                "url": "https://www.todoestabien.com.mx",
            },
            "buttons": [
                {
                    "type": "postback",
                    "payload": "EVENTO1_INFO",
                    "title": "Información"
                }, {

                    "type": "postback",
                    "title": "Hora y Lugar",
                    "payload": "EVENTO1_HORA"

                }, {
                    "type": "postback",
                    "title": "Inscripción",
                    "payload": "EVENTO1_INSCRIPCION"
                }
            ]
        }
    ];

    chat.say('Se acercan estos eventos, ¡No faltes!')
        .then(chat.sendGenericTemplate(eventos, {

            typing:true

        }));

});

bot.on('postback:EVENTO1_HORA', (payload, chat) => {

    chat.conversation((convo)=>{

        sendTimeInfoEvent1(convo);

    });

});

bot.on('postback:EVENTO1_INSCRIPCION', (payload, chat) => {

    chat.conversation((convo) => {

        sendInscriptionInfoEvent1(convo);

    });

});

bot.on('postback:EVENTO1_INFO', (payload, chat) => {

    chat.conversation((convo) => {

        sendInfoEvent1(convo);

    });

});

bot.on('postback:MENU_PRINCIPAL_SUSCRIPCION', (payload, chat) => {

    const getUser = (convo) => {

        let currentUser;
        convo.getUserProfile().then((user) => {

            User.find({fb_id:user.id}, (err, mUser) => {

                if(mUser.length !== 0){

                    currentUser = mUser[0];
                    //Hay Usuario

                }else{

                    //NO hay usuario
                    currentUser = new User({
                        fb_id: user.id,
                        name: user.first_name + ' ' + user.last_name,
                        email: 'mail'

                    });

                }

                convo.set('user', currentUser);

            }).then(() => {

                if(currentUser.email === 'mail'){

                    // console.log('Nuevo Usuario');
                    newMail(convo);

                }else{

                    // console.log('Usuario existente');
                    askEditMail(convo);

                }

            });



        });

    };

    const askEditMail = (convo) => {

        let user = convo.get('user');

        // console.log(user);

        const question = {
            text: emoji.emojify('Ya tienes este mail registrado: '+user.email+', ¿te gustaría editarlo?'),
            quickReplies: ['No', 'Sí']
        };

        const answer = (payload, convo) => {

            if(payload.message !== undefined){

                const text = payload.message.text;

                if(text === 'Sí') {

                    askForEditedMail(convo);

                } else if(text === 'No') {

                    askIfContinue(convo);

                } else {

                    convo.say('Lo siento, no entendí tu respuesta.')
                        .then(() => askEditMail(convo));

                }

            } else {

                convo.say('Lo siento, no entendí tu respuesta.')
                    .then(() => askEditMail(convo));

            }

        };

        convo.ask(question, answer);

    };

    const askForEditedMail = (convo) => {

        convo.ask('Por favor escribe el email en el que te gustaría recibir la información', (payload, convo, data) => {

            if(payload.message !== undefined){

                const text = payload.message.text;

                if(typeof text === 'string'){

                    convo.set('editedEmail', text);
                    editMail(convo);

                }else{

                    convo.say('Lo siento, no entendí tu respuesta.').then(() => askForEditedMail(convo));

                }

            } else {

                convo.say('Lo siento, no entendí tu respuesta.').then(() => askForEditedMail(convo));

            }

        });

    };

    const editMail = (convo) => {

        let user = convo.get('user');
        let newMail = convo.get('editedEmail');

        const question = {
            text: emoji.emojify('¿Confirmar '+newMail+'?'),
            quickReplies: ['Cancelar', 'Editar', 'Sí']
        };

        const answer = (payload, convo) => {

            if(payload.message !== undefined){

                const text = payload.message.text;

                if(text === 'Sí') {

                    user.email = newMail;
                    convo.set('user', user);
                    saveEditedMail(convo);

                } else if(text === 'Editar') {

                    askForEditedMail(convo);

                } else if(text === 'Cancelar'){

                    askIfContinue(convo);

                } else {

                    convo.say('Lo siento, no entendí tu respuesta.')
                        .then(() => editMail(convo));

                }

            } else {

                convo.say('Lo siento, no entendí tu respuesta.')
                    .then(() => editMail(convo));

            }


        };



        convo.ask(question, answer);

    };

    const newMail = (convo) => {

        askForEditedMail(convo);

    };

    const saveEditedMail = (convo) => {

        let user = convo.get('user');

        user.save(function (err) {

            if(err){
                convo.say('Hubo un error al editar el email, por favor intenta más tarde.');
                return console.log('Algo se rompió '+err)
            }

            convo.say('Email guardado con éxito')
                .then(() => askIfContinue(convo))

        });

    };

    chat.conversation((convo) => {

        getUser(convo);

    })

});

bot.hear(['hola', 'ola', 'hey', 'hi'], (payload, chat) => {

    chat.conversation((convo) => {

        sendStartupMenu(convo);

    });

});

bot.hear(['adiós', 'adios', 'adiosito', 'bye', 'by'], (payload, chat) => {

    chat.say(emoji.emojify('Adiós, bendiciones!:angel:'));

});

bot.hear(['ayuda', 'help', 'aiuda', 'alluda'], (payload,chat) => {

    chat.say('¿Quieres charlar? Intenta con un hola. :)');

});

bot.start(port);