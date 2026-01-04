import {
	type RouteConfigEntry,
	index,
	route,
} from '@react-router/dev/routes';

const pageModules = import.meta.glob('./**/page.jsx', { eager: true });

function generateRoutesFromGlob(): RouteConfigEntry[] {
	const routes: RouteConfigEntry[] = [];

	for (const globPath in pageModules) {
		const relativePath = globPath.replace('./', ''); // e.g. "superuser/dashboard/page.jsx"
		const segments = relativePath.split('/');
		const routeParts = segments.slice(0, -1); // Remove "page.jsx"

		if (routeParts.length === 0) {
			routes.push(index('./page.jsx'));
		} else {
			const routePath = routeParts.map(segment => {
				const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
				if (match) {
					const [_, dots, param] = match;
					return dots === '...' ? '*' : `:${param}`;
				}
				return segment;
			}).join('/');

			routes.push(route(routePath, `./${relativePath}`));
		}
	}

	return routes;
}

const routes = [...generateRoutesFromGlob(), route('*', './__create/not-found.tsx')];

export default routes;
