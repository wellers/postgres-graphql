import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import schemaLoader from "./schemaLoader";
import knex from "./db";

const startDate = Date.now();

process.on("unhandledRejection", function (e) {
	process.exit(1);
});

async function boot() {
	const app = express();

	app.get("/status/", function (req, res) {
		res.json({ start: startDate });
	});

	const schema = await schemaLoader({ paths: ["/app/lib/graphql"] });

	const server = new ApolloServer({
		schema,
		context: () => ({ knex }),
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