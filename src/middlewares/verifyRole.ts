import { getUserByEmail } from "../apis/users";
import express from "express";

export const verifyRole = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { email } = req.body;

  try {
    const user = await getUserByEmail(email);
    const role = user.role;

    if (role === "ROLE_ADMIN" || role === "ROLE_USER") {
      next();
    } else if (role === "ROLE_A") {
      // return res.status(403).json({ code: 7, msg: "7일정지" });
      next();
    } else if (role === "ROLE_B") {
      return res.status(403).json({ code: 8, msg: "30일정지" });
    } else if (role === "ROLE_C") {
      return res.status(403).json({ code: 9, msg: "영구정지" });
    } else if (role === "ROLE_D") {
      return res.status(403).json({ code: 10, msg: "탈퇴회원" });
    }
  } catch (error) {
    console.log(error);

    return res.status(401).json({ code: 1, msg: "등급 확인 실패" });
  }
};
