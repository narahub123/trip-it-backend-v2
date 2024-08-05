import express from "express";
import auth from "./auth";
import mypage from "./mypage";
import admin from "./admin";
import test from "./test";
import planner from "./planner";

const router = express.Router();

export default (): express.Router => {
  auth(router);
  mypage(router);
  admin(router);
  test(router);
  planner(router);

  return router;
};
