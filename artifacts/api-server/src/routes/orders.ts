import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderBody,
  GetOrderParams,
  UpdateOrderParams,
  TrackOrderParams,
  ListOrdersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function genTrackingNumber(): string {
  const prefix = "DG";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${num}`;
}

function calcDelivery(items: { quantity: number; unit: string }[]): { charge: number; weight: number } {
  let totalWeight = 0;
  for (const item of items) {
    const unit = item.unit;
    const qty = item.quantity;
    if (unit === "kg") totalWeight += qty;
    else if (unit === "gram") totalWeight += qty / 1000;
    else if (unit === "liter") totalWeight += qty;
    else if (unit === "pound") totalWeight += qty * 0.453592;
    else totalWeight += qty * 0.3; // piece estimate
  }
  const charge = totalWeight <= 8 ? 50 : 50 + Math.ceil(totalWeight - 8) * 10;
  return { charge, weight: totalWeight };
}

function serializeOrder(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    subtotal: Number(o.subtotal),
    deliveryCharge: Number(o.deliveryCharge),
    total: Number(o.total),
    totalWeight: Number(o.totalWeight),
  };
}

router.get("/orders/track/:trackingNumber", async (req, res): Promise<void> => {
  const params = TrackOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(ordersTable).where(eq(ordersTable.trackingNumber, params.data.trackingNumber));
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(serializeOrder(row));
});

router.get("/orders", async (req, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success) {
    if (query.data.sessionId) conditions.push(eq(ordersTable.sessionId, query.data.sessionId));
    if (query.data.status) conditions.push(eq(ordersTable.status, query.data.status));
  }
  const rows = conditions.length
    ? await db.select().from(ordersTable).where(and(...conditions))
    : await db.select().from(ordersTable);
  res.json(rows.map(serializeOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { items, ...rest } = parsed.data;
  const { charge, weight } = calcDelivery(items as { quantity: number; unit: string }[]);
  const subtotal = (items as { price: number; quantity: number }[]).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const trackingNumber = genTrackingNumber();
  const [row] = await db
    .insert(ordersTable)
    .values({
      ...rest,
      items: items as object[],
      trackingNumber,
      subtotal: subtotal.toFixed(2),
      deliveryCharge: charge.toFixed(2),
      total: (subtotal + charge).toFixed(2),
      totalWeight: weight.toFixed(3),
    })
    .returning();
  res.status(201).json(serializeOrder(row));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(serializeOrder(row));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(ordersTable).set(parsed.data).where(eq(ordersTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(serializeOrder(row));
});

export default router;
