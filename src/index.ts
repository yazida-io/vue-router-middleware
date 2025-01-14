import {Router, RouteLocationNormalized, NavigationGuardNext} from "vue-router";

export type MiddlewareContext = {
    to: RouteLocationNormalized;
    from: RouteLocationNormalized;
    next: NavigationGuardNext;
    router: Router;
};

export type Middleware = (context: MiddlewareContext) => void;

const middlewareRegistry: Record<string, Middleware> = {};

/**
 * Retrieves all registered middleware by name.
 * @param name - The name of the middleware to retrieve.
 * @returns Middleware function if registered, otherwise throws an error.
 */
const middlewareOf = (name: string): Middleware => {
    const middleware = middlewareRegistry[name];
    if (!middleware) {
        throw new Error(`Middleware with name "${name}" is not registered.`);
    }
    return middleware;
};

export const createVueRouterMiddleware = (router: Router): Router => {
    const middlewarePipeline = (
        context: MiddlewareContext,
        middleware: Middleware[],
        index: number
    ): NavigationGuardNext => {
        const nextMiddleware = middleware[index];

        if (!nextMiddleware) {
            return context.next;
        }

        return (arg?: any) => {
            if (arg !== undefined) {
                // If the `next` function is called with an argument, terminate the pipeline
                return context.next(arg);
            }

            const nextPipeline = middlewarePipeline(context, middleware, index + 1);

            nextMiddleware({ ...context, next: nextPipeline });
        };
    };

    router.beforeEach((to, from, next) => {
        const matchedMiddleware = to.matched
            .filter((record) => record.meta.middleware)
            .map((record) => {
                    return Array.isArray(record.meta.middleware)
                    ? (record.meta.middleware as (string | Middleware)[])
                    : [record.meta.middleware as string | Middleware];
                }
            )
            .reduce((acc, curr) => acc.concat(curr), [])
            .map((item) => (typeof item === "string" ? middlewareOf(item) : item as Middleware));

        if (matchedMiddleware.length > 0) {
            const context: MiddlewareContext = { to, from, next, router };
            return matchedMiddleware[0]({
                ...context,
                next: middlewarePipeline(context, matchedMiddleware, 1),
            });
        }

        next();
    });

    return router;
};

/**
 * Registers a named middleware globally.
 * @param name - The name of the middleware.
 * @param middleware - The middleware function.
 */
export const registerMiddleware = (name: string, middleware: Middleware): void => {
    if (middlewareRegistry[name]) {
        console.warn(`Middleware with name "${name}" is already registered. Overwriting.`);
    }
    middlewareRegistry[name] = middleware;
};