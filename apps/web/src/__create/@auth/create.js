import { getToken } from '@auth/core/jwt';
import { getContext } from 'hono/context-storage';

export default function CreateAuth() {
	const auth = async () => {
		const c = getContext();
		const cookieHeader = c.req.header("cookie");
		const secureCookie = process.env.AUTH_URL?.startsWith('https') ||
			c.req.header("x-forwarded-proto") === "https" ||
			!!cookieHeader?.includes("__Secure-authjs.session-token");

		const token = await getToken({
			req: c.req.raw,
			secret: process.env.AUTH_SECRET,
			secureCookie,
		});

		if (token) {
			return {
				user: {
					id: token.sub,
					email: token.email,
					name: token.name,
					image: token.picture,
				},
				expires: token.exp.toString(),
			};
		}
	};
	return {
		auth,
	};
}
