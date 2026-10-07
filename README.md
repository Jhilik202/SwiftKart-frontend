# ShopHub: React frontend

React + JSX + CSS frontend for the E-Commerce backend (Node.js, Express, MongoDB). No TypeScript, Tailwind, Bootstrap or UI library. The backend is not modified, and the frontend never touches MongoDB: every request goes through the REST API.

## Run it

1. Start the backend first (`npm run dev` in `ecommerce-backend`, default port 5000).
2. In this folder:

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

`.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Restart `npm run dev` after changing `.env`. The URL is read in one place only: `src/api/apiClient.js`.

The backend already allows other origins through `cors()`, so no backend change is needed.

## Structure

```
src/
  api/         apiClient.js (fetch, base URL, token header, errors) + authApi, productApi, cartApi, orderApi, reviewApi, userApi
  components/  Navbar, Footer, ProductCard, ProductGrid, ProtectedRoute, Loading, Message, Pagination, StarRating
  context/     AuthContext (user, login, register, logout, roles), CartContext (cart from the backend)
  pages/       Home, Products, ProductDetails, Login, Register, Cart, Checkout, Orders, OrderDetails, Profile,
               AdminDashboard, AdminProducts, AdminOrders, AdminUsers, NotFound
  styles/      one CSS file per area
  utils/       helpers.js (formatting, constants, placeholder image)
```

## Routes and the backend endpoints they use

| Route | Access | Backend endpoints |
|---|---|---|
| / | public | GET /products |
| /products | public | GET /products (search, category, minPrice, maxPrice, sort, page, limit) |
| /products/:id | public | GET /products/:id, GET/POST/PUT/DELETE /products/:id/reviews |
| /login, /register | public | POST /auth/login, POST /auth/register |
| /cart | logged in | GET/DELETE /cart, PUT/DELETE /cart/items/:productId |
| /checkout | logged in | POST /orders |
| /orders, /orders/:id | logged in | GET /orders, GET /orders/:id |
| /profile | logged in | GET /auth/me |
| /admin | moderator, admin | GET /products, plus GET /orders/all and GET /users for admins |
| /admin/products | moderator, admin | POST/PUT /products (DELETE for admin only) |
| /admin/orders | admin | GET /orders/all, PUT /orders/:id/status |
| /admin/users | admin | GET /users, PUT /users/:id, DELETE /users/:id |

Add to cart on the product card and details page uses POST /cart/items.

## How it works

- **Login:** the JWT is saved in `localStorage` and sent as `Authorization: Bearer <token>`. On page refresh the app calls `GET /auth/me` to restore the user. A 401 from any request logs the user out.
- **Cart:** the backend is the source of truth. Every cart action calls the API and stores the cart the backend returns.
- **Checkout:** sends only the shipping address and payment method. The backend orders your cart, reads the prices from the database and calculates the total, so the frontend never sends a total.
- **Roles:** the UI hides what a role cannot use, but the backend enforces permissions. A 403 shows the backend's message.
- **Loading, empty and error states** are shown on every page that calls the API.

## Things to know

- **Profile is read-only:** the backend has no endpoint for users to edit their own profile, so the page only shows the account details.
- **Categories:** the list (electronics, clothing, food, books, other) is fixed in `utils/helpers.js` because the backend has a fixed list and no categories endpoint.
- **Product images:** products need real image URLs. When a URL is missing or fails to load, a grey "No image" placeholder is shown.
- **Popular products on Home:** the backend cannot sort by rating, so the app takes the newest 20 products and ranks them by rating itself.
- **Creating an admin:** register normally, then set `role` to `admin` in MongoDB (or use the admin users page once you have one admin).

## Test checklist

1. Register a user, log out, log in. Refresh the page and confirm you stay logged in.
2. Products page: search, category, price range, sort, pagination.
3. Product details: add to cart, quantity above stock (error), write, edit and delete a review.
4. Cart: change quantity, remove, clear. Checkout with the demo card and with cash on delivery.
5. Orders: open the new order and check the stock dropped on the product.
6. Log in as admin: manage products, update an order status, change a user's role.
7. Log in as moderator: products management only, no delete button, /admin/orders shows the access message.
8. Stop the backend and open Products to see the connection error message.
