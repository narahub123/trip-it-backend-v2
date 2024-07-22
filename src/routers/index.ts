import express from "express";
import auth from "./auth";
import mypage from "./mypage";

const router = express.Router();

export default (): express.Router => {
  auth(router);
  mypage(router);

  return router;
};
