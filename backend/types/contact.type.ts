import z from "zod";
import { sendContactEmailSchema } from "../validators/contact.validator";


export type SendContactEmailInput =
  z.infer<typeof sendContactEmailSchema>;