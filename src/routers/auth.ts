import { join, login } from "../controllers/auth";
import express from "express";

export default (router: express.Router) => {
  router.post("/join", join);
  router.post("/login", login);
};
