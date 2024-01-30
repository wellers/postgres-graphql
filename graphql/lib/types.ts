declare module 'knex/types/tables.js' {
	interface Contact {
		contact_id: number;
		title: string;
		forename: string;
		surname: string;
		todos: [Todo]
	}

	interface Todo {
		todo_id: number;
		contact_id: number;
		description: string;
	}

	interface User {
		user_id: number;
		username: string,
		email: string,
		password: string
	}

	interface Tables {
		contacts: Contact;
		todos: Todo;
		user: User;
	}
}

type ApiResponse = {
	success: boolean;
	message: string;
}

interface InsertedResult {
	rowCount: number
}