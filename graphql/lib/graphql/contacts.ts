import { gql } from "apollo-server-express";
import { mapKeyResolver } from "./mapKeyResolver";
import sql from "../db";

export const typeDefs = gql`
	extend type Query {
		contacts: contacts_query
	}

	extend type Mutation {
		contacts: contacts_mutation
	}

	type contacts_query

	type contacts_mutation
	
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

	input contacts_insert_input {
		contacts: [contacts_contacts_input!]!
	}

	input contacts_contacts_input {
		title: String!,
		forename: String!,
		surname: String!,
	}

	input contacts_remove_input {
		id: [ID!]
	}

	type contacts_insert_result {
		success: Boolean!,
		message: String!
	}

	type contacts_remove_result {
		success: Boolean!,
		message: String!
	}

	extend type contacts_mutation {
		contacts_insert(input: contacts_insert_input!): contacts_insert_result,
		contacts_remove(input: contacts_remove_input): contacts_remove_result
	}
`;

export const resolvers = {
	Query: {
		contacts: () => { return {}; }
	},
	Mutation: {
		contacts: () => {return {}; }
	},
	contacts_query: {
		async contacts_find(parent, { filter }, context, info) {
			const { search_term, page_number, results_per_page } = filter;
			const start = (page_number - 1) * results_per_page;
			
			const docs = await sql`SELECT * FROM contacts ${
				search_term.length > 0 
				? sql`WHERE forename LIKE ${`%${search_term}%`} OR surname LIKE ${`%${search_term}%`}`
				: sql``
			}`;

			return {
				success: true,
				message: "Records matching filter.",
				docs: docs.slice(start, results_per_page),
				total_results_count: docs.length,
				results_per_page
			};
		}
	},
	contacts_mutation: {
		async contacts_insert(parent, { input: { contacts } }, context, info) {
			const { count } = await sql`INSERT INTO contacts ${ sql(contacts, "title", "forename", "surname") }`;

			return { success: true, message: `Contact(s) - ${count} have been added` };
		},
		async contacts_remove(parent, { input }, context, info) {
			const { count } = await sql`DELETE FROM contacts ${
				input.id 
				? sql`WHERE contact_id IN ${sql(input.id)}`
				: sql``
			}`;

			return { success: true, message: `Contact(s) - ${count} have been removed.` };
		}
	},
	contact: {
		id: mapKeyResolver("contact_id"),
		async todos({ contact_id }, args, context, info) {
			return await sql`SELECT * FROM contact_todos WHERE contact_id = ${contact_id}`;	
		}
	}
}