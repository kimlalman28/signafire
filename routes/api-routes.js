const express = require( 'express' );
const sqlite3 = require('sqlite3').verbose();
const request    = require('request');
let router    = express.Router();

 
// open database in memory
let db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});
 
// // close the database connection
// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Close the database connection.');
// }




router.get('/', (req, res) => {
	res.render('search-page.ejs');
});

router.get('/users/:user', (req, res) => {
	// 	Which returns the list of indices the user foo has access to through a
	// database call.
	// var user = req.params.user.toString();
	var user = 'foo';
	var firstName = req.query.firstname.toString();
	getUserIndicies(user).then( (data) => {
		console.log(data);
		getDocuments(data, firstName).then( (docs) => {
			var documents = JSON.parse(docs).hits.hits;
			console.log(documents);
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
			console.log(results);
			res.render('list-page.ejs', {results});

		})
	});

// The user foo should be able to search for all documents in Elasticsearch with
// which have the first_name fred
});


function getUserIndicies(user) {
	return new Promise((resolve, reject) => {
		let query = `SELECT * FROM useraccess WHERE user = '${user}'`;
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
	return new Promise( ( resolve, reject ) => {
		var url_string = `http://localhost:9200/foo_index/_search?pretty=true&q=first_name:${firstName}`;
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