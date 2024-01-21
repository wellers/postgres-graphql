import { gql } from 'apollo-server-express';

const typeDefs = gql`    
	type Query
`;

const resolvers = {
	Query: {}
};

export = {
	typeDefs,
	resolvers
}