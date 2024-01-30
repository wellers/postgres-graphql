import { gql } from "apollo-server-express";
import { mapKeyResolver } from "./mapKeyResolver";
import * as Types from "knex/types/tables.js";
import { Knex } from "knex";

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

type ContactsFindFilter = {
	search_term: string;
	page_number: number;
	results_per_page: number;
}

type ContactsFindResult = {
	success: boolean;
	message: string;
	docs: Types.Contact[];
	total_results_count: number;
	results_per_page: number;
}

type ContactsInsertInput = {
	contacts: ContactInsertInput[];
}

type ContactInsertInput = Omit<Types.Contact, "contact_id">

type ContactsRemoveInput = {
	id: number[];
}

export const resolvers = {
	Query: {
		contacts: () => { return {}; }
	},
	Mutation: {
		contacts: () => { return {}; }
	},
	contacts_query: {
		async contacts_find(parent, { filter }: { filter: ContactsFindFilter }, { knex }: { knex: Knex }, info): Promise<ContactsFindResult> {
			const { search_term, page_number, results_per_page } = filter;
			const start = (page_number - 1) * results_per_page;

			let query = knex<Types.Contact>("contacts");

			query = search_term.length > 0 
					? query.whereLike("forename",`%${search_term}%`).orWhereLike("surname", `%${search_term}%`)
					: query;

			const docs = await query;

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
		async contacts_insert(parent, { input: { contacts } }: { input: ContactsInsertInput }, { knex }: { knex: Knex }, info): Promise<ApiResponse> {
			const inserted = await knex<Types.Contact>("contacts").insert<InsertedResult>(contacts);

			return { success: true, message: `Contact(s) - ${inserted.rowCount} has been added` };
		},
		async contacts_remove(parent, { input }: { input: ContactsRemoveInput }, { knex }: { knex: Knex }, info): Promise<ApiResponse> {
			let query = knex<Types.Contact>("contacts");

			query = input.id
				? query.whereIn("contact_id", input.id)
				: query;
			
			const deletedCount = await query.del();

			return { success: true, message: `Contact(s) - ${deletedCount} has been removed.` };
		}
	},
	contact: {
		id: mapKeyResolver("contact_id"),
		async todos({ contact_id }: { contact_id: number }, args,  { knex }: { knex: Knex }, info): Promise<Types.Todo[]> {
			return await knex("contact_todos").where("contact_id", contact_id)
		}
	}
}