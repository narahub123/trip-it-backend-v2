import {
  createReport,
  deleteReport,
  getReportByReportId,
  getReportByUserId,
  getReports,
  updateReportsByReportFalse,
} from "../apis/reports";
import express from "express";

// 신고 취소하기
export const cancelReport = async (
  req: express.Request, // 요청 객체
  res: express.Response // 응답 객체
) => {
  const { userId } = req.user;
  const { reportId } = req.body;

  try {
    const response = await getReportByReportId(reportId);

    if (response.userId !== userId) {
      res.status(403).json({ code: 1, msg: "권한 없음" });
    }

    const report = await deleteReport(reportId);

    if (!report) {
      return res.status(400).json({ code: 2, msg: "에러" }); // 400 상태 코드와 에러 메시지 반환
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 관리자 페이지 신고 처리하기 함수
export const updateReports = async (
  req: express.Request, // 요청 객체
  res: express.Response // 응답 객체
) => {
  const { role } = req.user; // 요청 유저의 역할(role)을 가져옵니다.
  const { reportId, reportFalse } = req.body; // 요청 바디에서 reportId와 reportFalse 값을 가져옵니다.

  if (role !== "ROLE_ADMIN") {
    // 유저 역할이 관리자가 아닌 경우
    return res.status(403).json({ code: 1, msg: "권한 없음" }); // 403 상태 코드와 권한 없음 메시지 반환
  }

  try {
    // reportId와 reportFalse 값을 사용하여 신고 상태를 업데이트합니다.
    const reports = await updateReportsByReportFalse(reportId, reportFalse);

    if (!reports) {
      // 업데이트된 신고가 없는 경우
      return res.status(400).json({ code: 2, msg: "에러" }); // 400 상태 코드와 에러 메시지 반환
    }

    console.log(reports); // 업데이트된 신고를 콘솔에 로그로 남깁니다.

    return res.status(200).json({ code: "ok", msg: "업데이트 완료" }); // 200 상태 코드와 업데이트 완료 메시지 반환
  } catch (error) {
    console.log(error); // 에러 발생 시 콘솔에 에러를 로그로 남깁니다.
    return res.status(500).json({ code: 3, msg: "서버 에러" }); // 500 상태 코드와 서버 에러 메시지 반환
  }
};

// 관리자 페이지 신고 목록 가져오기 함수
export const fetchReports = async (
  req: express.Request, // 요청 객체
  res: express.Response // 응답 객체
) => {
  const { role } = req.user; // 요청 유저의 역할(role)을 가져옵니다.
  const { sortKey, sortValue, field, search } = req.query;
  // 페이징
  const limit = Number(req.query.size);
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  if (role !== "ROLE_ADMIN") {
    // 유저 역할이 관리자가 아닌 경우
    return res.status(403).json({ code: 1, msg: "권한 없음" }); // 403 상태 코드와 권한 없음 메시지 반환
  }

  try {
    const result = await getReports(
      sortKey.toString(),
      sortValue.toString(),
      skip,
      limit,
      field.toString(),
      search.toString()
    ); // getReports 함수 호출하여 신고 목록을 가져옵니다.

    if (!result) {
      // 업데이트된 신고가 없는 경우
      return res.status(400).json({ code: 2, msg: "에러" }); // 400 상태 코드와 에러 메시지 반환
    }

    const reports = result[0];

    return res.status(200).json(reports); // 200 상태 코드와 신고 목록을 JSON 형식으로 반환
  } catch (error) {
    console.log(error); // 에러 발생 시 콘솔에 에러를 로그로 남깁니다.
    return res.status(500).json({ code: 2, msg: "서버 에러" }); // 500 상태 코드와 서버 에러 메시지 반환
  }
};

// 마이페이지 신고 목록 가져오기
export const fetchReport = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;

  try {
    const report = await getReportByUserId(userId);

    console.log(report);

    if (!report) {
      // 업데이트된 신고가 없는 경우
      return res.status(400).json({ code: 2, msg: "에러" }); // 400 상태 코드와 에러 메시지 반환
    }
    return res.status(200).json(report);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
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

    if (!report) {
      return res.status(400).json({ code: 2, msg: "차단 실패" });
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
