import { fetchReports, updateReports } from "../controllers/reports";
import { fetchBlocks, unBlockUserByAdmin } from "../controllers/blocks";
import { fetchUser, fetchUsers, updateUserRole } from "../controllers/users";
import { deletePostsA, fetchPostsAdmin } from "../controllers/posts";
import {
  deleteSchedulesA,
  fetchSchedulesAdmin,
} from "../controllers/schedules";
import express from "express";

export default (router: express.Router) => {
  router.get("/block/all", fetchBlocks);
  router.post("/admin/block/unblock", unBlockUserByAdmin);
  router.get("/admin/reports", fetchReports); // 신고 목록
  router.post("/admin/reports/update", updateReports); // 신고 업데이트
  router.get("/admin/users", fetchUsers); // 유저 목록
  router.get("/admin/users/:userId", fetchUser); // 유저 목록
  router.post("/admin/users/updateRole", updateUserRole); // 등급 변경
  router.get("/admin/posts", fetchPostsAdmin); // 유저 목록
  router.get("/admin/schedules", fetchSchedulesAdmin); // 일정 목록
  router.post("/admin/postList/delete-post", deletePostsA); // 모집글 삭제(body는 배열로)
  router.post("/admin/schedules/delete-schedules", deleteSchedulesA); // 일정 삭제(body는 배열로)
};
