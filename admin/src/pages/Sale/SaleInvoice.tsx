import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import api from '../../lib/axios';
import Table from '../../components/tables/Table';
import Helper from '../../utils/helper';
import Barcode from "react-barcode";
import { printInvoice } from '../../utils/globalPrinter';

const SaleInvoice = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const fetchSaleDetails = async () => {
    const res = await api(`/sale/saleByID/${id}`)
    if (res.data.success === true) {
      setData(res.data.data);

    }
  }
  useEffect(() => { fetchSaleDetails() }, [])
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
          <h1>Customer :{data?.customer?.name}</h1>
          <address>{data?.customer?.address}</address>
          <h1>Mobile : {data?.customer?.mobile}</h1>
          <h1>Sold At : {Helper.formatDate(data?.saleDate)}</h1>
        </div>
      </div>

      <Table
        data={data?.products || []}
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
                {row.batch?.serial && <span>SN:</span>}
                {row.batch?.serial && <span className='dark:bg-[#494949] px-2 text-xs'>{row.batch.serial}</span>}
              </div>


            ),
            headerClassName: "min-w-[200px] text-left"
          },
          ...(data?.products?.some((p: any) => !!p.warranty)
            ? [
              {
                header: "Warranty",
                className: "text-center",
                headerClassName: "text-center",
                accessor: (row: any) => (
                  <>
                    {row.warranty > 0 && <h1>{row.warranty ?? 0} Days</h1>}
                  </>
                ),
              },
            ]
            : [])

          ,

          {
            header: "QTY",
            accessor: (row) => (
              <>  {row.soldQty} {row.product.unit.name}</>

            ),
            className: "w-10 text-center",
            headerClassName: "text-center"
          },
          {
            header: "Sale Price",
            accessor: (row) => (
              <>  {Helper.formatLongNumber(row.salePrice)}</>

            ),
            className: "w-10 text-center",
            headerClassName: "text-center"
          },
          {
            header: "Total",
            accessor: (row) => (
              <>  {Helper.formatLongNumber(row.soldQty * row.salePrice)} </>

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
                data?.totalProductPrice
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
          {!!data?.balanceBefore && (data?.balanceBefore <0 )? <div className='flex justify-between'>
        <h1>Prev. Due : </h1>
        <h1>{Helper.formatLongNumber(Math.abs(data?.balanceBefore))}</h1>
      </div>:<div className='flex justify-between'>
        <h1>Paid By Balance : </h1>
        <h1>{Helper.formatLongNumber(Math.abs(data?.balanceBefore))}</h1>
      </div>}
      {!!data?.totalAmount && <div className='flex justify-between'>
        <h1>Total Payable : </h1>
        <h1>{Helper.formatLongNumber(data?.totalAmount - (data?.balanceBefore || 0))}</h1>
      </div>}
      {!!data?.paid && <div className='flex justify-between'>
        <h1>Total Paid : </h1>
        <h1>{Helper?.formatLongNumber(data?.paid)}</h1>
      </div>}
      {!!data?.balanceAfter && (data?.balanceAfter <0 )? <div className='flex justify-between'>
        <h1>Current Due : </h1>
        <h1>{Helper.formatLongNumber(Math.abs(data?.balanceAfter))}</h1>
      </div>:<div className='flex justify-between'>
        <h1>Advanced : </h1>
        <h1>{Helper.formatLongNumber(Math.abs(data?.balanceAfter))}</h1>
      </div>}

      {/* Payment */}
      <hr className='my-5' />
      <h1>Payment History</h1>
      {
        data?.accounts.map((a: any) => {
          return (
            <div className='flex justify-between'>
              <h1>{a.name} : </h1>
              <h1>{Helper.formatLongNumber(a?.amount)}</h1>
            </div>
          )
        })
      }

            {/* Exchange */}
      <hr className='my-5' />
      <h1>Exchange History</h1>
      {
        data?.exchangeAccounts.map((a: any) => {
          return (
            <div className='flex justify-between'>
              <h1>{a.name} : </h1>
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

export default SaleInvoice