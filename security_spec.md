# Security Specification — Thalawakale Electrical and Hardware

## 1. Data Invariants
1. **Strict Ownership & PII Isolation**: A user's profile (`/users/{userId}`), orders (`/users/{userId}/orders/{orderId}`), and formal quotes (`/users/{userId}/quotes/{quoteId}`) contain PII (name, email, phone, address, postal code) and may ONLY be read, listed, or created by the authenticated owner whose `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
2. **Master Gate Parent Sync**: Orders and quotes under `/users/{userId}` cannot be written unless the parent `/users/{userId}` document exists.
3. **Immutable Ownership & Timestamps**: `uid`, `userId`, and `createdAt` (`request.time`) cannot be spoofed at creation or modified on update.
4. **Terminal Order Locking & Valid Schema Bounds**: Confirmed orders are immutable once placed (`status == 'confirmed'`), preventing client-side tampering with order totals or payment methods. All strings and bounded item arrays (`size <= 50`) enforce strict length and type validation.

## 2. Adversarial "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated profile read/write**: `auth = null` attempting `get /users/u1` or `create /users/u1`.
2. **Cross-user PII peek**: `auth.uid = "u2"` attempting `get /users/u1` or `list /users/u1/orders`.
3. **Unverified email spoofing**: `auth = { uid: "u1", token: { email_verified: false } }` attempting `create /users/u1`.
4. **UID spoofing in body**: `auth.uid = "u1"` creating `/users/u1` with `{ uid: "u2", ... }`.
5. **Shadow / ghost field injection**: Creating `/users/u1` with extra field `{ isAdmin: true }` or `{ creditLimit: 9999999 }`.
6. **Self-assigned role escalation**: Attempting to write `/admins/u1` or add `role: "admin"` to `/users/u1`.
7. **Timestamp spoofing**: Creating `/users/u1` or `/users/u1/quotes/q1` with client-supplied past `createdAt` instead of `request.time`.
8. **Invalid ID poisoning**: Creating `/users/u1/quotes/../../etc/passwd` or 200-char ID failing `isValidId()`.
9. **Empty or oversized array DoW**: Creating `/users/u1/orders/o1` with `items: []` or `items.size() > 50`.
10. **Order financial tampering**: Updating `/users/u1/orders/o1` after creation to change `total` from `74500` to `1`.
11. **Malformed SKU/quote pattern**: Creating `/users/u1/quotes/q1` with `quoteNumber: "FAKE"` failing `^TEH-Q[0-9-]+$`.
12. **Blanket collection list**: Authenticated user attempting `list /users` to scrape customer emails and phone numbers.
