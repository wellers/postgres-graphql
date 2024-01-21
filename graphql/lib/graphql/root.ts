import { gql } from 'apollo-server-express';

const typeDefs = gql`    
	type Query
	type Mutation
`;

const resolvers = {
	Query: {},
	Mutation: {}
};

export = {
	typeDefs,
	resolvers
}