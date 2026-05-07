import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentMethodsTable } from "@workspace/db";
import {
  CreatePaymentMethodBody,
  UpdatePaymentMethodBody,
  UpdatePaymentMethodParams,
  DeletePaymentMethodParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/payment-methods", async (_req, res): Promise<void> => {
  const rows = await db.select().from(paymentMethodsTable).orderBy(paymentMethodsTable.createdAt);
  res.json(rows);
});

router.post("/payment-methods", async (req, res): Promise<void> => {
  const parsed = CreatePaymentMethodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(paymentMethodsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.patch("/payment-methods/:id", async (req, res): Promise<void> => {
  const params = UpdatePaymentMethodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePaymentMethodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(paymentMethodsTable).set(parsed.data).where(eq(paymentMethodsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Payment method not found" });
    return;
  }
  res.json(row);
});

router.delete("/payment-methods/:id", async (req, res): Promise<void> => {
  const params = DeletePaymentMethodParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(paymentMethodsTable).where(eq(paymentMethodsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Payment method not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
