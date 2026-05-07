import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";
import vehiclesRouter from "./vehicles";
import bookingsRouter from "./bookings";
import paymentMethodsRouter from "./payment_methods";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(vehiclesRouter);
router.use(bookingsRouter);
router.use(paymentMethodsRouter);
router.use(adminRouter);

export default router;
