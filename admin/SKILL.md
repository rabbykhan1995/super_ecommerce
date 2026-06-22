name: inventory-stack
description: >-
  Generates backend (Express + Mongoose) and frontend (React + Vite) code for
  the inventory management app. Use when adding or updating modules (sale,
  purchase, expense, damage, returns, warranty), API routes, paginated lists,
  MongoDB transactions, account payments, or React create/list pages in this
  codebase.
---
# Inventory Stack Conventions
Express + Mongoose backend and React + TypeScript frontend. **Not NestJS.**
## Stack
| Layer | Tech |
|-------|------|
| Backend | Bun, Express 5, Mongoose, Zod, JWT (`headers.token` or `cookies.token`) |
| Frontend | Vite, React 19, react-router v7, Axios, Zod, Tailwind, react-select |
| API base | `/api` — frontend `VITE_API_URL` |
---
## Backend: Module Layout
Each feature lives in `inventory backend/src/<module>/`:
.route.ts → Express router .controller.ts → static class, HTTP only .service.ts → business logic + transactions .repository.ts → DB only .model.ts → Mongoose schema .type.ts → IXxx, XxxResponse, CreateXxxInput .validator.ts → Zod schemas

Register in `routes/allRoutes.ts`: `router.use("/<module>", <module>Route)`
### Route chain (always)
```ts
router.post(
  "/create",
  authMiddleware,
  validate(createXxxSchema),
  asyncHandler(XxxController.create),
);
router.get("/list", authMiddleware, asyncHandler(XxxController.list));
router.delete("/delete/:id", authMiddleware, asyncHandler(XxxController.delete));
Controller response shape
res.status(201).json({ success: true, data, msg: "Xxx created successfully" });
res.status(200).json({ success: true, data: result });
res.status(200).json({ success: true, msg: "Xxx deleted successfully" });
Service rules
Throw new ApiError(statusCode, message) — never return errors
Multi-step writes must use MongoDB transaction:
const session = await mongoose.startSession();
session.startTransaction();
try {
  // all repository calls pass `session`
  await session.commitTransaction();
  return result;
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
Repository rules
Static methods only; no business logic
Transactional create: Model.create([payload], { session })
IDs: new Types.ObjectId(id)
List: delegate to paginatedAggregate from utils/aggregationQueryBuilder.ts
Types
export type CreateXxxInput = z.infer<typeof createXxxSchema>;
export type XxxResponse = HydratedDocument<IXxx>;
export type PaginatedResponse<T> = { items: T[]; total: number; page: number; limit: number };
Validators
Shared payments: paymentAccountSchema from src/account/account.validator.ts
Nested bodies: { products, accounts, exchangeAccounts, purchase } pattern
Custom rules: .superRefine()
Model conventions
{ timestamps: true }
Embedded arrays: _id: false (e.g. accounts: [{ accountID, amount }])
Optional deletable: boolean on transactional docs
Backend: Paginated List
Use paginatedAggregate in repository list(query):

return paginatedAggregate({
  model: Xxx,
  query,
  filter: buildListFilter(query),   // optional date/type filters
  postLookupSearch: true,
  defaultSort: { createdAt: -1 },
  searchFields: [{ field: "note" }, { field: "related.name" }],
  lookups: [{
    from: "collectionname",         // lowercase plural Mongo collection
    localField: "foreignKeyID",
    foreignField: "_id",
    as: "related",
    preserveNull: true,
  }],
  projection: {
    include: ["paid", "note", "createdAt"],
    computed: { relatedName: "$related.name" },
  },
});
Wire full chain: repository.list → service.list → controller.list → route GET /list

Query params: search, page (default 1), limit (default 10, max 100).

Response: { success: true, data: { items, total, page, limit } }

Backend: Account Payments
Flow	Balance	Transaction accountField
Sale payment (money in)
increaseBalance
toAccount
Purchase / expense payment (money out)
decreaseBalance
fromAccount
Sale exchange (change out)
decreaseBalance
fromAccount
Purchase exchange (change in)
increaseBalance
toAccount
Delete (reverse payment)
opposite of create
—
After balance update:

const txPayload = PayloadBuilder.transaction(accounts, {
  type: "purchase" | "sale" | "expense" | "exchange",
  typeID: doc._id,
  typeModel: "Purchase" | "Sale" | "Expense",
  accountField: "fromAccount" | "toAccount",
  date,
  note: note ?? "",
  status: "completed",
  contactID,  // when applicable
});
await TransactionService.create(txPayload, session);
Sale/purchase with contact also use:

PayloadBuilder.ledger(...) → LedgerService.create
ContactService.balanceUpdate(contactID, amount, session)
Expense: accounts + transactions only — no ledger, no contact.

Delete reversal: increaseBalance/decreaseBalance (opposite) → TransactionService.deleteTransactions({ typeID, typeModel }) → delete document.

Backend: Create Checklist

 Validator + type inferred from Zod

 Pre-transaction validation (contact exists, stock, type exists)

 Transaction with session on all writes

 Repository maps ObjectIds (don't call models from service)

 Payment block only when paid > 0 && accounts.length > 0

 PayloadBuilder includes "expense" / "Expense" if needed

 List endpoint implemented and route uncommented

 Delete endpoint wired if create exists
Frontend: Layout
src/pages/<Feature>/NewXxx.tsx    create form
src/pages/<Feature>/XxxList.tsx   paginated table
src/validators/<feature>.validator.ts
src/types/type.ts                 add XxxListItem, etc.
src/routes/router.tsx             register paths
src/routes/admin.routes.tsx       sidebar links
Frontend: API Calls
import api from "../../lib/axios";
// List
const res = await api("/xxx/list", { params: { search, limit, page } });
if (res.data.success) setData(res.data.data);
// Create
const result = createXxxSchema.safeParse(payload);
if (!result.success) { toast.error(result.error.issues[0].message); return; }
const res = await api.post("/xxx/create", result.data);
if (res.data.success) navigate("/xxx/list");
Axios auto-toasts success on non-GET via response.data.msg. Errors use toast.error(error.response?.data?.message).

Frontend: List Page Template
const [data, setData] = useState<PaginatedResult<XxxListItem>>({
  items: [], total: 0, page: 1, limit: 10,
});
const [search, setSearch] = useState("");
const [limit, setLimit] = useState(10);
const [page, setPage] = useState(1);
const fetchData = async () => {
  const res = await api("/xxx/list", { params: { search, limit, page } });
  if (res.data.success) setData(res.data.data);
};
useEffect(() => { fetchData(); }, [limit, page]);
useEffect(() => {
  const t = setTimeout(fetchData, 400);
  return () => clearTimeout(t);
}, [search]);
UI: TableFilterBar + Table + Pagination. Use Helper.formatLongNumber() for money, TimeAgo for dates.

Delete confirm: sonner toast with action/cancel (see PurchaseList.tsx).

Frontend: Create Page Template
Fetch dependencies in useEffect (Promise.all)
react-select with getReactSelectStyles<SelectOption<T>>()
Map API data → { value: _id, label: name, ...entity }
PaymentByAccounts from components/Ui/PaymentOption.tsx for paid flows
Default account pattern:
const defaultAccount = formatted.find(a => a.default);
setAccounts(formatted.filter(a => !a.default));
if (defaultAccount) setSelectedAccounts([defaultAccount]);
Submit:
const accounts = selectedAccounts
  .filter(a => a.amount > 0)
  .map(a => ({ accountID: a.value, amount: a.amount }));
const paid = accounts.reduce((s, a) => s + a.amount, 0);
createXxxSchema.safeParse({ ... }) before POST
Navigate to list on success
Frontend: Types
Add to src/types/type.ts:

export type XxxListItem = {
  _id: string;
  // fields matching backend projection.computed + include
};
SelectOption<T> = { value: string; label: string } & T
AccountOption = SelectOption<Account> & { amount: number; type: string }

Full-Stack Feature Workflow
Adding module foo
Backend

Create 7 files under src/foo/
paginatedAggregate in foo.repository.ts → list
Transaction create/delete in foo.service.ts
Register route in allRoutes.ts
Frontend

FooListItem in type.ts
foo.validator.ts (mirror backend)
NewFoo.tsx + FooList.tsx
Routes in router.tsx + admin.routes.tsx
List calls /foo/list — not another module's endpoint
Pitfalls (this codebase)
List route commented out — frontend gets empty { items: [], total: 0 } or 404
Service calls Mongoose models directly — use repository
createExpense/list mismatch — create works but list never wired
ExpenseList calling /product/list — copy-paste bug
Wrong Mongo lookup collection — verify with Model.collection.name
paymentAccountSchema requires amount >= 0.1 per account
PaymentByAccounts import path is PaymentOption.tsx
Endpoint naming inconsistent — match existing module (/createExpense vs /create)
Transaction rollback — if payment step fails, whole create rolls back; surface error to UI
List item types must match projection.computed field names from backend
Reference Modules
Pattern	Read
Full financial flow
purchase.service.ts, sale.service.ts
Simple stock only
damage.service.ts
Expense (payment, no ledger)
expense.service.ts
Paginated list
purchase.repository.ts list()
Frontend list
PurchaseList.tsx, DamageList.tsx
Frontend create + payment
NewExpense.tsx, NewPurchase patterns
Expense types CRUD
ExpenseTypes.tsx (working reference)
---
## Optional: `reference.md` (same folder)
For longer examples (full `create`/`delete` flows, `aggregateOne` for invoice detail), put them in `reference.md` and link from the skill:
```markdown
## Additional resources
- Full module examples: [reference.md](reference.md)
How to use it
Save the skill file to .cursor/skills/inventory-stack/SKILL.md in your repo (or ~/.cursor/skills/ for all projects).
In Cursor, mention it: "Follow the inventory-stack skill and add a damage return module" or add it as a project rule.
The description field helps the agent auto-discover it when you mention sale, purchase, expense, paginated list, etc.
