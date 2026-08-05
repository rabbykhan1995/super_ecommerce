import { ApiError } from "../../utils/ApiError";
import {
  CreateParcelInput,
  CreateOrderPackInput,
  UpdateParcelInput,
  UpdateParcelStatusInput,
} from "./parcel.type";
import ParcelRepository from "./parcel.repository";
import SaleService from "../sale/sale.service";
import ContactService from "../contact/contact.service";
import ProductService from "../product/product.service";
import { OrderRepository } from "../order/order.repository";
import { withTransaction } from "../../utils/withTransaction";
import { QueryClient } from "../../drizzle/src";
import { CreateSaleInput } from "../sale/sale.type";

export default class ParcelService {
  static async create(payload: CreateParcelInput) {
    const sale = await SaleService.getSaleByID(payload.saleID);
    if (!sale) {
      throw new ApiError(404, "Sale not found");
    }

    const existingParcel = await ParcelRepository.findBySaleID(payload.saleID);
    if (existingParcel) {
      throw new ApiError(
        400,
        "A parcel already exists for this sale. Each sale can only have one parcel."
      );
    }

    let customerAddress = "";
    if (sale.customerID) {
      const customer = await ContactService.findByID(sale.customerID);
      if (customer?.address) {
        customerAddress = customer.address;
      }
    }

    const parcel = await ParcelRepository.create({
      saleID: payload.saleID,
      customerID: sale.customerID,
      address: payload.address,
      parcelType: payload.parcelType,
      courierName: payload.courierName ?? null,
      thirdPartyTrackingNo: payload.thirdPartyTrackingNo ?? null,
      localParcelNo: payload.localParcelNo ?? null,
      note: payload.note ?? null,
      shippingCost: payload.shippingCost ?? 0,
      codAmount: payload.codAmount ?? 0,
      dueAmount: payload.dueAmount ?? 0,
      parcelDate: payload.parcelDate,
    });

    return parcel;
  }

  static async createOrderPack(payload: CreateOrderPackInput) {
    const order = await OrderRepository.findOrderByID(payload.orderID);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.saleID) {
      throw new ApiError(400, "Order is already packed");
    }

    const packableStatuses = ["Pending", "Confirmed"];
    if (!packableStatuses.includes(order.status)) {
      throw new ApiError(
        400,
        `Order cannot be packed. Current status: ${order.status}`
      );
    }

    const resolvedItems: {
      productID: number;
      variantID: number;
      batchID: number;
      soldQty: number;
      salePrice: number;
      warranty: number | null;
    }[] = [];

    for (const item of payload.items) {
      const product = await ProductService.findById(item.productID);
      if (!product) {
        throw new ApiError(404, `Product not found: ${item.productID}`);
      }

      const variant = await ProductService.findVariantByID(item.variantID);
      if (!variant) {
        throw new ApiError(404, `Variant not found: ${item.variantID}`);
      }

      let batchID: number;

      if (product.manageWarranty) {
        if (!item.batchID) {
          throw new ApiError(
            400,
            `Serial product "${product.name}" requires batch selection`
          );
        }

        const batch = await ProductService.findBatchByID(item.batchID);
        if (!batch) {
          throw new ApiError(404, `Batch not found: ${item.batchID}`);
        }
        if (!batch.isActive) {
          throw new ApiError(400, `Batch is not active: ${item.batchID}`);
        }
        if (!batch.serial) {
          throw new ApiError(
            400,
            `Batch does not have a serial: ${item.batchID}`
          );
        }
        if (batch.remainingQty < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for "${product.name}". Available: ${batch.remainingQty}, requested: ${item.quantity}`
          );
        }

        batchID = batch.id;
      } else {
        const batches = await ProductService.findBatchesByVariantID(
          item.variantID
        );
        if (batches.length === 0) {
          throw new ApiError(
            400,
            `No available batch for "${product.name}"`
          );
        }

        let remaining = item.quantity;
        let selectedBatchID: number | null = null;

        for (const batch of batches) {
          if (remaining <= 0) break;
          const take = Math.min(batch.remainingQty, remaining);
          remaining -= take;
          selectedBatchID = batch.id;
        }

        if (remaining > 0) {
          throw new ApiError(
            400,
            `Insufficient stock for "${product.name}". Available: ${batches.reduce((s, b) => s + b.remainingQty, 0)}, requested: ${item.quantity}`
          );
        }

        batchID = selectedBatchID!;
      }

      resolvedItems.push({
        productID: item.productID,
        variantID: item.variantID,
        batchID,
        soldQty: item.quantity,
        salePrice: item.salePrice,
        warranty: item.warranty ?? null,
      });
    }

    const totalProductPrice = resolvedItems.reduce(
      (sum, item) => sum + item.salePrice * item.soldQty,
      0
    );
    const totalAmount = totalProductPrice - (payload.discount || 0);

    const saleInput: CreateSaleInput = {
      sale: {
        customerID: order.contactID,
        note: payload.note ?? order.note,
        costName: payload.costName,
        totalProductPrice,
        otherCost: 0,
        discount: payload.discount || 0,
        totalAmount,
        paid: payload.paid || 0,
        exchangeAmount: 0,
        balanceBefore: 0,
        balanceAfter: 0,
        saleDate: new Date(),
      },
      products: resolvedItems,
      accounts: payload.accounts || [],
      exchangeAccounts: payload.exchangeAccounts || [],
    };

    const result = await withTransaction(async (tx: QueryClient) => {
      const saleCreated = await SaleService.create(saleInput);

      for (const item of resolvedItems) {
        await ProductService.decreaseProductReservedStock(
          item.productID,
          item.soldQty,
          tx
        );
        await ProductService.decreaseVariantReservedStock(
          item.variantID,
          item.soldQty,
          tx
        );
      }

      await OrderRepository.updateOrderByID(
        order.id,
        { status: "Packed", saleID: saleCreated.id },
        tx
      );

      const existingParcel = await ParcelRepository.findBySaleID(
        saleCreated.id,
        tx
      );
      if (existingParcel) {
        throw new ApiError(
          400,
          "A parcel already exists for this sale"
        );
      }

      const parcel = await ParcelRepository.create(
        {
          saleID: saleCreated.id,
          customerID: order.contactID,
          address: order.shippingAddress,
          parcelType: payload.parcelType,
          courierName: payload.courierName ?? null,
          shippingCost: payload.shippingCost ?? 0,
          codAmount: payload.codAmount ?? 0,
          dueAmount: payload.dueAmount ?? 0,
          parcelDate: payload.parcelDate,
        },
        tx
      );

      return { saleID: saleCreated.id, parcelID: parcel.id };
    });

    return {
      orderID: order.id,
      saleID: result.saleID,
      parcelID: result.parcelID,
    };
  }

  static async list(query: any) {
    return await ParcelRepository.list(query);
  }

  static async getByID(id: number) {
    const parcel = await ParcelRepository.findByID(id);
    if (!parcel) {
      throw new ApiError(404, "Parcel not found");
    }
    return parcel;
  }

  static async updateStatus(id: number, payload: UpdateParcelStatusInput) {
    const parcel = await ParcelRepository.findByID(id);
    if (!parcel) {
      throw new ApiError(404, "Parcel not found");
    }

    const updated = await ParcelRepository.update(id, {
      status: payload.status,
    });

    return updated;
  }

  static async update(id: number, payload: UpdateParcelInput) {
    const parcel = await ParcelRepository.findByID(id);
    if (!parcel) {
      throw new ApiError(404, "Parcel not found");
    }

    const updated = await ParcelRepository.update(id, payload);
    return updated;
  }

  static async delete(id: number) {
    const parcel = await ParcelRepository.findByID(id);
    if (!parcel) {
      throw new ApiError(404, "Parcel not found");
    }

    if (!parcel.deletable) {
      throw new ApiError(400, "This parcel cannot be deleted");
    }

    await ParcelRepository.delete(id);
  }

  static async getCustomerAddress(customerID: number) {
    const customer = await ContactService.findByID(customerID);
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }
    return { address: customer.address ?? "" };
  }
}
