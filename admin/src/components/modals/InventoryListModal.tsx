import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Batch, Product, Variant, VariantListItem } from "../../types/type";
import api from "../../lib/axios";
import Table from "../tables/Table";
import Helper from "../../utils/helper";
import TimeAgo from "../Ui/TimeAgo";

type InventoryListModalProps = {
    isOpen: boolean;
    close: () => void;
    variant: VariantListItem;
}

export default function InventoryListModal({ isOpen, close, variant }: InventoryListModalProps) {
    const [batches, setBatches] = useState<Batch[] | []>([]);
    const fetchBatches = async () => {
        const res = await api(`/variant/batchByVariant/${variant.id}`);
        if (res.data.success) setBatches(res.data.data);
    }


    useEffect(() => { fetchBatches() }, [variant]);

    if (!isOpen) {
        return null
    }

    return createPortal(
        <div
            onClick={close}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 lg:p-4 p-2"
        >
            <div
                className="bg-white dark:bg-[#1E2939] text-black dark:text-white rounded-lg lg:p-6 p-2 max-w-xl w-full lg:mx-2 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold mb-4">Product Inventory</h2>
                <h1 className="text-lg font-medium uppercase">{variant.product.name}</h1>

                <Table
                    data={batches}
                    keyExtractor={(row) => row.id}
                    columns={[
                        { header: "#", accessor: (_, i) => (i ?? 0) + 1, className: "w-10 text-center", headerClassName: "text-center", },
                        {
                            header: "Purchase Date", accessor: (row) =>

                                <h1 className="flex justify-center">{Helper.formatDate(row.PurchaseDate)} | <TimeAgo date={row.PurchaseDate} /></h1>, headerClassName: "min-w-[200px]"
                        },
                        {
                            header: "Stock", accessor: (row) =>
                                <h1 className="flex justify-center">{row.remainingQty} {variant.product.unit.name}</h1>, headerClassName: "min-w-[200px]"
                        },

                    ]}
                />

                <button onClick={close} className="global_button_red">
                    Cancel
                </button>

            </div>
        </div>,
        document.body
    );
}