import { gql } from "apollo-server-express";
import { mapKeyResolver } from "./mapKeyResolver";
import sql from "../db";

export const typeDefs = gql`
	extend type Query {
		todos: todos_query
	}

	type todos_query
	
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
`;

export const resolvers = {
	Query: {
		todos: () => { return {}; }
	},
	todos_query: {
		async todos_find(parent, { filter }, context, info) {
			const { contact_id } = filter;

			const docs = await sql`SELECT * FROM contact_todos ${
				contact_id
				? sql`WHERE contact_fkey = ${contact_id}`
				: sql``
			}`; 		

			return {
				success: true,
				message: 'Records matching filter.',
				docs
			};
		}
	},
	todo: {
		id: mapKeyResolver("todo_key"),
		contact_id: mapKeyResolver("contact_fkey"),
		description: mapKeyResolver("todo")
	},
}