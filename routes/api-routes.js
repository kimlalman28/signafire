const express = require( 'express' );
const sqlite3 = require('sqlite3').verbose();
const request = require('request');
let router    = express.Router();
let assumedAuthenticatedUser = 'foo';

 
// sqlite3 database connection
let db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});
 
//initial page with no results yet searched for and an assumed authenticated user
router.get('/', (req, res) => {
	res.render('list-page.ejs', {results:[], user:assumedAuthenticatedUser});
});

//api call that connects db and elasticsearch data
router.get('/users/:user', (req, res) => {
	//check if first name request is empty
	if(req.query.firstname === undefined){
		res.send({error: 'Must define a request body'});
	}
	// first name is provided for search
	else {
		var user = req.params.user.toString(); //get user
		var firstName = req.query.firstname.toString(); //get name to search
		//db request
		getUserIndicies(user).then( (data) => {
			//concatenate indices that were approved for user access for elasticsearch api url
			var indices = "";
			for(var i=0; i<data.length; i++) {
				if(i==data[i].length-1) {
					indices += data[i].indices;
				}
				else {
					indices += data[i].indices+",";
				}
			}
			//get documents with requested first name from elasticsearch
			getDocuments(indices, firstName).then( (docs) => {
				var documents = JSON.parse(docs).hits.hits;
				var results = [];
				for(var i=0; i<documents.length; i++) {
					//data object for results 
					var record = {
						id: "",
						full_name: "",
						location: "",
					}
					record.id = documents[i]._id;
					record.full_name = documents[i]._source.first_name +" "+documents[i]._source.last_name;
					record.location = documents[i]._source.location;
					results.push(record);
				}
				//send information to be displayed to frontend
				res.render('list-page.ejs', {results:results, user:assumedAuthenticatedUser});

			})
		});
	}
});


function getUserIndicies(user) {
	// 	Which returns the list of indices the user foo has access to through a database call
	//access = 1 means that the user has access to that index
	return new Promise((resolve, reject) => {
		let query = `SELECT indices FROM useraccess WHERE user = '${user}' AND access = 1`;
		db.all(query, [], (err, rows) => {
			if (err) {
				throw err;
				reject(err);
		  	}
		  	resolve(rows);
		});
	});
};

function getDocuments(indices, firstName) {
	// The user foo should be able to search for all documents in Elasticsearch with which have the first_name that was searched for
	// url searches through all indices the user has access to and searches for the requested first_name
	return new Promise( ( resolve, reject ) => {
		var url_string = `http://localhost:9200/${indices}/_search?pretty=true&size=50&q=first_name:${firstName}`;
	    const options = {
	            method: 'GET',
	            uri: url_string,
	            headers: {
	                'Content-Type' : 'application/json'
	            }
	        }
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            }
            else {
                reject(body)
            }
        });
	});
}

module.exports = router;