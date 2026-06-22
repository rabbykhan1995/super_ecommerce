import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type {
  Account,
  AccountOption,
  ExpenseType,
  SelectOption,
} from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import { createExpenseSchema } from "../../validators/expense.validator";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { createPortal } from "react-dom";
import "react-datepicker/dist/react-datepicker.css";
import PaymentByAccounts from "../../components/Ui/PaymentOption";

export default function NewExpense() {
  const navigate = useNavigate();
  const [expenseTypes, setExpenseTypes] = useState<SelectOption<ExpenseType>[]>(
    [],
  );
  const [expenseDate, setExpenseDate] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");
  const [selectedExpenseType, setSelectedExpenseType] =
    useState<SelectOption<ExpenseType> | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenseTypes = async () => {
    const res = await api("/expense/all-expenseTypes");
    if (res.data.success) {
      setExpenseTypes(
        res.data.data.map((t: ExpenseType) => ({
          value: t._id,
          label: t.name,
          ...t,
        })),
      );
    }
  };

  const fetchAccounts = async () => {
    const res = await api("/account/list");
    if (res.data.success) {
      const formatted: AccountOption[] = res.data.data.map((a: Account) => ({
        ...a,
        label: a.name,
        value: a._id,
        amount: 0,
        type: "Debit",
      }));

      const defaultAccount = formatted.find((a) => a.default === true);
      const rest = formatted.filter((a) => a.default !== true);

      setAccounts(rest);
      if (defaultAccount) {
        setSelectedAccounts([defaultAccount]);
      }
    }
  };

  useEffect(() => {
    Promise.all([fetchExpenseTypes(), fetchAccounts()]);
  }, []);

  const paidWithAcc = selectedAccounts.reduce(
    (acc, a) => acc + (a.amount || 0),
    0,
  );

  const createExpense = async () => {
    if (!selectedExpenseType) {
      toast.error("Expense type is required");
      return;
    }

    if (paidWithAcc <= 0) {
      toast.error("Payment amount must be greater than 0");
      return;
    }

    const accountsPayload = selectedAccounts
      .filter((a) => a.amount > 0)
      .map((a) => ({
        accountID: a.value,
        amount: a.amount,
      }));

    const payload = {
      expenseDate,
      expenseTypeID: selectedExpenseType.value,
      accounts: accountsPayload,
      note: note.trim() || undefined,
      paid: paidWithAcc,
      documentImage: null,
    };

    const result = createExpenseSchema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/expense/createExpense", result.data);
      if (res.data.success) {
        toast.success(res.data.msg ?? "Expense created successfully");
        navigate("/expense/list");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-2">
      <h2 className="global_heading col-span-2">New Expense</h2>

      <div className="relative col-span-1">
        <label className="block text-sm font-medium mt-1 mb-1">
          Select Expense Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <DatePicker
            selected={expenseDate}
            onChange={(date: Date | null) => date && setExpenseDate(date)}
            dateFormat="dd-MM-yyyy"
            className="global_input pl-10 w-full"
            popperPlacement="bottom"
            popperClassName="z-[9999]"
            calendarClassName="react-datepicker-custom"
            popperContainer={(props) =>
              createPortal(<div {...props} />, document.body)
            }
          />
        </div>
      </div>

      <div className="flex flex-col grid-cols-1">
        <label className="block text-sm font-medium mb-1">Expense Type</label>
        <Select
          options={expenseTypes}
          value={selectedExpenseType}
          onChange={(val) =>
            setSelectedExpenseType(val as SelectOption<ExpenseType> | null)
          }
          placeholder="Select Expense Type"
          isClearable
          styles={getReactSelectStyles<SelectOption<ExpenseType>>()}
        />
      </div>

      <div className="col-span-2">
        <PaymentByAccounts
          accounts={accounts}
          setAccounts={setAccounts}
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
        />
        <p className="text-sm text-gray-500 mt-2">
          Total paid: <strong>{paidWithAcc}</strong>
        </p>
      </div>

      <div className="col-span-2">
        <label className="block mb-2 font-medium">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="global_input min-h-[150px] w-full"
          placeholder="Optional note..."
        />
      </div>

      <button
        onClick={createExpense}
        type="button"
        disabled={submitting}
        className="global_button col-span-2 disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create Expense"}
      </button>
    </div>
  );
}
