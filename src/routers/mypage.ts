import { fetchUserData } from "../controllers/users";
import express from "express";

export default (router: express.Router) => {
  router.get("/mypage/profile", fetchUserData); // 사용자 정보 얻기
};
