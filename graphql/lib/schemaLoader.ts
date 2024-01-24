import { readdir } from "fs/promises";
import { makeExecutableSchema } from "@graphql-tools/schema";
import lodash from "lodash";
import { DocumentNode } from "graphql";
import { IResolvers } from "@graphql-tools/utils";

async function readdirRegex(dir: string, regex: RegExp) {
	const files = await readdir(dir);

	return files.filter(file => file.match(regex) !== null);
}

export interface GraphModule {
	typeDefs?: DocumentNode
	resolvers?: IResolvers<any, any>
}

export default async function schemaLoader({ paths = [] }: { paths?: string[] }) {
	const typeDefs: DocumentNode[] = [];
	const resolvers: IResolvers<any, any>[] = [];
	const defs: GraphModule[] = [];

	for (const path of paths) {
		const dirResult = await readdirRegex(path, /\.[tj]s$/);

		for (const name of dirResult) {
			const temp = require(`${path}/${name}`);
			defs.push(temp);
		}
	}

	for (const def of defs) {
		if (def.typeDefs !== undefined) {
			typeDefs.push(def.typeDefs);
		}

		if (def.resolvers !== undefined) {
			resolvers.push(def.resolvers);
		}
	}

	const schema = makeExecutableSchema({
		typeDefs,
		resolvers: lodash.merge({}, ...resolvers)
	});

	return schema;
}