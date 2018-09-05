const express = require( 'express' );
const sqlite3 = require('sqlite3').verbose();
const request = require('request');
let router    = express.Router();

 
// open database in memory
let db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});
 

router.get('/', (req, res) => {
	res.render('search-page.ejs');
});

router.get('/users/:user', (req, res) => {
	if(req.query.firstname === undefined){
		res.send({error: 'Must define a request body'});
	}
	else {
	// var user = req.params.user.toString();
		var user = 'foo';
		var firstName = req.query.firstname.toString();
		getUserIndicies(user).then( (data) => {
			var indices = "";
			for(var i=0; i<data.length; i++) {
				if(i==data[i].length-1) {
					indices += data[i].indices;
				}
				else {
					indices += data[i].indices+",";
				}
			}
			getDocuments(indices, firstName).then( (docs) => {
				var documents = JSON.parse(docs).hits.hits;
				var results = [];
				for(var i=0; i<documents.length; i++) {
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
				res.render('list-page.ejs', {results:results});

			})
		});
	}
});


function getUserIndicies(user) {
	// 	Which returns the list of indices the user foo has access to through a database call
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
	// The user foo should be able to search for all documents in Elasticsearch with which have the first_name fred
	// or submitted first name
	return new Promise( ( resolve, reject ) => {
		var url_string = `http://localhost:9200/${indices}/_search?pretty=true&q=first_name:${firstName}`;
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