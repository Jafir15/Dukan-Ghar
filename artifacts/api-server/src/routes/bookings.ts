import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, bookingsTable, vehiclesTable } from "@workspace/db";
import {
  CreateBookingBody,
  UpdateBookingBody,
  GetBookingParams,
  UpdateBookingParams,
  ListBookingsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeBooking(b: typeof bookingsTable.$inferSelect) {
  return {
    ...b,
    agreedRent: b.agreedRent != null ? Number(b.agreedRent) : null,
  };
}

router.get("/bookings", async (req, res): Promise<void> => {
  const query = ListBookingsQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success && query.data.sessionId) {
    conditions.push(eq(bookingsTable.sessionId, query.data.sessionId));
  }
  const rows = conditions.length
    ? await db.select().from(bookingsTable).where(and(...conditions))
    : await db.select().from(bookingsTable);
  res.json(rows.map(serializeBooking));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [vehicle] = await db.select().from(vehiclesTable).where(eq(vehiclesTable.id, parsed.data.vehicleId));
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  const [row] = await db
    .insert(bookingsTable)
    .values({
      ...parsed.data,
      vehicleName: vehicle.name,
      vehicleNameUrdu: vehicle.nameUrdu,
      vehicleType: vehicle.type,
    })
    .returning();
  res.status(201).json(serializeBooking(row));
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(serializeBooking(row));
});

router.patch("/bookings/:id", async (req, res): Promise<void> => {
  const params = UpdateBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Partial<typeof bookingsTable.$inferInsert> = {};
  if (parsed.data.adminAddress !== undefined) updateData.adminAddress = parsed.data.adminAddress;
  if (parsed.data.agreedRent !== undefined) updateData.agreedRent = parsed.data.agreedRent?.toString();
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  const [row] = await db.update(bookingsTable).set(updateData).where(eq(bookingsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(serializeBooking(row));
});

export default router;
