CREATE TABLE contacts
(
	contact_key SERIAL PRIMARY KEY,
	title VARCHAR(255),
	forename VARCHAR(255),
	surname VARCHAR(255)
);

CREATE TABLE contact_todos
(
	todo_key SERIAL PRIMARY KEY,
	contact_fkey SERIAL,
	todo TEXT,
	CONSTRAINT contact_fkey FOREIGN KEY(contact_fkey) REFERENCES contacts(contact_key)
);

INSERT INTO contacts(title, forename, surname) 
SELECT 'Mr', 'Joe', 'Bloggs';

INSERT INTO contact_todos(contact_fkey, todo)
SELECT currval(pg_get_serial_sequence('contacts', 'contact_key')), 'Get milk.';