Signafire
==========

Application uses
- NodeJS & Express
- Sqlite3
- Elasticsearch

SQLite Set-Up 
--------------
- databasename: users.db (it is also contained in this repo)
- table: **create table useraccess(user text, indices text, access integer);**
<br />user field stores a user
<br />indices field stores an index that is in elasticsearch
<br />access field stores 1 is user has access or 0 if the user does not have access to that index in elasticsearch
- demo entry: **insert into useraccess (user, indices, access) values ('foo', 'foo_index', 1);**

Elasticsearch Set-Up
--------------
Since I am new to elasticsearch, I followed along with the documentation that was given on the website.  
<br />I did not change the cluster or node names when I booted up elasticsearch.
<br />I used postman to make all the requests.
<br />I created a few indices such as 
- **PUT http://localhost:9200/foo_index**

I inserted some documents formatted in this way:
- **POST http://localhost:9200/foo_index/_doc**
	
	**{
		"first_name": "fred",
		"last_name": "smith",
		"location": "New York"
	}**

Running Application
--------------
Before running the application, in the root directory, at the command line, type
	
	npm install
to install any dependencies such as (express, sqlite3, request, etc...)
<br />Start the application by entering 

	node index.js

The application will be running on port 3000.
<br />Visit the application at **localhost:3000/**

<br />foo is assumed to be an authenticated user currently using the service.
<br />Enter a first name into the search box. 
<br />This will signal a database call to retrieve the indices foo can access. That information is then 
used to access indices in elasticsearch and will return documents in those indices with the requested first name

