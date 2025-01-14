# Vue Router Middleware

`@yazida/vue-router-middleware` is a lightweight and flexible middleware system for Vue Router in Vue 3 applications. It allows you to define global or inline middleware for route navigation, enabling advanced use cases such as authentication, logging, or other route-specific logic.

---

## Installation

Install the package via npm:

```bash
# PNPM
pnpm add @yazida/vue-router-middleware

# YARN
yarn add @yazida/vue-router-middleware

# NPM
npm install @yazida/vue-router-middleware
```

---

## Features

- **Global Middleware Registration**: Register middleware globally by name for reuse.
- **Inline Middleware Support**: Use middleware directly in route definitions.
- **Flexible Pipeline**: Chain multiple middleware functions for a single route.
- **TypeScript Support**: Fully typed for robust development.

---

## Usage

### 1. Register Global Middleware
You can register middleware globally for reuse across your application:

```typescript
import { registerMiddleware } from '@yazida/vue-router-middleware';

// Example: Authentication middleware
registerMiddleware('auth', ({ to, next }) => {
    if (!isAuthenticated() && to.meta.requiresAuth) {
        return next('/login');
    }
    next();
});

// Example: Logging middleware
registerMiddleware('log', ({ to, from }) => {
    console.log(`Navigating from ${from.fullPath} to ${to.fullPath}`);
});
```

### 2. Define Routes with Middleware
Add middleware to your routes using the `meta.middleware` property:

```typescript
import { createRouter, createWebHistory } from 'vue-router';
import { createVueRouterMiddleware } from '@yazida/vue-router-middleware';

const routes = [
    {
        path: '/',
        component: Home,
        meta: { middleware: ['auth', 'log'] },
    },
    {
        path: '/about',
        component: About,
        meta: { middleware: 'log' },
    },
    {
        path: '/login',
        component: Login,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Initialize middleware handling
createVueRouterMiddleware(router);

export default router;
```

### 3. Use Inline Middleware (Optional)
Define middleware directly in route definitions:

```typescript
const routes = [
    {
        path: '/dashboard',
        component: Dashboard,
        meta: {
            middleware: ({ to, next }) => {
                if (!hasAccess(to.params.id)) {
                    return next('/403');
                }
                next();
            },
        },
    },
];
```

---

## API

### `registerMiddleware(name: string, middleware: Middleware): void`
Registers a middleware function globally under the specified name.

#### Parameters:
- `name`: A unique identifier for the middleware.
- `middleware`: The middleware function.

#### Example:
```typescript
registerMiddleware('example', ({ to, next }) => {
    console.log(`Navigating to: ${to.fullPath}`);
    next();
});
```

### `createVueRouterMiddleware(router: Router): Router`
Enhances the Vue Router instance to process middleware during navigation.

#### Parameters:
- `router`: The Vue Router instance to enhance.

#### Example:
```typescript
createVueRouterMiddleware(router);
```

---

## Example Middleware

### Authentication Middleware
```typescript
registerMiddleware('auth', ({ to, next }) => {
    if (!isAuthenticated() && to.meta.requiresAuth) {
        return next('/login');
    }
    next();
});
```

### Logging Middleware
```typescript
registerMiddleware('log', ({ to, from }) => {
    console.log(`Navigating from ${from.fullPath} to ${to.fullPath}`);
});
```

---

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a clear description of your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Special thanks to the [Yazida](https://yazida.io) team for the support.

