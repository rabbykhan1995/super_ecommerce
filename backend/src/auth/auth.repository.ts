import { eq } from "drizzle-orm";
import db, { QueryClient } from "../../drizzle/src";
import { UpdateUserInput, UserPayload } from "./auth.type";
import { userTable } from "./auth.table";

export class AuthRepository {
   static async createUser(payload: UserPayload, client: QueryClient = db) {
      const [user] = await client.insert(userTable).values(payload).returning();
      return user ?? null;
   }

   static async updateUser(
      userID: string,
      payload: UpdateUserInput,
      client: QueryClient = db,
   ) {

      const [user] = await client
         .update(userTable)
         .set({
            ...payload,
            updatedAt: new Date(),
         })
         .where(eq(userTable.id, userID))
         .returning();

      return user ?? null;
   }

   static async findByID(
      userId: string,
      client: QueryClient = db,
   ) {
      return client.query.userTable.findFirst({
         where: (users, { eq }) => eq(users.id, userId),
      });
   }



static async findByEmail(email: string, client: QueryClient = db) {
  return client.query.userTable.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
}

static async findByMobile(mobile: string, client: QueryClient = db) {
  return client.query.userTable.findFirst({
    where: (users, { eq }) => eq(users.mobile, mobile),
  });
}
}