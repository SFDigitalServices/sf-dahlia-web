/**
 * DAHLIA Devise → Clerk migration transformer.
 * TODO: Remove this script when migration is complete.
 *
 */
import fs from 'fs';
import type { PreTransformResult, User } from '../types';

function parseExport(content: string): Record<string, unknown>[] {
	const normalized = content.trim().replace(/,\s*\\n\s*/g, ',');
	return JSON.parse(normalized);
}

const deviseTransformer = {
	key: 'devise',
	label: 'Devise - DAHLIA migration',
	description: 'DAHLIA migration from Devise to Clerk',
	preTransform: (filePath: string, fileType: string): PreTransformResult => {
		if (fileType !== 'application/json') return { filePath };
		const users = parseExport(fs.readFileSync(filePath, 'utf-8').trim()).filter(
			(u) =>
				u.id != null &&
				u.email != null &&
				u.encrypted_password != null &&
				u.created_at != null
		);
		return { filePath, data: users as User[] };
	},
	transformer: {
		id: 'userId',
		email: 'email',
		encrypted_password: 'password',
		created_at: 'createdAt',
		salesforce_contact_id: 'salesforceContactId',
	},
	postTransform: (user: Record<string, unknown>) => {
		user.userId = String(user.userId);
		user.createdAt = new Date(`${user.createdAt}Z`).toISOString();
		if (user.salesforceContactId) {
			user.privateMetadata = {
				salesforce_contact_id: user.salesforceContactId,
			};
		}
		delete user.salesforceContactId;
	},
	defaults: {
		passwordHasher: 'bcrypt' as const,
	},
};

export default deviseTransformer;
