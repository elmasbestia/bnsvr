// Servidor para Bienes Nacionales
// Rafa Gómez https://rafagomez.neocities.org

/*
Permite acceder los datos del archivo Bienes.json
Estos datos provienen de la base de datos BienesBD.mdb
y eventualmente serán pasados a una Base de Datos definitiva en postgresql

Maneja los siguientes enlaces:
GET    /oficina/:idOfc 	Lee los datos de una oficina de código idOfc
GET    /bien/:id		Lee los datos de un bien de codigo id
POST   /bien			Crea un bien		
PUT    /bien/:id		Modifica los datos del Bien de código id
DELETE /bien/:id		ELimina el bien de codigo id

Pruebas:
curl -H "Content-Type: application/json" -X GET "http://localhost:3000/bien/7"
curl -H "Content-Type: application/json" -X GET "http://localhost:3000/oficina/1"

*/

"use strict";

var Connect = require('connect')
  , CORS = require('connect-cors')
  , options = {}
  , server
  ;
 
server = Connect.createServer(
    // uses reasonable defaults when no options are given
    CORS(options)
  , function(req, res) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello World');
    }
);

// the `options` object will be popullated with empty arrays
// and is live-editable (great for testing and dynamic APIs)
console.log(options);

const app = require('express')()
const logger = require('morgan')
const errorhandler = require('errorhandler')
const bodyParser = require('body-parser')

const Bienes = require("./bnPrb.json")

function autentica() { // autenticación del Usuario
	return true
}

function bsqQue(query) {
	for (let x in query) { return x }
}

function bsq(que,valor) {
	console.log(que," = ", valor)
	if(que === "Descripcion") return Bienes.filter(x => x[que].indexOf(valor) > -1);
	return Bienes.filter(x => x[que] === valor);
}

function bsqOfc(idOfc) {
	// retorna los Bienes de la oficina identificada con @idOfc
	// Si idOfc es una cadena, devuelve todas las oficinas con esa cadena en el nombnre
	if (parseInt(idOfc) === 0) return Oficinas.filter(x => x.DESC.indexOf(idOfc)+1);
	
	return Bienes.filter(x => x.BN_OFIC === idOfc);
}

function strCompara(que,descendente){
	var menor = 1, mayor = -1;
    if (descendente) { const menor = -1, mayor = 1};
    var define = x => x === undefined ? "" : x;
	return (a,b) => (define(a[que]) < define(b[que])) ? mayor : (define(a[que]) > define(b[que])) ? menor : 0
}

function lista(que) {
	let lista = []
	let valor, cant = 0;
  
	Bienes.sort(strCompara(que)).forEach(x => {
		if (valor != x[que]) {
			lista.push({valor: valor, cant: cant});
			valor = x[que];
			cant = 0;
		}
		cant++;
	})
	lista.push({valor: valor, cant: cant});
	if(lista[0].cant === 0) lista.shift()
	else lista[0].valor = "(Indefinido)";

	return lista;
}
										// MIDLEWARE
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(errorhandler())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, cache-control");
  res.header("Access-Control-Allow-Methods", "POST", "PUT, DELETE");

  next();
});

app.use((req, res, next) => { 
	// Autenticación
	
	if (autentica()) next();
})

app.param('id', (req, res, next) => { 
    let bien = Bienes.filter(x => x.BN_IDEN === req.params.id)

	if (bien.length === 0) { res.status(404) }

    req.bien = bien;
    next()
})
									// R U T A S
app.get('/oficina/:idOfc', (req, res) => {
	  let bienes = bsqOfc(req.params.idOfc)
	  res.send(bienes)
  })

app.get('/oficinas', (req, res) => {
	res.send(lista("BN_OFIC"))
})

app.get('/marcas', (req, res) => {
	res.send(lista("Marca"))
})

app.get('/bienes', (req, res) => {
	let que = bsqQue(req.query);
    if (que) res.send(bsq (que, req.query[que]))
	else res.send(Bienes);
})

  app.get('/bien/:id', (req, res) => {
       res.send(req.bien)
  })

	app.post('/bien', (req, res) => {
		let datos = req.body;
		console.log("Agrega: ", datos);

		let nuevo = req.body
		let id = store.accounts.length
		Bienes.push(nuevo)
		res.status(201).send({id: id})
   })

	app.put('/bien/:id', (req, res) => {
		Object.assign(req.bien,req.body)
		res.status(200).send(req.bien)
    })

	app.delete('/bien/:id', (req, res) => {
		req.bien.BN_OFIC = "9999";
		req.bien.BN_estado = "Retirado";

		guarda();

		res.status(204).send()
	})

	app.use(errorhandler())
  
	console.log("Bienes Nacionales en el puerto 3000")
	app.listen(3000)


server.listen(9000);

/*
 * H o o k s
	app.get('/accounts', (req, res) => {
		res.status(200).send(store.accounts)
	})
5.4 Método POST
	app.post('/accounts', (req, res) => {
		let newAccount = req.body
		let id = store.accounts.length
		store.accounts.push(newAccount)
		res.status(201).send({id: id})
	})
5.5 Método PUT
	app.put('/accounts/:id', (req, res) => {
	})
5.6 Método DELETE

bookSchema.pre('save', function(next) {
    //prepare for saving
    //upload PDF 
    return next()
})
On the other hand, before removing, we need to make sure there are no pending purchase orders for this book:

bookSchema.pre('remove', function(next) {
    //prepare for removing
    return next(e)
})
*/


var options = {
        origins: []                       // implicit same as ['*'], and null
      , methods: ['HEAD', 'GET', 'POST']  // OPTIONS is always allowed
      , headers: [                        // both `Exposed` and `Allowed` headers
            'X-Requested-With'
          , 'X-HTTP-Method-Override'
          , 'Content-Type'
          , 'Accept'
        ]
      , credentials: false                // don't allow Credentials
      , resources: [
          {
              pattern: '/'                // a string prefix or RegExp
          //, origins
          //, methods
          //, headers
          //, credentials
          }
        ]
    };
