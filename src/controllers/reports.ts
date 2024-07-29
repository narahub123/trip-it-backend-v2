import { addReportCount } from "../apis/users";
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
  // 요청 유저의 역할(role)을 가져옵니다.
  const { role } = req.user;
  // 요청 바디에서 신고 ID(reportId)와 신고 상태(reportFalse) 값을 가져옵니다.
  const { reportId, reportFalse } = req.body;

  // 유저 역할이 'ROLE_ADMIN'이 아닌 경우
  if (role !== "ROLE_ADMIN") {
    // 권한이 없다는 응답을 반환합니다. 상태 코드 403 (Forbidden).
    return res.status(403).json({ code: 1, msg: "권한 없음" });
  }

  try {
    // reportId와 reportFalse 값을 사용하여 신고 상태를 업데이트합니다.
    const reports = await updateReportsByReportFalse(reportId, reportFalse);

    // 신고 상태 업데이트가 실패한 경우
    if (!reports) {
      // 에러 응답을 반환합니다. 상태 코드 400 (Bad Request).
      return res.status(400).json({ code: 2, msg: "에러" });
    }
    // else {
    //   // 신고 상태가 2(신고 처리)인 경우에만 user 테이블의 신고 개수를 1 증가시킵니다.
    //   if (reportFalse === 2) {
    //     // reportId를 사용하여 현재 신고 정보를 가져옵니다.
    //     const report = await getReportByReportId(reportId);

    //     // 신고 정보를 가져오는 데 실패한 경우
    //     if (!report) {
    //       return res.status(400).json({ code: 2, msg: "신고 조회 실패" });
    //     }

    //   // 신고가 달린 포스트의 아이디를 가져옵니다.
    //   const postId = report.postId;

    //   // 포스트 아이디를 통해서 신고 당한 유저의 정보를 가져옵니다.
    //   const post = await getPostByPostId(postId);

    //   // 포스트 정보를 가져오는 데 실패한 경우
    //   if (!post) {
    //     return res.status(400).json({ code: 2, msg: "모집글 조회 실패" });
    //   }

    //   // 포스트 작성자의 유저 아이디를 가져옵니다.
    //   const userId = post.userId;

    //   // 유저 아이디를 통해 신고 당한 유저의 정보를 가져옵니다.
    //   const blockedUser = await getUserByUserId(userId);

    //   // 유저 정보를 가져오는 데 실패한 경우
    //   if (!blockedUser) {
    //     return res.status(400).json({ code: 2, msg: "유저 조회 실패" });
    //   }

    //   // 현재 신고 개수를 가져옵니다.
    //   let reportCount = blockedUser.reportCount;
    //   // 현재 신고 개수를 기반으로 신고 개수를 1 증가시킵니다.
    //   reportCount = reportCount + 1;

    //   // 증가된 신고 개수를 데이터베이스에 업데이트합니다.
    //   const result = await addReportCount(userId, reportCount);

    //   // 신고 개수 업데이트가 실패한 경우
    //   if (!result) {
    //     // 실패 응답을 반환합니다. 상태 코드 400 (Bad Request).
    //     return res.status(400).json({ code: 4, msg: "신고 개수 추가 실패" });
    //   }
    // }

    // 업데이트가 성공적으로 완료된 경우, 상태 코드 200 (OK)과 함께 완료 메시지를 반환합니다.
    return res.status(200).json({ code: "ok", msg: "업데이트 완료" });
    // }
  } catch (error) {
    // 예외 발생 시 콘솔에 에러를 로그로 남깁니다.
    console.log(error);
    // 서버 에러 응답을 반환합니다. 상태 코드 500 (Internal Server Error).
    return res.status(500).json({ code: 3, msg: "서버 에러" });
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
      // 목록을 가져오지 못한 경우
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

    return res.status(201).json({ code: "ok", msg: "신고 성공" });
  } catch (error) {
    console.log(error);

    if (error.message) {
      return res.status(409).json({ code: 4, msg: "이미 신고한 게시물" });
    }
    return res.status(500).json({ code: 3, msg: "서버 오류" });
  }
};
