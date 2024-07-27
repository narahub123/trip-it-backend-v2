import { createReport, getReportByUserId } from "../apis/reports";
import express from "express";

// 마이페이지 신고 목록 가져오기
export const fetchReport = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;

  try {
    const report = await getReportByUserId(userId);

    console.log(report);

    return res.status(200).json(report);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 1, msg: "내부 에러" });
  }
};

// 신고 추가
export const addReport = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;
  const { postId, reportType, reportDetail } = req.body;

  try {
    const report = await createReport(userId, postId, reportType, reportDetail);

    if (!report._id) {
      return res.status(400).json({ code: 1, msg: "차단 실패" });
    }

    console.log(report);

    return res.status(201).json({ code: "ok", msg: "신고 성공" });
  } catch (error) {
    console.log(error);

    if (error.message) {
      return res.status(409).json({ code: 4, msg: "이미 신고한 게시물" });
    }
    return res.status(500).json({ code: 3, msg: "서버 오류" });
  }
};
