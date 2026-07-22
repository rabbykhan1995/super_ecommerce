import { ApiError } from "../../utils/ApiError";
import CartRepository from "./cart.repository";
import {
  AddToCartInput,
  CartItem,
  UpdateCartItemInput,
} from "./cart.type";
import ProductService from "../product/product.service";

export default class CartService {
  static async addToCart(
    userID: string,
    payload: AddToCartInput,
  ) {
    const { productID, variantID, quantity } = payload;

    const product = await ProductService.findById(productID);
    if (!product) throw new ApiError(404, "Product not found");

    const variant = await ProductService.findVariantByID(variantID);
    if (!variant) throw new ApiError(404, "Variant not found");

    if (variant.stock! < quantity) {
      throw new ApiError(400, "Insufficient stock");
    }

    const existing = await CartRepository.findByUserAndVariant(
      userID,
      variantID,
    );

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > variant.stock!) {
        throw new ApiError(400, "Insufficient stock");
      }
      return CartRepository.updateQuantity(existing.id, newQty);
    }

    return CartRepository.addItem({
      userID,
      productID,
      variantID,
      name: product.name,
      price: variant.salePrice as number,
      discountPrice: (variant.discountPrice as number) ?? null,
      slug: product.slug,
      thumbnail: product.thumbnail,
      attributes: variant.attributes,
      quantity,
      stock: variant.stock as number,
    });
  }

  static async getCart(userID: string): Promise<CartItem[]> {
    return CartRepository.findByUser(userID);
  }

  static async updateQuantity(
    userID: string,
    cartItemID: number,
    payload: UpdateCartItemInput,
  ) {
    const item = await CartRepository.findByID(cartItemID);
    if (!item) throw new ApiError(404, "Cart item not found");
    if (item.userID !== userID)
      throw new ApiError(403, "Forbidden");

    if (payload.quantity > item.stock) {
      throw new ApiError(400, "Insufficient stock");
    }

    return CartRepository.updateQuantity(
      cartItemID,
      payload.quantity,
    );
  }

  static async removeItem(
    userID: string,
    cartItemID: number,
  ) {
    const item = await CartRepository.findByID(cartItemID);
    if (!item) throw new ApiError(404, "Cart item not found");
    if (item.userID !== userID)
      throw new ApiError(403, "Forbidden");

    return CartRepository.removeItem(cartItemID);
  }

  static async clearCart(userID: string) {
    return CartRepository.clearByUser(userID);
  }
}
