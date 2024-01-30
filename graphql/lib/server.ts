import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
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
		context: ({ req }) => {
			const token = req.get("Authorization") || "";
			const user = verifyToken(token.replace("Bearer ", ""));

			return { 
				knex, 
				user
			};
		},
		plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
		// https://github.com/apollographql/graphql-tools/issues/480#issuecomment-448057551
		formatError: function (err) {
			console.log(err.extensions.exception?.stacktrace?.join("\n"));
			return err;
		}
	});

	await server.start();

	server.applyMiddleware({
		app,
		path: "/",
		bodyParserConfig: { limit: "5mb" }
	});

	app.listen(80, () => console.log(`🚀 Server ready`));
}

boot().catch(function (e) {
	console.log("Boot failure", e);
	process.exit(1);
});