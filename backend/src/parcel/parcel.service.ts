import { ApiError } from "../../utils/ApiError";
import {
  CreateParcelInput,
  UpdateParcelInput,
  UpdateParcelStatusInput,
} from "./parcel.type";
import ParcelRepository from "./parcel.repository";
import SaleService from "../sale/sale.service";
import ContactService from "../contact/contact.service";

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
