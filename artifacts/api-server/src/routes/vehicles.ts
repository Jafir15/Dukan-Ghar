import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, vehiclesTable } from "@workspace/db";
import {
  CreateVehicleBody,
  UpdateVehicleBody,
  UpdateVehicleParams,
  DeleteVehicleParams,
  ListVehiclesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeVehicle(v: typeof vehiclesTable.$inferSelect) {
  return {
    ...v,
    baseRent: Number(v.baseRent),
  };
}

router.get("/vehicles", async (req, res): Promise<void> => {
  const query = ListVehiclesQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (query.success && query.data.categoryId) {
    // vehiclesTable has no categoryId; skip if passed
  }
  const rows = conditions.length
    ? await db.select().from(vehiclesTable).where(and(...conditions))
    : await db.select().from(vehiclesTable);
  res.json(rows.map(serializeVehicle));
});

router.post("/vehicles", async (req, res): Promise<void> => {
  const parsed = CreateVehicleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(vehiclesTable).values(parsed.data).returning();
  res.status(201).json(serializeVehicle(row));
});

router.patch("/vehicles/:id", async (req, res): Promise<void> => {
  const params = UpdateVehicleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateVehicleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(vehiclesTable).set(parsed.data).where(eq(vehiclesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(serializeVehicle(row));
});

router.delete("/vehicles/:id", async (req, res): Promise<void> => {
  const params = DeleteVehicleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.delete(vehiclesTable).where(eq(vehiclesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
