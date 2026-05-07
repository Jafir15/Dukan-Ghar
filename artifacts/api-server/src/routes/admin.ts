import { Router, type IRouter } from "express";
import { eq, count, sum, desc } from "drizzle-orm";
import { db, ordersTable, bookingsTable, productsTable, adminConfigTable } from "@workspace/db";
import { VerifyAdminPinBody, ResetAdminPinBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const DEFAULT_PIN = "1234";
const ADMIN_EMAIL = "jafir0691824@gmail.com";

async function getAdminPin(): Promise<string> {
  const [config] = await db.select().from(adminConfigTable).where(eq(adminConfigTable.key, "admin_pin"));
  return config?.value ?? DEFAULT_PIN;
}

router.post("/admin/verify-pin", async (req, res): Promise<void> => {
  const parsed = VerifyAdminPinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const currentPin = await getAdminPin();
  if (parsed.data.pin !== currentPin) {
    res.status(401).json({ error: "Invalid PIN" });
    return;
  }
  const token = Buffer.from(`admin:${Date.now()}`).toString("base64");
  res.json({ success: true, token });
});

router.post("/admin/reset-pin", async (req, res): Promise<void> => {
  const parsed = ResetAdminPinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.email !== ADMIN_EMAIL) {
    res.status(400).json({ error: "Email not authorized for PIN reset" });
    return;
  }
  const newPin = Math.floor(1000 + Math.random() * 9000).toString();
  await db
    .insert(adminConfigTable)
    .values({ key: "admin_pin", value: newPin })
    .onConflictDoUpdate({ target: adminConfigTable.key, set: { value: newPin } });
  logger.info({ email: parsed.data.email }, "Admin PIN reset");
  res.json({ message: `PIN reset to ${newPin} (in production this would be emailed to ${parsed.data.email})` });
});

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [orderStats] = await db
    .select({
      totalOrders: count(),
      totalRevenue: sum(ordersTable.total),
    })
    .from(ordersTable);

  const [pendingOrders] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));

  const [deliveredOrders] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "delivered"));

  const [bookingStats] = await db.select({ total: count() }).from(bookingsTable);

  const [pendingBookings] = await db
    .select({ count: count() })
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "pending"));

  const [productStats] = await db.select({ total: count() }).from(productsTable);

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  const recentBookings = await db
    .select()
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt))
    .limit(5);

  res.json({
    totalOrders: orderStats?.totalOrders ?? 0,
    totalRevenue: Number(orderStats?.totalRevenue ?? 0),
    pendingOrders: pendingOrders?.count ?? 0,
    deliveredOrders: deliveredOrders?.count ?? 0,
    totalBookings: bookingStats?.total ?? 0,
    pendingBookings: pendingBookings?.count ?? 0,
    totalProducts: productStats?.total ?? 0,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryCharge: Number(o.deliveryCharge),
      total: Number(o.total),
      totalWeight: Number(o.totalWeight),
    })),
    recentBookings: recentBookings.map((b) => ({
      ...b,
      agreedRent: b.agreedRent != null ? Number(b.agreedRent) : null,
    })),
  });
});

export default router;
