import { CartItem, CartItemPayload } from "./cart.type";
import { cartTable } from "./cart.table";
import { eq, and } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";

export default class CartRepository {
  static async addItem(
    payload: CartItemPayload,
    client: QueryClient = db,
  ): Promise<CartItem> {
    const [item] = await client
      .insert(cartTable)
      .values(payload)
      .returning();

    return item;
  }

  static async findByUser(
    userID: string,
    client: QueryClient = db,
  ): Promise<CartItem[]> {
    return client.query.cartTable.findMany({
      where: (cart, { eq }) => eq(cart.userID, userID),
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
          },
        },
        variant: {
          columns: {
            id: true,
            salePrice: true,
            stock: true,
            attributes: true,
          },
        },
      },
    });
  }

  static async findByID(
    cartItemID: number,
    client: QueryClient = db,
  ): Promise<CartItem> {
    const [item] = await client
      .select()
      .from(cartTable)
      .where(eq(cartTable.id, cartItemID))
      .limit(1);

    return item;
  }

  static async findByUserAndVariant(
    userID: string,
    variantID: number,
    client: QueryClient = db,
  ): Promise<CartItem> {
    const [item] = await client
      .select()
      .from(cartTable)
      .where(
        and(
          eq(cartTable.userID, userID),
          eq(cartTable.variantID, variantID),
        ),
      )
      .limit(1);

    return item;
  }

  static async updateQuantity(
    cartItemID: number,
    quantity: number,
    client: QueryClient = db,
  ): Promise<CartItem> {
    const [updated] = await client
      .update(cartTable)
      .set({ quantity })
      .where(eq(cartTable.id, cartItemID))
      .returning();

    return updated;
  }

  static async removeItem(
    cartItemID: number,
    client: QueryClient = db,
  ) {
    return client
      .delete(cartTable)
      .where(eq(cartTable.id, cartItemID));
  }

  static async clearByUser(
    userID: string,
    client: QueryClient = db,
  ) {
    return client
      .delete(cartTable)
      .where(eq(cartTable.userID, userID));
  }
}
