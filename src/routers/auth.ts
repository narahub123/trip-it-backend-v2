import { join, login, reissue } from "../controllers/auth";
import express from "express";

export default (router: express.Router) => {
  router.post("/join", join); // 회원 가입
  router.post("/login", login); // 로그인
  router.get("/reissue", reissue); // refressh 토큰으로 access 토큰 재발급
  router.post("/reissue", reissue); // refressh 토큰으로 access 토큰 재발급
};
