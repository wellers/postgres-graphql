import { gql } from "apollo-server-express";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { mapKeyResolver } from "./mapKeyResolver";

const {
	JWT_SECRET
} = process.env;

export const typeDefs = gql`
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

export const resolvers = {
	Query: {
		auth: () => { return {}; }
	},
	Mutation: {
		auth: () => { return {}; }
	},
	auth_query: {
		async me(parent, args, { knex, user }, info) {
			if (!user) {
				throw new Error("You are not authenticated!");
			}

			return await knex("users").where("user_id", user.id).first();
		}
	},
	auth_mutation: {
		async signup(parent, { username, email, password }, { knex }, info) {
			const user = await knex("users").insert({
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
		async login(parent, { email, password }, { knex }, info) {
			const user = await knex("users").where("email", email).first();

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