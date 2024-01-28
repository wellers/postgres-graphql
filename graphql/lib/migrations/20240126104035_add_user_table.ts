import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	const userExists = await knex.schema.hasTable("user");
	
	if (userExists)
		return;

	return knex.schema
		.createTable("users", function (table) {
			table.increments("user_id");
			table.string("username");
			table.string("email");
			table.string("password");
			table.primary(["user_id"]);
		});
}

export async function down(knex: Knex): Promise<void> {
	// do nothing
}

