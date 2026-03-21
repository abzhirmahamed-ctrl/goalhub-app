import { Router, type IRouter } from "express";
import healthRouter from "./health";
import matchesRouter from "./matches";
import streamsRouter from "./streams";

const router: IRouter = Router();

router.use(healthRouter);
router.use(matchesRouter);
router.use(streamsRouter);

export default router;
