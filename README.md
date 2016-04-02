## network-programming-project
#Instructions 
-Install nodejs-leagcy, mongodb-clients, mongodb server and Postman (google chrome app) for api testing.
-Clone the project. 
```
	npm install
	npm start
``` 
-Test api at http://localhost:3000 
-TODO : make logical names for routes.


create table user_schema(
	user_id  INT NOT NULL AUTO_INCREMENT,
	username  VARCHAR(100) NOT NULL,
	firstname  VARCHAR(100),
	lastname  VARCHAR(100) NOT NULL,
	password  VARCHAR(100) NOT NULL,
	bitsid  VARCHAR(100) NOT NULL,
	email  VARCHAR(100) NOT NULL,
	branch  VARCHAR(100) NOT NULL,
	conf_key  INT,
	PRIMARY KEY ( user_id ),
	UNIQUE (username),
	UNIQUE (bitsid)
);

create table project_schema(
	project_id  INT NOT NULL AUTO_INCREMENT,
	title VARCHAR(100) NOT NULL,
	description  VARCHAR(100) NOT NULL,
	PRIMARY KEY ( project_id ),
	UNIQUE ( title )
);

create table member_schema(
	member_id INT NOT NULL AUTO_INCREMENT,
	project_id INT NOT NULL,
	user_id INT NOT NULL,
	PRIMARY KEY ( member_id ),
	FOREIGN KEY (project_id) REFERENCES project_schema(project_id),
	FOREIGN KEY (user_id) REFERENCES user_schema(user_id)
);

create table request_schema(
	request_id INT NOT NULL AUTO_INCREMENT,
	project_id INT NOT NULL,
	user_id INT NOT NULL,
	sender_status INT,
	PRIMARY KEY ( request_id ),
	FOREIGN KEY (project_id) REFERENCES project_schema(project_id),
	FOREIGN KEY (user_id) REFERENCES user_schema(user_id)
);

SELECT * FROM user_schema UNION SELECT * FROM project_schema;