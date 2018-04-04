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
var usr = {}	// Info del Usuario

const app = require('express')()
const logger = require('morgan')
const errorhandler = require('errorhandler')
const bodyParser = require('body-parser')

const Bienes = require("../bnPrb.json")

function autentica() { // autenticación del Usuario
	return true
}

function bsqOfc(idOfc) {
	// retorna los Bienes de la oficina identificada con @idOfc
	// Si idOfc es una cadena, devuelve todas las oficinas con esa cadena en el nombnre
	if (parseInt(idOfc) === 0) return Oficinas.filter(x => x.DESC.indexOf(idOfc)+1);
	
	return Bienes.filter(x => x.BN_OFIC === idOfc);
}

function strCompara(que,descendente){
    var menor = -1, mayor = 1;
    if (descendente) return (a,b) => (a[que] < b[que]) ? mayor : (a[que] > b[que]) ? menor : 0
    else return (a,b) => (a[que] < b[que]) ? menor : (a[que] > b[que]) ? mayor : 0
}

// MIDLEWARE
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(errorhandler())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});

app.use((req, res, next) => { 
	// Autenticación
	
	if (autentica()) next();
})

app.param('id', (req, res, next) => { 
	// OPTIONALLY: you can use middleware to fetch account object

    let bien = Bienes.filter(x => x.BN_IDEN = req.params.id)

	if (bien.length === 0) {
		console.log ("ERROR!")
		next(new error(404))
	}
    req.bien = bien[0];
    next()
  })

// HTTPS
  app.get('/oficina/:idOfc', (req, res) => {
	  let bienes = bsqOfc(req.params.idOfc)
	  res.send(bienes)
  })

app.get('/oficinas', (req, res) => {
	let lista = []
	let ofc = "";
	let xOfc = -1;
  
	Bienes.sort(strCompara("BN_OFIC")).forEach(x => {
		if (ofc != x.BN_OFIC) {
			ofc = x.BN_OFIC
			lista.push({ BN_OFIC: ofc, cant: 0 })
			xOfc++
		}
		lista[xOfc].cant++
	})
	console.log("Son: ", lista.length, "oficinas")
	res.send(lista)
})

  app.get('/bien/:id', (req, res) => {
       res.send(req.bien)
  })

  app.post('/bien', (req, res) => {
    let datos = req.body;
	console.log("Agrega: ", datos);
	let error = false;
	
      if (error) return next(error)
      res.send(results)
   })

  app.put('/bien/:id', (req, res) => {
	  let datos = req.body;
	  
	console.log("Modifica Bien", req.bien)
    let error = false;     
    
         if (error) return next(error)
         res.send(results)
       })

  app.delete('/bien/:id', (req, res) => {
	console.log ("Borrar bien: ", req.bien)
    
    let error = false;
    
      if (error) return next(error)
      res.send(res)
   })

	app.use(errorhandler())
  
  console.log("Bienes Nacionales en el puerto 3000")
  app.listen(3000)
