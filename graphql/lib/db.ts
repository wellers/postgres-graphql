import postgres from "postgres";

const {
	POSTGRES_HOST,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DB,
	POSTGRES_PORT
} = process.env;

const sql = postgres({
	host: POSTGRES_HOST,
	port: POSTGRES_PORT ? parseInt(POSTGRES_PORT) : 5432,
	database: POSTGRES_DB,
	password: POSTGRES_PASSWORD,
	username: POSTGRES_USER,		
});

export default sql;