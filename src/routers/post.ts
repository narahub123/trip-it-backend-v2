import {
  deletePost,
  fetchPost,
  fetchPostsByGuest,
  fetchScheduleTitles,
  savePost,
  updatePost,
} from "../controllers/posts";
import express from "express";

export default (router: express.Router) => {
  router.post("/community/load", fetchScheduleTitles);
  router.post("/community/submitPost", savePost);
  router.get("/community/communityList", fetchPostsByGuest);
  router.get("/community/communityListByView", fetchPostsByGuest);
  router.get("/community/communitySearch", fetchPostsByGuest);
  router.get("/community/communityDetail/:userId/:postId", fetchPost);
  router.get("/community/communityDetailGuest/:userId/:postId", fetchPost);
  router.post("/community/communityDetail/update/:postId", updatePost);
  router.delete("/community/communityDetail/delete/:postId", deletePost);
  router.post("/community/communityDetail/completedPost/:postId");
};
