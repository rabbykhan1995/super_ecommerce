import { Request, Response } from "express";
import Cart from "../models/cart.model";
import { CartListResponse, UpdateCartInput } from "../types/cart.type";
import { UserInToken } from "../src/auth/user.type";

export class CartController {
  constructor() {
    // future dependency injection এর জন্য reserved
  }

  /**
   * Add item to cart
   */
  static async create(req: Request, res: Response) {
    const payload: UpdateCartInput = req.body;
    const user = req.user as UserInToken;

    // Check if item already exists for this user
    const existingItem = await Cart.findOne({
      userID: user._id,
      itemID: payload.itemID,
    });

    if (existingItem) {
      // Update quantity
      existingItem.quantity += payload.quantity;
      // Quantity should not exceed stock
      if (
        payload.stock !== undefined &&
        existingItem.quantity > payload.stock
      ) {
        existingItem.quantity = payload.stock;
      }
      await existingItem.save();
    } else {
      // Create new cart item
      await Cart.create({
        ...payload,
        userID: user._id,
      });
    }

    // Return full cart for this user
    const items = await Cart.find({ userID: user._id })
      .select("itemID itemSlug itemTitle thumbnail price quantity")
      .lean();

    const response: CartListResponse = {
      items,
      totalItems: items.length,
    };

    res.status(201).json({
      success: true,
      data: response,
    });
  }

  /**
   * List all cart items for user
   */
  static async list(req: Request, res: Response) {
    const userID = req.user!._id;

    const items = await Cart.find({ userID })
      .select("itemID itemSlug itemTitle thumbnail price quantity")
      .lean();

    const response: CartListResponse = {
      items,
      totalItems: items.length,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  }

  /**
   * Update a cart item (quantity)
   */
  static async update(req: Request, res: Response) {
    const id = req.params.id;
    const payload: UpdateCartInput = req.body;

    const item = await Cart.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  }

  /**
   * Delete a cart item
   */
  static async delete(req: Request, res: Response) {
    const id = req.params.id;
    const item = await Cart.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  }
}
