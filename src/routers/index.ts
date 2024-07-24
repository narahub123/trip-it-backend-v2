import express from "express";
import auth from "./auth";
import mypage from "./mypage";
import admin from "./admin";

const router = express.Router();

export default (): express.Router => {
  auth(router);
  mypage(router);
  admin(router);

  return router;
};
