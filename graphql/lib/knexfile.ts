import type { Knex } from "knex";

const {
	POSTGRES_HOST,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DB,
	POSTGRES_PORT
} = process.env;

const config: { [key: string]: Knex.Config } = {
	development: {
		client: "pg",
		connection: {
			host: POSTGRES_HOST,
			database: POSTGRES_DB,
			user: POSTGRES_USER,
			password: POSTGRES_PASSWORD,
			port: POSTGRES_PORT ? parseInt(POSTGRES_PORT as string) : 5432
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: "knex_migrations",
		}		
	}
};

module.exports = config;
