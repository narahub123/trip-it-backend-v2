import { checkToken, join, login, reissue } from "../controllers/auth";
import express from "express";
import { verifyRole } from "../middlewares/verifyRole";

export default (router: express.Router) => {
  router.get("/", checkToken); // 토큰 여부 확인
  router.post("/join", join); // 회원 가입
  router.post("/login", verifyRole, login); // 로그인
  router.post("/reissue", reissue); // refressh 토큰으로 access 토큰 재발급
};
