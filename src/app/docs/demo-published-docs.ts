import type { PublishedDocsCollection } from '@/components/published-docs/PublishedDocsViewer';

export const DEMO_PUBLISHED_DOCS: PublishedDocsCollection = {
  id: 'c1',
  name: 'E-Commerce API',
  version: 'v2.1.0',
  baseUrl: 'https://api.ecommerce.dev',
  description: 'The E-Commerce API provides a complete suite of endpoints for building commerce applications — authentication, product catalogue management, shopping cart, and order fulfilment.',
  folders: [
    {
      name: 'Authentication',
      description: 'Endpoints for user identity and session management.',
      endpoints: [
        {
          id: 'e1', method: 'POST', name: 'Login', path: '/auth/login',
          description: 'Authenticate a registered user and receive a signed JWT access token. The token should be passed as a Bearer token in the `Authorization` header for all protected endpoints.',
          body: JSON.stringify({ email: 'user@example.com', password: 'secret123' }, null, 2),
          bodySchema: { email: 'string — required', password: 'string — required, min 8 chars' },
          params: [], query: [],
          headers: [{ key: 'Content-Type', value: 'application/json', description: 'Must be JSON' }],
          scenarios: [
            { status: 200, description: 'Authentication successful. Returns a signed JWT and expiry.',
              body: { token: '<demo-jwt-token>', expiresIn: 3600, user: { id: 1, email: 'user@example.com', name: 'Jane Doe', role: 'customer' } } },
            { status: 401, description: 'Invalid credentials.',
              body: { error: 'Unauthorized', message: 'Invalid email or password.', code: 'AUTH_INVALID_CREDENTIALS' } },
            { status: 422, description: 'Request body failed validation.',
              body: { error: 'Unprocessable Entity', fields: [{ field: 'email', message: 'Must be a valid email address.' }] } },
          ],
        },
        {
          id: 'e2', method: 'POST', name: 'Register', path: '/auth/register',
          description: 'Create a new user account. After registration, the user can immediately authenticate using the `/auth/login` endpoint.',
          body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com', password: 'secure456' }, null, 2),
          bodySchema: { name: 'string — required, max 100 chars', email: 'string — required, unique', password: 'string — required, min 8 chars' },
          params: [], query: [],
          headers: [{ key: 'Content-Type', value: 'application/json', description: 'Must be JSON' }],
          scenarios: [
            { status: 201, description: 'Account created successfully.',
              body: { id: 42, name: 'Jane Doe', email: 'jane@example.com', createdAt: '2026-04-29T10:00:00Z' } },
            { status: 409, description: 'Email already registered.',
              body: { error: 'Conflict', message: 'An account with this email already exists.', code: 'AUTH_EMAIL_TAKEN' } },
          ],
        },
        {
          id: 'e3', method: 'POST', name: 'Refresh Token', path: '/auth/refresh',
          description: 'Exchange an expired access token for a new one using a long-lived refresh token.',
          body: JSON.stringify({ refreshToken: '<demo-refresh-token>' }, null, 2),
          bodySchema: { refreshToken: 'string — required, issued at login' },
          params: [], query: [],
          headers: [{ key: 'Content-Type', value: 'application/json' }],
          scenarios: [
            { status: 200, description: 'New token pair issued.', body: { token: '<demo-jwt-token>', expiresIn: 3600 } },
            { status: 401, description: 'Refresh token is invalid or expired.', body: { error: 'Unauthorized', message: 'Refresh token has expired.', code: 'AUTH_TOKEN_EXPIRED' } },
          ],
        },
      ],
    },
    {
      name: 'Products',
      description: 'Browse and manage the product catalogue.',
      endpoints: [
        {
          id: 'e4', method: 'GET', name: 'List Products', path: '/products',
          description: 'Returns a paginated list of products. Filter by category slug, or use the `search` parameter for full-text search across product names and descriptions.',
          params: [],
          query: [
            { name: 'page',     type: 'integer', required: false, description: 'Page number (1-indexed).', example: '1' },
            { name: 'limit',    type: 'integer', required: false, description: 'Items per page. Maximum 100.', example: '20' },
            { name: 'category', type: 'string',  required: false, description: 'Filter by category slug.', example: 'electronics' },
            { name: 'search',   type: 'string',  required: false, description: 'Full-text search query.', example: 'headphones' },
            { name: 'sort',     type: 'string',  required: false, description: 'Sort field: `price`, `name`, `createdAt`.', example: 'price' },
          ],
          headers: [{ key: 'Authorization', value: 'Bearer {token}', description: 'Required. JWT access token.' }],
          scenarios: [
            { status: 200, description: 'Paginated list of products.',
              body: { data: [
                { id: 1, name: 'Wireless Headphones', price: 79.99, category: 'electronics', stock: 142, thumbnail: 'https://cdn.example.com/p1.jpg' },
                { id: 2, name: 'Mechanical Keyboard', price: 129.00, category: 'electronics', stock: 57, thumbnail: 'https://cdn.example.com/p2.jpg' },
              ], meta: { page: 1, limit: 20, total: 148, totalPages: 8 } } },
            { status: 401, description: 'Missing or invalid bearer token.', body: { error: 'Unauthorized', message: 'Bearer token required.' } },
          ],
        },
        {
          id: 'e5', method: 'GET', name: 'Get Product', path: '/products/{id}',
          description: 'Fetch full details for a single product including inventory levels and related metadata.',
          params: [{ name: 'id', type: 'integer', required: true, description: 'Unique product identifier.', example: '1' }],
          query: [],
          headers: [{ key: 'Authorization', value: 'Bearer {token}', description: 'Required.' }],
          scenarios: [
            { status: 200, description: 'Full product record.',
              body: { id: 1, name: 'Wireless Headphones', price: 79.99, category: 'electronics', stock: 142, description: 'Premium over-ear headphones with active noise cancellation.', createdAt: '2025-11-01T00:00:00Z' } },
            { status: 404, description: 'Product not found.',
              body: { error: 'Not Found', message: 'Product with id 999 does not exist.', code: 'PRODUCT_NOT_FOUND' } },
          ],
        },
        {
          id: 'e6', method: 'POST', name: 'Create Product', path: '/products',
          description: 'Add a new product to the catalogue. Requires an account with the `admin` role.',
          body: JSON.stringify({ name: 'Smart Watch', price: 249.99, category: 'electronics', stock: 50, description: 'Feature-rich smartwatch.' }, null, 2),
          bodySchema: { name: 'string — required', price: 'number — required, > 0', category: 'string — required', stock: 'integer — required, ≥ 0', description: 'string — optional' },
          params: [], query: [],
          headers: [
            { key: 'Authorization', value: 'Bearer {token}', description: 'Required. Admin role.' },
            { key: 'Content-Type', value: 'application/json' },
          ],
          scenarios: [
            { status: 201, description: 'Product created.',
              body: { id: 149, name: 'Smart Watch', price: 249.99, createdAt: '2026-04-29T12:00:00Z' } },
            { status: 403, description: 'Insufficient permissions.',
              body: { error: 'Forbidden', message: 'Admin role required.', code: 'INSUFFICIENT_PERMISSIONS' } },
          ],
        },
        {
          id: 'e7', method: 'PATCH', name: 'Update Product', path: '/products/{id}',
          description: 'Partially update a product. Only the fields you include will be changed.',
          body: JSON.stringify({ price: 219.99, stock: 60 }, null, 2),
          bodySchema: { name: 'string — optional', price: 'number — optional, > 0', stock: 'integer — optional, ≥ 0', description: 'string — optional' },
          params: [{ name: 'id', type: 'integer', required: true, description: 'Product to update.', example: '149' }],
          query: [],
          headers: [{ key: 'Authorization', value: 'Bearer {token}', description: 'Required. Admin role.' }, { key: 'Content-Type', value: 'application/json' }],
          scenarios: [
            { status: 200, description: 'Updated product.', body: { id: 149, name: 'Smart Watch', price: 219.99, stock: 60, updatedAt: '2026-04-29T13:00:00Z' } },
            { status: 404, description: 'Not found.', body: { error: 'Not Found', message: 'Product does not exist.' } },
          ],
        },
        {
          id: 'e8', method: 'DELETE', name: 'Delete Product', path: '/products/{id}',
          description: 'Permanently remove a product from the catalogue. This action cannot be undone.',
          params: [{ name: 'id', type: 'integer', required: true, description: 'Product to delete.', example: '149' }],
          query: [],
          headers: [{ key: 'Authorization', value: 'Bearer {token}', description: 'Required. Admin role.' }],
          scenarios: [
            { status: 204, description: 'Deleted — no content returned.', body: null },
            { status: 403, description: 'Admin role required.', body: { error: 'Forbidden', message: 'Insufficient permissions.' } },
          ],
        },
      ],
    },
    {
      name: 'Orders',
      description: 'Place and track customer orders.',
      endpoints: [
        {
          id: 'e9', method: 'GET', name: 'List Orders', path: '/orders',
          description: 'Retrieve all orders belonging to the authenticated user. Admin accounts receive all orders across users.',
          params: [],
          query: [
            { name: 'status', type: 'string', required: false, description: '`pending` | `processing` | `shipped` | `delivered` | `cancelled`', example: 'pending' },
            { name: 'page',   type: 'integer', required: false, description: 'Page number.', example: '1' },
          ],
          headers: [{ key: 'Authorization', value: 'Bearer {token}', description: 'Required.' }],
          scenarios: [
            { status: 200, description: 'Order list.',
              body: { data: [{ id: 'ORD-001', status: 'pending', total: 209.98, itemCount: 3, createdAt: '2026-04-28T09:00:00Z' }], meta: { page: 1, total: 1 } } },
          ],
        },
        {
          id: 'e10', method: 'POST', name: 'Create Order', path: '/orders',
          description: 'Place a new order. Each item in `items` must reference a valid product. The `shippingAddress` object must include at minimum `line1`, `city`, and `country`.',
          body: JSON.stringify({ items: [{ productId: 1, qty: 2 }, { productId: 3, qty: 1 }], shippingAddress: { line1: '123 Main St', city: 'Lagos', country: 'NG' } }, null, 2),
          bodySchema: { 'items[].productId': 'integer — required', 'items[].qty': 'integer — required, ≥ 1', 'shippingAddress.line1': 'string — required', 'shippingAddress.city': 'string — required', 'shippingAddress.country': 'string — required, ISO 3166-1 alpha-2' },
          params: [], query: [],
          headers: [{ key: 'Authorization', value: 'Bearer {token}', description: 'Required.' }, { key: 'Content-Type', value: 'application/json' }],
          scenarios: [
            { status: 201, description: 'Order placed.',
              body: { id: 'ORD-002', status: 'pending', total: 199.93, estimatedDelivery: '2026-05-03' } },
            { status: 422, description: 'Validation error.',
              body: { error: 'Unprocessable Entity', message: 'Product 99 is out of stock.', code: 'PRODUCT_OUT_OF_STOCK' } },
          ],
        },
      ],
    },
  ],
};
