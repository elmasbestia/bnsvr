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
var usr = {};	// Info del Usuario
var guardarSiempre = false;

const app = require('express')();
const logger = require('morgan');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');
const cors = require('cors');

const Bienes = require("./bnPrb.json");

function guarda() { } // Guarda los datos en el archivo

function autentica() { // autenticación del Usuario
	return true;
}

function bsqQue(query) { for (let x in query) { return x } }

function bsq(que,valor) {
	console.log(que," = ", valor);
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
    if (descendente) { const menor = -1, mayor = 1}
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
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());

app.use((req, res, next) => {
	// Guardar Datos
	
	if (guardarSiempre ) guarda();
	next();
});

app.use((req, res, next) => {
	// Autenticación
	
	if (autentica()) next();
});

app.param('id', (req, res, next) => {
    let bien = Bienes.filter(x => x.BN_IDEN === req.params.id);

	if (bien.length === 0) { res.status(404) }

    req.bien = bien;
    next();
});
									// R U T A S
app.get('/oficina/:idOfc', (req, res) => {
	  let bienes = bsqOfc(req.params.idOfc);
	  res.send(bienes);
});

app.get('/oficinas', (req, res) => { res.send(lista("BN_OFIC"))});

app.get('/marcas', (req, res) => { res.send(lista("Marca")) });

app.get('/cuentas', (req,res) => { res.send(lista("Cuenta"))});

app.get('/bienes', (req, res) => {
	let que = bsqQue(req.query);
    if (que) res.send(bsq (que, req.query[que]));
	else res.send(Bienes);
});

app.get('/bien/:id', (req, res) => { res.send(req.bien) });

app.post('/bien', (req, res) => {
	console.log("Agrega: ", req.body);
	console.log("Header: ", res)

	let id = Bienes.length;
	Bienes.push(req.body);
	res.status(201).send({id: id});
});

app.put('/bien/:id', (req, res) => {
	Object.assign(req.bien,req.body);
	res.status(200).send(req.bien);
});

app.delete('/bien/:id', (req, res) => {
	req.bien.BN_OFIC = "9999";
	req.bien.BN_estado = "Retirado";

	res.status(204).send();
});

app.use(errorhandler());
  
console.log("Bienes Nacionales en el puerto 3000");
app.listen(3000);

/*
 * H o o k s
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
