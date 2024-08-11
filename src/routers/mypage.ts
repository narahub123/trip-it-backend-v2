import express from "express";
import { fetchReport } from "../controllers/reports";
import { fetchBlock } from "../controllers/blocks";
import {
  checkPassword,
  fetchUserData,
  updatePassword,
  updateProfile,
} from "../controllers/users";
import { deletePostsM, fetchPostsByUserId } from "../controllers/posts";
import {
  deleteSchedulesM,
  fetchScheduleDetails,
  fetchSchedules,
  updateSchedule,
} from "../controllers/schedules";

export default (router: express.Router) => {
  router.get("/mypage/profile", fetchUserData); // 사용자 정보 얻기
  router.post("/mypage/profile/passwordCheck", checkPassword); // 비밀번호 확인
  router.post("/mypage/profile/passwordUpdate", updatePassword); // 비밀번호 변경
  router.patch("/mypage/profile/profileUpdate", updateProfile); // 프로필 업데이트
  router.get("/mypage/block", fetchBlock); // 차단 목록 가져오기
  router.get("/report/user", fetchReport); // 신고 목록 가져오기
  router.get("/mypage/postList", fetchPostsByUserId); // 모집글 목록 가져오기
  router.post("/mypage/postList/delete-post", deletePostsM); // 모집글 삭제(body는 배열로)
  router.get("/mypage/schedules", fetchSchedules); // 일정 목록 가져오기
  router.post("/mypage/schedules/delete-schedules", deleteSchedulesM); // 일정 삭제(body는 배열로)
  router.get("/mypage/schedules/:scheduleId", fetchScheduleDetails); // 일정 상세 가져오기
  router.patch("/mypage/schedules/updateSchedule", updateSchedule); // 일정 수정
};
