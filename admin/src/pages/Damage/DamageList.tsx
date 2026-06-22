import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Table from "../../components/tables/Table";
import TableFilterBar from "../../components/filters/TableFilterBar";
import Pagination from "../../components/filters/Pagination";
import { Trash, Undo2 } from "lucide-react";
import { Link } from "react-router";
import type { PaginatedResult } from "../../types/type";
import TimeAgo from "../../components/Ui/TimeAgo";
import Helper from "../../utils/helper";
import toast from "react-hot-toast";

export default function DamageList() {
    const [data, setData] = useState<PaginatedResult<any>>({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
    });
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);

    const fetchDamages = async () => {
        const res = await api("/damage/list", {
            params: { search, limit, page },
        });
        if (res.data.success) setData(res.data.data);
    };

    useEffect(() => {
        fetchDamages();
    }, [limit, page]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchDamages() }, 400)
        return () => clearTimeout(timer);
    }, [search]);

    const handleDelete = async (id: string) => {
        const res = await api.delete(`/damage/delete/${id}`)

        if (res.data.success) {
            return await fetchDamages();
        } else {
            return toast.error(res.data.msg);
        }
    }


    const totalPages = Math.ceil(data.total / data.limit);

    return (
        <div className=" space-y-4">
            <TableFilterBar
                title="Products"
                subtitle={`Total: ${data.total}`}
                search={search}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
                addHref="/product/new"
                addLabel="New Product"
                limit={limit}
                onLimitChange={(val) => { setLimit(val); setPage(1); }}
            />

            <Table
                data={data.items}
                keyExtractor={(row) => row._id}
                columns={[
                    {
                        header: "Invoice", accessor: (row, i) => (

                            <Link to={`/sale/invoice/${row._id}`}
                                className="text-sm"
                            >
                                {i as number + 1}
                            </Link>

                        ), className: "text-start", headerClassName: "text-start",
                    },
                    {
                        header: "Name", accessor: (row) => (
                            <h1> {row.productName}      {!!row.serial && <span> | SN: ({row.serial}) </span>}</h1>
                        ), headerClassName: "text-start"
                    },
                    { header: "Reason", accessor: "reason", headerClassName: "text-start" },
                    {
                        header: "Other Cost", accessor: (row) => (
                            <span> {Helper.formatLongNumber(row.otherCost || 0)}</span>

                        ), className: "text-center"
                    },
                    {
                        header: "P. Price", accessor: (row) => (
                            <span> {Helper.formatLongNumber(row.purchasePrice)}</span>

                        ), className: "text-center"
                    },
                    {
                        header: "Damage Qty", accessor: (row) => (
                            <span> {Helper.formatLongNumber(row.damagedQty)}</span>

                        ), className: "text-center"
                    },


                    {
                        header: "Total Loss", accessor: "totalLoss", className: "text-center"
                    },



                    {
                        header: "Date",
                        className: "text-center",
                        headerClassName: "text-center min-w-20",
                        accessor: (row) => (

                            <TimeAgo date={row.DamageDate} />

                        )

                    },

                    {
                        header: "Action",
                        headerClassName: "text-right",
                        className: "text-right",
                        accessor: (row) => (
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => handleDelete(row._id)} className="global_button_red"><Trash size={15} /></button>
                            </div>
                        ),
                    },
                ]}
            />

            {/* Pagination */}
            <Pagination
                total={data.total}
                page={page}
                limit={limit}
                onPageChange={setPage}
            />
        </div>
    );
}