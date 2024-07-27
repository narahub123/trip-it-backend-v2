import { addBlock, unBlockUser } from "../controllers/blocks";
import { addReport } from "../controllers/reports";
import express from "express";

export default (router: express.Router) => {
  router.post("/test/report/add", addReport);
  router.post("/block/add", addBlock); // 나중에 삭제
  router.post("/block/delete", unBlockUser); // 차단 해제
};
