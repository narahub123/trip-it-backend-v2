import { fetchBlocks } from "../controllers/blocks";
import express from "express";

export default (router: express.Router) => {
  router.get("/block/all", fetchBlocks);
};
