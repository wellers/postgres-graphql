CREATE TABLE contacts
(
	contact_key SERIAL PRIMARY KEY,
	title VARCHAR(255),
	forename VARCHAR(255),
	surname VARCHAR(255)
);

INSERT INTO contacts(title, forename, surname)
SELECT 'Mr', 'Joe', 'Bloggs';