import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { json } from "body-parser";
import cors from "cors";
import { JwtPayload, verify } from "jsonwebtoken";
import schemaLoader from "./schemaLoader";
import knex from "./db";

const {
	JWT_SECRET
} = process.env;

const startDate = Date.now();

process.on("unhandledRejection", function (e) {
	process.exit(1);
});

process.on('uncaughtException', function (e) {
	process.exit(1);
});

type UserToken = string | JwtPayload | null;

function verifyToken(token: string): UserToken {
	try {
		if (token) {
			return verify(token, JWT_SECRET ?? "")
		}
		return null
	} catch {
		return null
	}
}

async function boot() {
	const app = express();

	app.get("/status/", function (req, res) {
		res.json({ start: startDate });
	});

	const schema = await schemaLoader({ paths: ["/app/lib/graphql"] });

	const server = new ApolloServer({
		schema,
		formatError: function (err) {
			console.log(err.extensions?.stacktrace?.join("\n"));
			return err;
		}
	});

	await server.start();

	app.use("/", 
		cors(), 
		json({ limit: "5mb" }), 
		expressMiddleware(server, {
			context: async ({ req }) => {
				const token = req.get("Authorization") || "";
				const user = verifyToken(token.replace("Bearer ", ""));

				return {
					knex,
					user
				};
			}
		}
	));

	app.listen(80, () => console.log(`🚀 Server ready`));
}

boot().catch(function (e) {
	console.log("Boot failure", e);
	process.exit(1);
});