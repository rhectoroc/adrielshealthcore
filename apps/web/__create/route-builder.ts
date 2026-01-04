import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import type { Handler } from 'hono/types';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

// Import all routes using import.meta.glob
const routeModules = import.meta.glob('../src/app/api/**/route.js', { eager: true });

// Helper function to transform file path to Hono route path
function getHonoPathFromGlob(globPath: string): { name: string; pattern: string }[] {
  // globPath is like "../src/app/api/patients/route.js"
  const relativePath = globPath.replace('../src/app/api/', '');
  const parts = relativePath.split('/').filter(Boolean);
  const routeParts = parts.slice(0, -1); // Remove 'route.js'
  if (routeParts.length === 0) {
    return [{ name: 'root', pattern: '' }];
  }
  const transformedParts = routeParts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? { name: param, pattern: `:${param}{.+}` }
        : { name: param, pattern: `:${param}` };
    }
    return { name: segment, pattern: segment };
  });
  return transformedParts;
}

// Register all routes
function registerRoutes() {
  // Clear existing routes
  api.routes = [];

  // Sort route modules by path length to ensure more specific routes are matched first? 
  // Actually Hono handles routing, but the order of registration might matter for some cases.
  const sortedPaths = Object.keys(routeModules).sort((a, b) => b.length - a.length);

  for (const globPath of sortedPaths) {
    try {
      const route = routeModules[globPath] as any;
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      for (const method of methods) {
        if (route[method]) {
          const parts = getHonoPathFromGlob(globPath);
          const honoPath = `/${parts.map(({ pattern }) => pattern).join('/')}`;

          const handler: Handler = async (c) => {
            const params = c.req.param();
            return await route[method](c.req.raw, { params });
          };

          const methodLowercase = method.toLowerCase();
          switch (methodLowercase) {
            case 'get': api.get(honoPath, handler); break;
            case 'post': api.post(honoPath, handler); break;
            case 'put': api.put(honoPath, handler); break;
            case 'delete': api.delete(honoPath, handler); break;
            case 'patch': api.patch(honoPath, handler); break;
          }
        }
      }
    } catch (error) {
      console.error(`Error registering route ${globPath}:`, error);
    }
  }
}

// Initial route registration
registerRoutes();

export { api, API_BASENAME };
