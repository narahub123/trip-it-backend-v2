import {
  deleteSchedules,
  getScheduleByScheduleId,
  getSchedules,
  getSchedulesByUserId,
} from "../apis/schedules";
import express from "express";

// 마이 페이지 목록 가져오기
export const fetchSchedules = async (
  req: express.Request,
  res: express.Response
) => {
  // 요청에서 사용자 ID를 추출
  const { userId } = req.user;

  // 사용자 ID가 없는 경우, 401 상태 코드와 함께 에러 메시지 반환
  if (!userId) {
    return res.status(401).json({ code: 4, msg: "유저 아이디 없음" });
  }

  try {
    // 사용자 ID를 기준으로 일정을 가져옴
    const response = await getSchedulesByUserId(userId);

    // 일정 조회에 실패한 경우, 400 상태 코드와 함께 에러 메시지 반환
    if (!response) {
      return res.status(400).json({ code: 2, msg: "모집글 조회 실패" });
    }

    // 조회한 일정을 클라이언트에 반환
    return res.status(200).json(response);
  } catch (error) {
    // 서버 내부 에러 발생 시, 500 상태 코드와 함께 에러 메시지 반환
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 관리자 페이지 목록 가져오기
export const fetchSchedulesAdmin = async (
  req: express.Request,
  res: express.Response
) => {
  // 요청에서 사용자 역할을 추출
  const { role } = req.user;

  // 사용자가 관리자가 아닌 경우, 403 상태 코드와 함께 권한 없음 메시지 반환
  if (role !== "ROLE_ADMIN") {
    return res.status(403).json({ code: 1, msg: "권한 없음" });
  }

  // 요청 쿼리에서 정렬 키, 정렬 값, 필드, 검색어를 추출
  const { sortKey, sortValue, field, search } = req.query;

  // 페이징 처리
  const limit = Number(req.query.size); // 한 페이지에 표시할 항목 수
  const page = Number(req.query.page) || 1; // 현재 페이지 (기본값은 1)
  const skip = (page - 1) * limit; // 페이지네이션을 위한 스킵 수

  try {
    // 정렬 키, 정렬 값, 스킵 수, 페이지당 항목 수, 필드, 검색어를 기준으로 일정을 가져옴
    const result = await getSchedules(
      sortKey.toString(),
      sortValue.toString(),
      skip,
      limit,
      field.toString(),
      search.toString()
    );

    // 일정 목록을 가져오지 못한 경우, 400 상태 코드와 함께 에러 메시지 반환
    if (!result) {
      return res.status(400).json({ code: 2, msg: "에러" });
    }

    // 조회한 일정을 클라이언트에 반환
    const posts = result[0];
    return res.status(200).json(posts);
  } catch (error) {
    // 서버 내부 에러 발생 시, 500 상태 코드와 함께 에러 메시지 반환
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 마이페이지 일정 삭제
export const deleteSchedulesM = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;
  const { deletes } = req.body;
  try {
    // 본인 글 확인
    for (let deleted of deletes) {
      const post = await getScheduleByScheduleId(deleted);

      if (!post) {
        return res.status(400).json({ code: 2, msg: "모집글 조회 에러" });
      }

      if (post.userId !== userId) {
        return res.status(403).json({ code: 1, msg: "삭제 권한 없음" });
      }
    }

    const response = await deleteSchedules(deletes);

    if (!response) {
      return res.status(400).json({ code: 4, msg: "모집글 삭제 실패" });
    }

    return res.status(200).json({ code: "ok", msg: "모집글 삭제 성공" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 관리자 페이지 모집글 삭제
export const deleteSchedulesA = async (
  req: express.Request,
  res: express.Response
) => {
  const { role } = req.user;
  const { deletes } = req.body;
  try {
    // 관리자 확인
    if (role !== "ROLE_ADMIN") {
      return res.status(403).json({ code: 1, msg: "삭제 권한 없음" });
    }

    const response = await deleteSchedules(deletes);

    if (!response) {
      return res.status(400).json({ code: 4, msg: "모집글 삭제 실패" });
    }

    return res.status(200).json({ code: "ok", msg: "모집글 삭제 성공" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};
