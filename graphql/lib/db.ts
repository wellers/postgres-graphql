import knex from "knex";

const {
	POSTGRES_HOST,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DB,
	POSTGRES_PORT
} = process.env;

const database = knex({
	client: "pg",
	connection: {
		host: POSTGRES_HOST,
		port: POSTGRES_PORT ? parseInt(POSTGRES_PORT) : 5432,
		database: POSTGRES_DB,
		password: POSTGRES_PASSWORD,
		user: POSTGRES_USER
	}
});

export default database;