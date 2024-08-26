import { fetchReports, updateReports } from "../controllers/reports";
import {
  fetchBlocks,
  unBlockUser,
  unBlockUserByAdmin,
} from "../controllers/blocks";
import { fetchUser, fetchUsers, updateUserRole } from "../controllers/users";
import { deletePostsA, fetchPostsAdmin } from "../controllers/posts";
import {
  deleteSchedulesA,
  fetchSchedulesAdmin,
} from "../controllers/schedules";
import express from "express";

export default (router: express.Router) => {
  router.get("/block/all", fetchBlocks); // 차단 목록 가져오기
  router.post("/admin/block/unblock", unBlockUserByAdmin); // 차단 해제하기
  router.get("/report/all", fetchReports); // 신고 목록
  router.post("/block/delete", unBlockUser); // 차단 해제
  router.post("/admin/reportConfirm", updateReports); // 신고 업데이트
  router.get("/admin/users", fetchUsers); // 유저 목록
  router.get("/admin/userDetail/:userId", fetchUser); // 유저 목록
  router.post("/admin/changeUserRole", updateUserRole); // 등급 변경
  router.get("/admin/posts", fetchPostsAdmin); // 유저 목록
  router.post("/admin/postList/delete-post", deletePostsA); // 모집글 삭제(body는 배열로)
  router.get("/admin/schedules", fetchSchedulesAdmin); // 일정 목록
  router.post("/admin/schedules/delete-schedules", deleteSchedulesA); // 일정 삭제(body는 배열로)
};
