import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	const testExists = await knex.schema.hasTable("test");
	
	if (testExists)
		return;

	return knex.schema
		.createTable("test", function (table) {
			table.increments("test_id");
			table.string("test");
			table.integer("contact_id");
			table.primary(["contact_id"]);
		});
}

export async function down(knex: Knex): Promise<void> {
	// do nothing
}

