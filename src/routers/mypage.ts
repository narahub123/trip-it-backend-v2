import {
  checkPassword,
  fetchUserData,
  updatePassword,
  updateProfile,
} from "../controllers/users";
import express from "express";

export default (router: express.Router) => {
  router.get("/mypage/profile", fetchUserData); // 사용자 정보 얻기
  router.post("/mypage/profile/checkPassword", checkPassword); // 비밀번호 확인
  router.post("/mypage/profile/passwordUpdate", updatePassword); // 비밀번호 변경
  router.post("/mypage/profile/profileUpdate", updateProfile); // 프로필 업데이트
};
