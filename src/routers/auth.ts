import { join, login } from "../controllers/auth";
import express from "express";

export default (router: express.Router) => {
  router.post("/join", join); // 회원 가입 
  router.post("/login", login); // 로그인 
};
