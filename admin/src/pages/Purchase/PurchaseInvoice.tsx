import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import api from '../../lib/axios';
import Table from '../../components/tables/Table';
import Helper from '../../utils/helper';
import Barcode from "react-barcode";
import { printInvoice } from '../../utils/globalPrinter';

const PurchaseInvoice = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const fetchPurchaseDetails = async () => {
    const res = await api(`/purchase/purchaseInvoiceByID/${id}`)
    if (res.data.success === true) {
      setData(res.data.data);

    }
  }
  useEffect(() => { fetchPurchaseDetails() }, [])
  const handlePrint = () => {
    printInvoice(printRef)
  }
  return (
    <div className='px-2' ref={printRef}>
      <div className='flex justify-between my-2'>
        {/* top left side business name and address */}
        <div className=''>
          <h1>Shokher bajar</h1>
          <address>Nobinagar notun mosjid</address>
          <h1>mobile:01769546456</h1>
        </div>
        {/* top left side business name and address */}
        <div className=''>
          <h1>{data?.invoiceNo}</h1>
          <Barcode value={data?.invoiceNo} height={25}
            width={2}
            fontSize={0}
            displayValue={false} margin={3} />
          <h1>Supplier :{data?.supplier?.name}</h1>
          <address>{data?.supplier?.address}</address>
          <h1>Mobile : {data?.supplier?.mobile}</h1>
          <h1>Purchased At : {Helper.formatDate(data?.purchaseDate)}</h1>
        </div>
      </div>

      <Table
        data={data?.batches || []}
        keyExtractor={(row: any) => row.id}
        columns={[
          {
            header: "#",
            accessor: (_, i) => (i ?? 0) + 1,
            className: "w-10 text-center",
            headerClassName: "text-center"
          },
          {
            header: "Name",

            accessor: (row) => (
              <div>
                <h1 className='w-full text-[16px]'>{row.product.name}{row.product.brand ? `(${row.product.brand.name})` : ""}</h1>
                {row.serial && <span>SN:</span>}
                {row.serial && <span className='dark:bg-[#494949] px-2 text-xs'>{row.serial}</span>}
              </div>


            ),
            headerClassName: "min-w-[200px] text-left"
          },

          {
            header: "QTY",
            accessor: (row) => (
              <>  {row.purchasedQty} {row.product.unit.name}</>

            ),
            className: "w-10 text-center",
            headerClassName: "text-center"
          },
          {
            header: "Purchase Price",
            accessor: (row) => (
              <>  {Helper.formatLongNumber(row.cost)}</>

            ),
            className: "w-10 text-center",
            headerClassName: "text-center"
          },
          {
            header: "Total",
            accessor: (row) => (
              <>  {Helper.formatLongNumber(row.purchasedQty * row.cost)} </>

            ),
            className: "w-10 text-end",
            headerClassName: "text-right"
          },

        ]}
        footer={(colCount) => (
          <tr>
            <td colSpan={colCount - 1} className="text-left font-bold">
              Total
            </td>
            <td className="text-end font-bold">
              {Helper.formatLongNumber(
                data?.batches?.reduce(
                  (sum: number, row: any) => sum + row.purchasedQty * row.cost,
                  0
                )
              )}
            </td>
          </tr>
        )}
      />
      {/* Other COst */}
      {!!data?.otherCost && <div className='flex justify-between'>
        <h1>{data?.costName}</h1>
        <h1>{data?.otherCost}</h1>
      </div>}
      {/* Other COst */}
      {!!data?.discount && <div className='flex justify-between'>
        <h1>Discount : </h1>
        <h1>{Helper.formatLongNumber(data?.discount)}</h1>
      </div>}

        {!!data?.totalAmount && <div className='flex justify-between'>
        <h1>Total Payable : </h1>
        <h1>{Helper.formatLongNumber(data?.totalAmount)}</h1>
      </div>}
      {!!data?.paid && <div className='flex justify-between'>
        <h1>Total Paid : </h1>
        <h1>{Helper.formatLongNumber(data?.paid)}</h1>
      </div>}
      {!!data?.balanceAfter && <div className='flex justify-between'>
        <h1>My Due : </h1>
        <h1>{Helper.formatLongNumber(data?.balanceAfter)}</h1>
      </div>}

      {/* Payment */}
      <hr  className='my-5'/>
      <h1>Payment History</h1>
      {
        data?.transactions?.map((a:any)=>{
          return (
             <div className='flex justify-between'>
        <h1>{a.source} : </h1>
        <h1>{Helper.formatLongNumber(a?.amount)}</h1>
      </div>
          )
        })
      }

      {/* Note */}
      {!!data?.note && <h1>Note : {data?.note}</h1>}

      <button onClick={handlePrint} className='global_button my-5 sm:w-fit w-full' id='no-print'>Print Invoice</button>
    </div>
  )
}

export default PurchaseInvoice