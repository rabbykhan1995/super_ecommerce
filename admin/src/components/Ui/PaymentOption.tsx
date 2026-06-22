import Select from "react-select";
import { X } from "lucide-react";
import type {AccountOption } from "../../types/type";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";


type Props = {
  title?:string;
  accounts: AccountOption[];
  setAccounts: React.Dispatch<React.SetStateAction<AccountOption[]>>;
  selectedAccounts: AccountOption[];
  setSelectedAccounts: React.Dispatch<React.SetStateAction<AccountOption[]>>;
};

export default function PaymentByAccounts({ accounts, setAccounts, selectedAccounts, setSelectedAccounts, title=undefined }: Props) {

  const selectAccount = (account: AccountOption | null) => {
    if (!account) return;
    setSelectedAccounts((prev) => [...prev, { ...account, amount: 0 }]);
    setAccounts((prev) => prev.filter((a) => a.value !== account.value));
  };

  const unselectAccount = (account: AccountOption) => {
    setSelectedAccounts((prev) => prev.filter((a) => a.value !== account.value));
    setAccounts((prev) => [...prev, account]);
  };

  const handleAmountChange = (id: string, value: string) => {
    const newVal = value === "" ? 0 : Number(value);
    setSelectedAccounts((prev) =>
      prev.map((acc) => (acc.value === id ? { ...acc, amount: newVal } : acc))
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <h4>{title??"Payment By"}</h4>

      <div className="flex flex-col gap-2">
        {selectedAccounts.map((account, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full">
              <span className="text-nowrap">{account.label}</span>
           
                <button onClick={() => unselectAccount(account)}>
                  <X size={18} color="red" />
                </button>
           
            </div>
            <input
              type="number"
              value={account.amount === 0 ? "" : account.amount}
              onChange={(e) => handleAmountChange(account.value, e.target.value)}
              placeholder="Payment Amount"
              className={`w-40 rounded-sm outline-0 p-1.5 text-right border ${
                account.amount > 0 ? "border-2 border-green-500" : "border-red-500"
              }`}
            />
          </div>
        ))}
      </div>

      {accounts.length > 0 && (
        <Select<AccountOption>
          options={accounts}
          value={null}
          onChange={(val) => selectAccount(val as AccountOption)}
          placeholder="Select Account"
          styles={getReactSelectStyles<AccountOption>()}
          menuPortalTarget={document.body}
           menuPosition="fixed"
        />
      )}
    </div>
  );
}