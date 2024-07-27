import { fetchReports, updateReports } from "../controllers/reports";
import { fetchBlocks, unBlockUserByAdmin } from "../controllers/blocks";
import express from "express";

export default (router: express.Router) => {
  router.get("/block/all", fetchBlocks);
  router.post("/admin/block/unblock", unBlockUserByAdmin);
  router.get("/admin/reports", fetchReports); // 신고 목록 
  router.post("/admin/reports/update", updateReports); // 신고 업데이트
};
