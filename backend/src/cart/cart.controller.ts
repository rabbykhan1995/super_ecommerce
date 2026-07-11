import { Request, Response } from "express";
import CartService from "./cart.service";

export class CartController {
  static async addToCart(req: Request, res: Response) {
    const userID = (req as any).user.id;
    const item = await CartService.addToCart(userID, req.body);
    return res
      .status(201)
      .json({ success: true, msg: "Item added to cart", data: item });
  }

  static async getCart(req: Request, res: Response) {
    const userID = (req as any).user.id;
    const items = await CartService.getCart(userID);
    return res
      .status(200)
      .json({ success: true, data: items });
  }

  static async updateQuantity(req: Request, res: Response) {
    const userID = (req as any).user.id;
    const { id } = req.params;
    const item = await CartService.updateQuantity(
      userID,
      Number(id),
      req.body,
    );
    return res
      .status(200)
      .json({ success: true, msg: "Cart updated", data: item });
  }

  static async removeItem(req: Request, res: Response) {
    const userID = (req as any).user.id;
    const { id } = req.params;
    await CartService.removeItem(userID, Number(id));
    return res
      .status(200)
      .json({ success: true, msg: "Item removed from cart" });
  }

  static async clearCart(req: Request, res: Response) {
    const userID = (req as any).user.id;
    await CartService.clearCart(userID);
    return res
      .status(200)
      .json({ success: true, msg: "Cart cleared" });
  }
}
