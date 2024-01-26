import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	const contactsExists = await knex.schema.hasTable("contacts");

	if (contactsExists)
		return;

	let builder = knex.schema
		.createTable("contacts", function (table) {
			table.increments("contact_id");
			table.string("title");
			table.string("forename");
			table.string("surname");
			table.primary(["contact_id"]);
		})

	const contactTodosExists = await knex.schema.hasTable("contact_todos")

	if (contactTodosExists)
		return builder;

	return builder.createTable("contact_todos", function (table) {
		table.increments("todo_id");
		table.integer("contact_id");
		table.string("description");
		table.primary(["todo_id"]);
		table.foreign("contact_id");
	});
}

export async function down(knex: Knex): Promise<void> {
	// do nothing
}

