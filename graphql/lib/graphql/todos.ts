import { gql } from "apollo-server-express";
import { mapKeyResolver } from "./mapKeyResolver";
import * as Types from "knex/types/tables.js";
import { Knex } from "knex";

export const typeDefs = gql`
	extend type Query {
		todos: todos_query
	}

	extend type Mutation {
		todos: todos_mutation
	}

	type todos_query

	type todos_mutation
	
	type todo {
		id: ID!,
		contact_id: ID!,
		description: String!
	}

	input todos_find_filter {
		contact_id: Int
	}

	type todos_find_result {
		success: Boolean!,
		message: String!,
		docs: [todo!]!
	}    

	extend type todos_query {
		todos_find(filter: todos_find_filter): todos_find_result
	}

	input todos_insert_input {
		todos: [todos_todo_input!]!
	}

	input todos_todo_input {
		contact_id: ID!,
		description: String!
	}

	input todos_remove_input {
		id: [ID!]
	}

	type todos_insert_result {
		success: Boolean!,
		message: String!
	}

	type todos_remove_result {
		success: Boolean!,
		message: String!
	}

	extend type todos_mutation {
		todos_insert(input: todos_insert_input!): todos_insert_result,
		todos_remove(input: todos_remove_input): todos_remove_result
	}
`;

type TodosFindFilter = {
	contact_id: number;
}

type TodosFindResult = {
	success: boolean;
	message: string;
	docs: Types.Todo[];
}

type TodoInsertInput = Omit<Types.Todo, "todo_id">;

type TodosInsertInput = {
	todos: TodoInsertInput[];
};

type TodosRemoveInput = {
	id: number[];
}

export const resolvers = {
	Query: {
		todos: () => { return {}; }
	},
	Mutation: {
		todos: () => { return {}; }
	},
	todos_query: {
		async todos_find(parent, { filter }: { filter: TodosFindFilter}, { knex }: { knex: Knex }, info): Promise<TodosFindResult> {
			const { contact_id } = filter;

			let query = knex("contact_todos");
			
			query = contact_id
				? query.where("contact_id", contact_id)
				: query;

			const docs = await query;

			return {
				success: true,
				message: 'Records matching filter.',
				docs
			};
		}
	},
	todos_mutation: {
		async todos_insert(parent, { input }: { input: TodosInsertInput }, { knex }: { knex: Knex }, info): Promise<ApiResponse> {
			const inserted = await knex<Types.Todo>("contact_todos").insert<InsertedResult>(input.todos);

			return { success: true, message: `Todo(s) - ${inserted.rowCount} have been added` };
		},
		async todos_remove(parent, { input }: { input: TodosRemoveInput }, { knex }: { knex: Knex }, info): Promise<ApiResponse> {
			let query = knex("contact_todos");

			query = input.id
				? query.whereIn("todo_id", input.id)
				: query;

			const deletedCount = await query.del();

			return { success: true, message: `Todo(s) - ${deletedCount} have been removed.` };
		}
	},
	todo: {
		id: mapKeyResolver("todo_id")
	}
}