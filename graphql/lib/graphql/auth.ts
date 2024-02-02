import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { mapKeyResolver } from "./mapKeyResolver";
import * as Types from "knex/types/tables.js";
import { Knex } from "knex";

const {
	JWT_SECRET
} = process.env;

export const typeDefs = `#graphql
	extend type Query {
		auth: auth_query
	}

	extend type Mutation {
		auth: auth_mutation
	}

	type auth_query

	type auth_mutation

	type user {
		id: Int!,
		username: String!,
		email: String!
	}

	type auth_query {
		me: user
	}
	
	type auth_mutation {
		signup(username: String!, email: String!, password: String!): String,
		login(email: String!, password: String!): String
	}
`;

interface User {
	id: string
}

type UserInsertResult = {
	user_id: number;
	email: string;
}

type MeResult = Omit<Types.User, "password">

export const resolvers = {
	Query: {
		auth: () => { return {}; }
	},
	Mutation: {
		auth: () => { return {}; }
	},
	auth_query: {
		async me(parent, args, { knex, user }: { knex: Knex, user: User}, info): Promise<MeResult> {
			if (!user) {
				throw new Error("You are not authenticated!");
			}

			return await knex<Types.User>("users").where("user_id", user.id).first<MeResult>();
		}
	},
	auth_mutation: {
		async signup(parent, { username, email, password }: { username: string, email: string, password: string }, { knex }: { knex: Knex }, info): Promise<string> {
			const user = await knex<Types.User>("users").insert<UserInsertResult>({
				username,
				email,
				password: await bcrypt.hash(password, 10)
			});

			return jsonwebtoken.sign({
					id: user.user_id, 
					email: user.email
				},
				JWT_SECRET, { 
					expiresIn: "1d"
				}
			);
		},
		async login(parent, { email, password }: { email: string, password: string }, { knex }: { knex: Knex }, info): Promise<string> {
			const user = await knex<Types.User>("users").where("email", email).first();

			if (!user) {
				throw new Error ("No user with that email.");
			}

			const valid = await bcrypt.compare(password, user.password);

			if (!valid) {
				throw new Error("Incorrect password.");
			}

			return jsonwebtoken.sign({
				id: user.user_id,
				email: user.email
			}, 
			JWT_SECRET, {
				expiresIn: "1d"
			});
		}
	},
	user: {
		id: mapKeyResolver("user_id"),
	}
};