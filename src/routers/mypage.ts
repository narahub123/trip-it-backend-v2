import { addBlock, fetchBlock, unBlockUser } from "../controllers/blocks";
import {
  checkPassword,
  fetchUserData,
  updatePassword,
  updateProfile,
} from "../controllers/users";
import express from "express";

export default (router: express.Router) => {
  router.get("/mypage/profile", fetchUserData); // 사용자 정보 얻기
  router.post("/mypage/profile/passwordCheck", checkPassword); // 비밀번호 확인
  router.post("/mypage/profile/passwordUpdate", updatePassword); // 비밀번호 변경
  router.post("/mypage/profile/profileUpdate", updateProfile); // 프로필 업데이트
  router.get("/mypage/block", fetchBlock); // 차단 목록 가져오기
  router.post("/block/add", addBlock); // 나중에 삭제
  router.post("/block/delete", unBlockUser); // 차단 해제
};
