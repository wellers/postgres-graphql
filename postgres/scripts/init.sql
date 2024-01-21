CREATE TABLE contacts
(
	contact_id SERIAL PRIMARY KEY,
	title VARCHAR(255),
	forename VARCHAR(255),
	surname VARCHAR(255)
);

CREATE TABLE contact_todos
(
	todo_id SERIAL PRIMARY KEY,
	contact_id SERIAL,
	description TEXT,
	CONSTRAINT contact_id FOREIGN KEY(contact_id) REFERENCES contacts(contact_id)
);

INSERT INTO contacts(title, forename, surname) 
SELECT 'Mr', 'Joe', 'Bloggs';

INSERT INTO contact_todos(contact_id, description)
SELECT currval(pg_get_serial_sequence('contacts', 'contact_id')), 'Get milk.';