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

create table branch_schema(
	branch_id INT NOT NULL AUTO_INCREMENT,
	branch_name VARCHAR(100) NOT NULL,
	PRIMARY KEY ( branch_id )
);

create table tag_schema(
	tag_id INT NOT NULL AUTO_INCREMENT,
	tag_name VARCHAR(100) NOT NULL,
	PRIMARY KEY ( tag_id )
);

create table branch_project_schema(
	branch_project_id INT NOT NULL AUTO_INCREMENT,
	branch_id INT NOT NULL,
	project_id INT NOT NULL,
	PRIMARY KEY ( branch_project_id ),
	FOREIGN KEY (branch_id) REFERENCES branch_schema(branch_id),
	FOREIGN KEY (project_id) REFERENCES project_schema(project_id)
);

create table tag_project_schema(
	tag_project_id INT NOT NULL AUTO_INCREMENT,
	project_id INT NOT NULL,
	tag_id INT NOT NULL,
	PRIMARY KEY ( tag_project_id ),
	FOREIGN KEY (tag_id) REFERENCES tag_schema(tag_id),
	FOREIGN KEY (project_id) REFERENCES project_schema(project_id)
);

SELECT a.title, a.description
FROM project_schema a, branch_project_schema b
ON a.project_id = b.project_id;

SELECT a.title, a.description
FROM project_schema a LEFT JOIN branch_project_schema b
ON a.project_id = b.project_id;

SELECT project_schema.project_id,title,description
        FROM project_schema,branch_project_schema,branch_schema
        WHERE branch_schema.branch_id = 1 AND branch_schema.branch_id = branch_project_schema.branch_id AND project_schema.project_id = branch_project_schema.project_id;
		
INSERT INTO branch_project_schema VALUES
        (1, 1, 6);

INSERT INTO tag_project_schema VALUES
        (1, 1, 1);
		
INSERT INTO member_schema VALUES
        (30, 16, 19, 0);

INSERT INTO branch_schema VALUES
        (1, 'eee');

INSERT INTO tag_schema VALUES
        (1, 'wsn');
		
SELECT * FROM user_schema UNION SELECT * FROM project_schema;




SELECT project_schema.project_id,title,description
        FROM project_schema,branch_project_schema,branch_schema,tag_schema
        WHERE branch_schema.branch_id = 1 AND tag_schema.tag_id = 2 AND branch_schema.branch_id = branch_project_schema.branch_id AND tag_schema.tag_id = tag_project_schema.tag_id AND project_schema.project_id = branch_project_schema.project_id;
eyJhbGciOiJIUzI1NiJ9.dW1hbmd0eQ.oYKKxaoyQwWIdHHPfdd5AWH9Kuuo_pIGe5JzUzxUKBY
eyJhbGciOiJIUzI1NiJ9.dW1hbmd0eQ.oYKKxaoyQwWIdHHPfdd5AWH9Kuuo_pIGe5JzUzxUKBY


SELECT project_schema.project_id,title,description
        FROM project_schema,member_schema
        WHERE member_schema.admin_status = 1 AND member_schema.user_id=40 AND project_schema.project_id = member_schema.project_id;

SELECT title, description, username
        FROM project_schema, member_schema, user_schema
        WHERE user_schema.user_id = member_schema.user_id AND project_schema.project_id = member_schema.project_id;

TODO - 
	Implement proper protection authentication by extracting username from token passed by the user.
	App should not crash when invalid request come at routes. Do this by chaining middlewares.
	