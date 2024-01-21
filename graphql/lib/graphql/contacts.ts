import { gql } from "apollo-server-express";
import { mapKeyResolver } from "./mapKeyResolver";
import sql from "../db";

export const typeDefs = gql`
	extend type Query {
		contacts: contacts_query
	}

	type contacts_query
	
	type contact {
		id: ID!,
		title: String!,
		forename: String!,
		surname: String!,
		todos: [todo!]!
	}

	input contacts_find_filter {
		search_term: String!,
		page_number: Int!,
		results_per_page: Int!
	}

	type contacts_find_result {
		success: Boolean!,
		message: String!,
		docs: [contact!]!,
		total_results_count: Int!,
		results_per_page: Int!
	}    

	extend type contacts_query {
		contacts_find(filter: contacts_find_filter): contacts_find_result
	}	
`;

export const resolvers = {
	Query: {
		contacts: () => { return {}; }
	},
	contacts_query: {
		async contacts_find(parent, { filter }, context, info) {
			const { search_term, page_number, results_per_page } = filter;
			const start = (page_number - 1) * results_per_page;
			
			const docs = await sql`SELECT * FROM contacts ${
				search_term.length > 0 
				? sql`WHERE forename LIKE ${"%" + search_term + "%"} OR surname LIKE ${"%" + search_term + "%"}`
				: sql``
			}`; 

			return {
				success: true,
				message: 'Records matching filter.',
				docs: docs.slice(start, results_per_page),
				total_results_count: docs.length,
				results_per_page
			};
		}
	},
	contact: {
		id: mapKeyResolver("contact_key"),
		async todos({ contact_key }, args, context, info) {
			return await sql`SELECT * FROM contact_todos WHERE contact_fkey = ${contact_key}`;	
		}
	}
}