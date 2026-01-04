import { getToken } from '@auth/core/jwt';
import { getContext } from 'hono/context-storage';

export default function CreateAuth() {
	const auth = async () => {
		const c = getContext();
		const secureCookie = process.env.AUTH_URL?.startsWith('https') ?? false;

		console.log("[DEBUG] auth() call:", {
			hasAuthSecret: !!process.env.AUTH_SECRET,
			secureCookie,
			url: c.req.url,
			cookieHeader: c.req.header("cookie")
		});

		const token = await getToken({
			req: c.req.raw,
			secret: process.env.AUTH_SECRET,
			secureCookie,
		});

		console.log("[DEBUG] getToken result:", {
			found: !!token,
			sub: token?.sub
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
