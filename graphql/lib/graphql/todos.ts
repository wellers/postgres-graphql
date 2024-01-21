import { gql } from "apollo-server-express";
import { mapKeyResolver } from "./mapKeyResolver";
import sql from "../db";

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

export const resolvers = {
	Query: {
		todos: () => { return {}; }
	},
	Mutation: {
		todos: () => { return {}; }
	},
	todos_query: {
		async todos_find(parent, { filter }, context, info) {
			const { contact_id } = filter;

			const docs = await sql`SELECT * FROM contact_todos ${
				contact_id
				? sql`WHERE contact_id = ${contact_id}`
				: sql``
			}`; 		

			return {
				success: true,
				message: 'Records matching filter.',
				docs
			};
		}
	},
	todos_mutation: {
		async todos_insert(parent, { input: { todos } }, context, info) {
			const { count } = await sql`INSERT INTO contact_todos ${ sql(todos, "contact_id", "description") }`;

			return { success: true, message: `Todo(s) - ${count} have been added` };
		},
		async todos_remove(parent, { input }, context, info) {
			const { count } = await sql`DELETE FROM contact_todos ${
				input.id 
				? sql`WHERE todo_id IN ${sql(input.id)}`
				: sql``
			}`;

			return { success: true, message: `Todo(s) - ${count} have been removed.` };
		}
	},
	todo: {
		id: mapKeyResolver("todo_id")
	}
}