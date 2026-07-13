import { useEffect, useState } from "react";
import api from "../../lib/axios";
import type { Account, Contact, PosSaleProduct, SelectOption, VariantListItem } from "../../types/type";
import Select from "react-select";
import { getReactSelectStyles } from "../../utils/reactSelectStyles";
import toast from "react-hot-toast";
import { Link, } from "react-router";
import type { Product, SearchParams, AccountOption } from "../../types/type";
import { Barcode, ImageOff, Trash } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import Table from "../../components/tables/Table";
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { createfifoSaleSchema } from "../../validators/sale.validator";
import PaymentByAccounts from "../../components/Ui/PaymentOption";
import Helper from "../../utils/helper";
import DarkLightToggle from "../../components/buttons/DarkLightToggle";
import IncrDecrButton from "../../components/buttons/IncrDecrButton";
import SaleInvoiceModal from "../../components/modals/SaleInvoiceModal";



export default function FifoSale() {
  useSignals();

  const [contactParams, setContactParams] = useState<SearchParams>({
    search: "",
    page: 1,
    limit: 50,
  });
  const [productParams, setProductParams] = useState<SearchParams>({
    search: "",
    page: 1,
    limit: 50,
  });
  const [barcode, setBarcode] = useState<string>("");
  const [products, setProducts] = useState<SelectOption<VariantListItem>[]>([]);
  const [posProducts, setPosProducts] = useState<Product[] | []>([]);
  const [customers, setCustomers] = useState<SelectOption<Contact>[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<SelectOption<Contact> | null>(null);
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const selectedProducts = useSignal<PosSaleProduct[]>([]);
  // serial is open with index, if index exist it open
  const [costName, setCostName] = useState<string | null>("");
  const [isExchanging, setIsExchanging] = useState<boolean>(false);
  const [otherCost, setOtherCost] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [note, setNote] = useState<string | null>("");
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<AccountOption[]>([]);
  const [exchangeAccounts, setExchangeAccounts] = useState<AccountOption[]>([]);
  const [selectedExchangeAccounts, setSelectedExchangeAccounts] = useState<AccountOption[]>([]);

  const [invoiceModal, setInvoiceModal] = useState<boolean>(false);
  const [printSize] = useState<number>(58);
  const [saleInvoiceID, setSaleInvoiceID] = useState<string | null>(null);

  const fetchPosProducts = async () => {
    const res = await api("/product/getPosProducts");
    if (res.data.success)
      setPosProducts(
        res.data.data
      );
  };
    const fetchProducts = async () => {
        const res = await api("/product/variant-list", {
            params: { search: productParams.search, limit: productParams.limit, page: productParams.page },
        });
        if (res.data.success)
            setProducts(
                res.data.data.items.map((u: VariantListItem) => ({ value: u.id, label: `${u.product.name} stock-${!u.product.manageStock ? " ∞" : u.stock}`, ...u }))
            );
    };


  const fetchContacts = async () => {
    const res = await api("/contact/list", {
      params: { search: contactParams.search, limit: contactParams.limit, page: contactParams.page, type: "customer" },
    });
    if (res.data.success) {
      const options = res.data.data.items.map((u: Contact) => ({
        value: u.id,
        label: `${u?.name} balance(${u?.balance})`,
        ...u
      }));

      return setCustomers(options)
    };
  };
    const fetchAccount = async () => {
        const res = await api("/account/list");
        if (res.data.success) {
            const formatted: AccountOption[] = res.data.data.map((a: Account) => ({
                ...a,
                label: a.name,
                value: a.id,
                amount: 0,
                type: "Debit"
            }));

            // default account আলাদা করো
            const defaultAccount = formatted.find((a) => a.isDefault === true);
            const rest = formatted.filter((a) => a.isDefault !== true);

            setAccounts(rest);
            setExchangeAccounts(rest);
            if (defaultAccount) {
                setSelectedAccounts([defaultAccount]);
                setSelectedExchangeAccounts([defaultAccount])
            };
        }
    };
  const fetchProductWithBarcode = async (barcode: string) => {
    const res = await api("/product/productByBarcode", {
      params: { barcode },
    });
    if (res.data.success) {
      const p = res.data.data;

      const product = { value: p.id, label: p.name, ...p };
      return handleAddProduct(product)
    } else {
      setBarcode("");
      return toast.error("No Product Found with This barcode")
    }

  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchContacts(), fetchAccount(), fetchPosProducts()]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchContacts(), 400);
    return () => clearTimeout(timer);
  }, [contactParams.search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 400);
    return () => clearTimeout(timer);
  }, [productParams.search]);

  const handleAddProduct = async (p: SelectOption<VariantListItem>) => {
    if (!p.product.manageStock) {
      const existing = selectedProducts.value.find(product => product.id === p.id);

      if (existing) {
        selectedProducts.value = selectedProducts.value.map(product =>
          product.id === p.id
            ? { ...product, soldQty: product.soldQty + 1 }
            : product
        );
      } else {
        selectedProducts.value = [...selectedProducts.value, { ...p.product, soldQty: 1, productID:p.productID, variantID: p.id }];
      }
      return;
    }

    if (p.product.manageStock && p.product.manageWarranty) {
      return toast.error("Please choose a different sale method");
    }

    if (p.product.manageStock && !p.product.manageWarranty) {
      const existing = selectedProducts.value.find(product => product.id === p.id);

      if (existing && existing.stock > existing.soldQty) {
        selectedProducts.value = selectedProducts.value.map(product =>
          product.id === p.id
            ? { ...product, soldQty: product.soldQty + 1 }
            : product
        );
      } else if (existing && existing.stock <= existing.soldQty) {
        return toast.error("No more stock available");
      } else {



        selectedProducts.value = [...selectedProducts.value, { ...p.product, soldQty: 1, stock: p.stock, salePrice: p.salePrice, productID:p.productID, variantID: p.id }];
      }
    }
  };

  const handleRemoveProduct = (idx: number) => {
    selectedProducts.value = selectedProducts.value.filter((_, i) => i !== idx);
  };

  const handleProductChange = (idx: number, field: string, value: number) => {
    selectedProducts.value = selectedProducts.value.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
  };
  const totalProductPrice = selectedProducts.value.reduce(
    (acc, p) => acc + (p.salePrice || 0) * (p.soldQty || 0),
    0
  );

  const prevBalance = selectedCustomer?.balance ?? 0;

  const prevDue = prevBalance < 0 ? -prevBalance : 0;
  const usableBalance = prevBalance > 0 ? prevBalance : 0;

  const basePayable = totalProductPrice - discount + otherCost;

  const totalPayableAmount =
    basePayable + prevDue - usableBalance;

  const paidWithAcc = selectedAccounts.reduce(
    (acc, a) => acc + (a.amount || 0),
    0
  );

  const adjustedPayable = basePayable - prevBalance;
  const currentBalance = paidWithAcc - adjustedPayable;
  const exchangeAmount = selectedExchangeAccounts.reduce(
    (acc, a) => acc + (a.amount || 0),
    0
  );

  useEffect(() => {
    if (!selectedCustomer) {
      setIsExchanging(false);
      setExchangeAccounts((prev) => [
        ...prev,
        ...selectedExchangeAccounts,
      ]);

      setSelectedExchangeAccounts([]);
      return setSelectedAccounts((prev) => {
        const updated = prev.map((a) =>
          a.isDefault
            ? {
              ...a,
              amount: totalPayableAmount,
            }
            : a
        );
        return updated;
      });
    }
  }, [totalPayableAmount])

  useEffect(() => {
    // jodi customer select na hoi ar paid beshi hoi
    if (!selectedCustomer && (currentBalance > 0)) {
      setIsExchanging(true);
      return setSelectedExchangeAccounts((prev) => {
        const updated = prev.map((a) =>
          a.isDefault
            ? {
              ...a,
              amount: currentBalance,
            }
            : a
        );
        return updated;
      });
    }
    // jodi customer select na hoi ar paid, amount er soman ba kom hoi
    if (!selectedCustomer && (currentBalance <= 0)) {
      return setIsExchanging(false)
    }
    //  // jodi customer select na hoi ar advance hoi ar exchange na hoi tokhon automatic exchange hobe,
    if (!selectedCustomer && (currentBalance > 0) && !isExchanging) {
      setIsExchanging(true);
      setSelectedExchangeAccounts((prev) => {
        const updated = prev.map((a) =>
          a.isDefault
            ? {
              ...a,
              amount: currentBalance,
            }
            : a
        );
        return updated;
      });
      toast.error("Exchange must occur in this situation");
      return;
    }
    // jodi customer select hoi ar due hoi, ar exchange o hoi tokhon exchanging desable hoye jabe
    if (selectedCustomer && (currentBalance < 0) && isExchanging) {
      setIsExchanging(false);
      return;
    }
    // jodi customer select hoi ar advance hoi, ar exchange o hoi tokhon exchanging desable hoye jabe
    if (selectedCustomer && (currentBalance > 0) && isExchanging) {
      setSelectedExchangeAccounts((prev) => {
        const updated = prev.map((a) =>
          a.isDefault
            ? {
              ...a,
              amount: currentBalance,
            }
            : a
        );
        return updated;
      });
      return;
    }


  }, [selectedCustomer, currentBalance, isExchanging]);

  useEffect(() => {
    if (!isExchanging) {
      setExchangeAccounts((prev) => [
        ...prev,
        ...selectedExchangeAccounts,
      ]);

      setSelectedExchangeAccounts([]);
      return;
    }

    if (isExchanging) {
      setSelectedExchangeAccounts((prev) => {
        const defaultAccount = exchangeAccounts.find((a) => a.isDefault);

        if (!defaultAccount) return prev;

        const updated = prev.some((a) => a.id === defaultAccount.id)
          ? prev
          : [
            {
              ...defaultAccount,
              amount: currentBalance,
            },
          ];

        return updated;
      });
    }
  }, [isExchanging])

  const handleReset = async () => {
    setBarcode("");

    setSelectedCustomer(null);

    setSaleDate(new Date());

    selectedProducts.value = [];

    setCostName("");

    setIsExchanging(false);

    setOtherCost(0);
    setDiscount(0);
    setDiscountPercent(0);

    setNote("");


    setSaleInvoiceID(null);

    await Promise.all([fetchAccount]);
  };
  const createSale = async () => {
    if (selectedProducts.value.length === 0) {
      return toast.error("Please add at least one product");
    }

    // ✅ Products structure - backend অনুযায়ী
    const products = selectedProducts.value.map(p => ({
      productID: p.productID,
      variantID: p.variantID,
      soldQty: 1,
      salePrice: p.salePrice,
    }));

    // ✅ Accounts structure
    const accounts = selectedAccounts.map(a => ({
      accountID: a.value,
      amount: a.amount,
    }));

    const exchangeAccounts = selectedExchangeAccounts.map(a => ({
      accountID: a.value,
      amount: a.amount,
    }));

    if (!selectedCustomer && paidWithAcc < totalPayableAmount) {
      return toast.error(`You have to pay ${totalPayableAmount} TK`)
    }

    if (isExchanging && (currentBalance > 0) && (exchangeAmount !== currentBalance) && (exchangeAmount <= 0)) {
      return toast.error("You must have return the full exchange amount, not less or more.");
    }


    // ✅ Sale object - backend অনুযায়ী
    const sale = {
      customerID: selectedCustomer?.value || null, // ✅ customerID
      paid: paidWithAcc,
      costName: costName || null,
      otherCost: costName ? otherCost : 0,
      totalProductPrice,
      exchangeAmount,
      discount,
      totalAmount: basePayable,
      note: note || null,
      saleDate, // ✅ Date object
      balanceBefore: selectedCustomer?.balance || 0,
      balanceAfter: !isExchanging ? currentBalance : selectedCustomer?.balance,
    };

    // ✅ Validate
    const saleResult = createfifoSaleSchema.safeParse({
      products,
      accounts,
      exchangeAccounts,
      sale
    });



    if (!saleResult.success) {
      const firstError = saleResult.error.issues[0];
      toast.error(firstError.message);
      console.error("Validation errors:", saleResult.error.issues);
      return;
    }

    try {
      const res = await api.post('/sale/create-fifo-sale', saleResult.data);

      if (res.data.success === true) {
        toast.success(res.data.msg || "Sale created successfully!");
        setSaleInvoiceID(res.data.data.id);
        setTimeout(() => {
          setInvoiceModal(true);
        }, 50);

        setTimeout(() => {
          handleReset();
        }, 500);

      } else {
        toast.error(res.data.message || "Failed to create sale");
      }
    } catch (error: any) {
      console.error("Sale creation error:", error);
      const errorMsg = error.response?.data?.message || "Error creating sale";
      toast.error(errorMsg);
    }
  };
  return (
    <div>
      <nav className="h-[5vh] w-full px-2 border-b border-[#d6d6d6] dark:border-[#4d4d4d] flex items-center justify-between"><Link to={'/'} className="global_button">Dashboard</Link><DarkLightToggle /></nav>
      {/* Left PosProduct+ Center Table + Right Summary*/}
      <div className="flex h-[95vh]">
        {/* Pos Product */}
        <div className="overflow-y-auto h-full w-2/8 border-r border-[#d6d6d6] dark:border-[#4d4d4d]">
          <div className="grid grid-cols-3 gap-1 p-1">
            {posProducts.map((p, i) => {
              return (
                <div key={i}

                  onClick={() => {
                    const variantID = (p as any).variant?.id || p.id;
                    handleAddProduct({
                      ...p,
                      value: variantID,
                      label: p.name,
                      id: variantID,
                      productID: p.id,
                      product: p as any,
                    } as unknown as SelectOption<VariantListItem>)
                  }}
                  className="text-sm hover:scale-102 border border-gray-300 dark:border-zinc-700 rounded-sm p-1 flex items-center flex-col">
                  {
                    !!p.thumbnail ?
                      <img src={p.thumbnail} alt="adfsfssdf445634" />
                      :
                      <ImageOff size={50} />
                  }
                  <h1 className="text-xs">{p.name}</h1>
                  <h3>{p.salePrice}</h3>
                </div>
              )
            })}
          </div>
        </div>
        {/* Product + Table */}
        <div className="overflow-y-auto h-full w-4/8 border-r border-[#d6d6d6] dark:border-[#4d4d4d]">
          {/* Selector and Barcode */}
          <div className="flex gap-1 p-1">
            {/* Product */}
            <div className="flex flex-col w-3/5">

              <Select
                options={products}
                value={null}
                onChange={(val) => handleAddProduct(val as SelectOption<VariantListItem>)}
                onInputChange={(e) => setProductParams(prev => ({ ...prev, search: e }))}
                placeholder="Select Product"
                isClearable
                styles={getReactSelectStyles<SelectOption<VariantListItem>>()}
              />
            </div>
            {/* Product With Barcode */}
            <div className="relative w-2/5">
              <input
                value={barcode}
                onChange={(e) => {
                  setBarcode(e.target.value);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    fetchProductWithBarcode((e.target as HTMLInputElement).value);
                  }
                }}
                className="global_input"
                placeholder="Scan With Barcode"
              />
              <Barcode size={20} className="absolute top-1/2 -translate-y-1/2 right-2" />
            </div>
          </div>
          {/* Table */}
          <Table
            data={selectedProducts.value}
            keyExtractor={(row, i) => `${row.id}-${i}`}
            columns={[
              // #
              {
                header: "#",
                accessor: (_, i) => (i ?? 0) + 1,
                className: "w-10 text-center",
                headerClassName: "text-center text-sm"
              },
              // Name
              {
                header: "Name",
                accessor: (row,) => (
                  <h1>{row.name} ({row.stock})</h1>
                ),
                headerClassName: "min-w-[200px] text-left text-sm"
              },


              // Price
              {
                header: "Price",
                className: "text-center",
                headerClassName: "text-center text-sm",
                accessor: (row, i) => (
                  <input
                    type="number"
                    value={row.salePrice === 0 ? "" : row.salePrice}
                    onChange={(e) => handleProductChange(i as number, "salePrice", e.target.value === "" ? 0 : Number(e.target.value))}
                    className="global_input text-center w-24"
                  />
                ),
              },
              // Qty
              {
                header: "Qty",
                className: "text-center",
                headerClassName: "text-center text-sm",
                accessor: (row, i) => (
                  <div className="flex justify-center">
                    <IncrDecrButton
                      currentQty={row.soldQty}
                      min={row.decimal ? 0.01 : 1}
                      max={row.manageStock ? row.stock : Infinity}
                      decimal={row.decimal}
                      onChange={(value) =>
                        handleProductChange(i as number, "soldQty", value)
                      }

                    />
                  </div>
                ),
              },
              // Total
              {
                header: "Total",
                className: "text-center",
                headerClassName: "text-center",
                accessor: (row) => (
                  <span>{Helper.formatLongNumber(row.salePrice * row.soldQty)}</span>
                ),
              },
              // Action
              {
                header: "A.",
                headerClassName: "text-right",
                className: "text-right",
                accessor: (_, i) => (
                  <button
                    onClick={() => handleRemoveProduct(i as number)}
                    className="global_button_red"
                  >
                    <Trash size={14} />
                  </button>
                ),
              },
            ]}
          />
        </div>
        {/* Customer & Summary */}
        <div className="w-2/8 p-1">
          {/* Customer */}
          <div className="w-full">
            <Select
              options={customers}
              onChange={(val) => setSelectedCustomer(val as SelectOption<Contact> | null)}
              onInputChange={(e) => setContactParams(prev => ({ ...prev, search: e }))}
              filterOption={() => true}
              placeholder="Select Customer"
              isClearable
              styles={getReactSelectStyles<SelectOption<Contact>>()}
            /></div>
          {/* Summary */}
          <div className="flex-1 space-y-3 py-2 text-sm">
            <h1>Summary</h1>
            {/* Total Product Price */}
            <div className="flex justify-between">
              <label>Total Product Price:</label>
              <input type="number" value={totalProductPrice.toFixed(2)} disabled
                className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
            </div>
            {/* Discount % */}
            <div className="flex justify-between">
              <label>Discount %:</label>
              <input
                type="number"
                value={discountPercent === 0 ? "" : discountPercent}
                onChange={(e) => {
                  const percent = e.target.value === "" ? 0 : Number(e.target.value);
                  setDiscountPercent(percent);
                  setDiscount(parseFloat(((percent / 100) * totalProductPrice).toFixed(2)));
                }}
                className="global_input w-40 rounded-sm text-right" min="0" max="100"
              />
            </div>
            {/* Discount Amount */}
            <div className="flex justify-between">
              <label>Discount Amount:</label>
              <input
                type="number"
                value={discount === 0 ? "" : discount}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                  setDiscount(val);
                  setDiscountPercent(totalProductPrice > 0 ? parseFloat(((val / totalProductPrice) * 100).toFixed(2)) : 0);
                }}
                className="global_input w-40 rounded-sm text-right" min="0"
              />
            </div>
            {/* Total Amount */}
            <div className="flex justify-between font-medium border-t pt-2">
              <label>Total Amount:</label>
              <input type="number" value={basePayable.toFixed(2)} disabled
                className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
            </div>
            {/* Previous Due */}
            {selectedCustomer && prevDue > 0 && (
              <div className="flex justify-between">
                <label>Customer Prev Due:</label>
                <input type="number" value={prevDue.toFixed(2)} disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right text-red-500" />
              </div>
            )}
            {/* Advance */}
            {selectedCustomer && usableBalance > 0 && (
              <div className="flex justify-between">
                <label>Adv. Paid from Bal.</label>
                <input type="number" value={prevBalance.toFixed(2)} disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
              </div>
            )}
            {/* Payable */}
            <div className="flex justify-between font-medium">
              <label>Payable:</label>
              {basePayable - (usableBalance) > 0 ?
                <input type="number" value={(totalPayableAmount).toFixed(2)} disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right" />
                :
                <input type="number" value={0} disabled
                  className="global_input w-40 rounded-sm cursor-not-allowed text-right" />}
            </div>

            {/* Payment By */}
            <PaymentByAccounts
              accounts={accounts}
              setAccounts={setAccounts}
              selectedAccounts={selectedAccounts}
              setSelectedAccounts={setSelectedAccounts}
            />

            {/* Paid */}
            <div className="flex justify-between">
              <label>Total Paid:</label>
              <input type="number" value={paidWithAcc.toFixed(2)} disabled
                className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
            </div>
            {(() => {
              // Current Due
              if (currentBalance < 0) return (
                <div className="flex justify-between font-semibold border-t pt-2">
                  <label>Cus. Due Will Be:</label>
                  <input type="number" value={Math.abs(currentBalance).toFixed(2)} disabled
                    className="global_input w-40 rounded-sm cursor-not-allowed text-right text-red-500" />
                </div>
              );
              // Advance Paid
              if (!isExchanging && (currentBalance > 0)) return (
                <div className="flex justify-between font-semibold border-t pt-2">
                  <label>Cus. Bal. Will Be:</label>
                  <input type="number" value={Math.abs(currentBalance).toFixed(2)} disabled
                    className="global_input w-40 rounded-sm cursor-not-allowed text-right text-green-500" />
                </div>
              );

              return null;
            })()}
            {/* Exchange button */}
            {(currentBalance > 0) && (
              <div className="flex justify-between font-semibold border-t pt-2">
                <button className="global_button" onClick={() => setIsExchanging(!isExchanging)}>{isExchanging ? `Exchanging - ${exchangeAmount}` : "Not Exchanging"}</button>
              </div>
            )}

            {/* Exchange Payment By */}
            {!!isExchanging && <PaymentByAccounts
              title="Exchange by"
              accounts={exchangeAccounts}
              setAccounts={setExchangeAccounts}
              selectedAccounts={selectedExchangeAccounts}
              setSelectedAccounts={setSelectedExchangeAccounts}
            />}

          </div>
          <button type="button" className="global_button w-full" onClick={createSale}>Sale</button>
        </div>

      </div>
      <SaleInvoiceModal isOpen={invoiceModal} close={() => {
        setInvoiceModal(false);
        setSaleInvoiceID(null);
      }} saleID={saleInvoiceID!} printSize={printSize} />
    </div>
  )
}
