import mongoose, { Types } from "mongoose";
import {
  createSchedule,
  createScheduleDetail,
  deleteScheduleDetailsByScheduleId,
  deleteSchedules,
  getScheduleByScheduleId,
  getScheduleDetails,
  getSchedules,
  getSchedulesByUserId,
  patchSchedule,
} from "../apis/schedules";
import express from "express";

// 일정 업데이트
export const updateSchedule = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;
  const { scheduleDto, detailScheduleDto } = req.body;

  console.log(scheduleDto, detailScheduleDto);

  console.log(detailScheduleDto);

  const scheduleId = new mongoose.Types.ObjectId(scheduleDto.scheduleId);
  const newScheduleDto = {
    scheduleId,
    metroId: scheduleDto.metroId,
    startDate: scheduleDto.startDate,
    endDate: scheduleDto.endDate,
    scheduleTitle: scheduleDto.scheduleTitle,
  };

  try {
    const schedule = await getScheduleByScheduleId(
      newScheduleDto.scheduleId,
      userId
    );

    if (!schedule) {
      return res.status(403).json({ code: 1, msg: "권한 없음" });
    }

    // 일정 정보나 상세 일정 정보가 없는 경우 401 응답을 반환합니다.
    if (!scheduleDto || !detailScheduleDto) {
      return res.status(401).json({ code: 2, msg: "유효성 에러" });
    }

    const scheduleUpdate = await patchSchedule(scheduleDto);

    if (!scheduleUpdate) {
      return res.status(500).json({ code: 4, msg: "일정 수정 실패" });
    }

    // 기존 상세 일정 삭제
    const deleteScheduleDetails = await deleteScheduleDetailsByScheduleId(
      scheduleId
    );

    // 각 상세 일정을 데이터베이스에 저장합니다.
    for (let i = 0; i < detailScheduleDto.length; i++) {
      const detail = detailScheduleDto[i];

      // 새로운 ObjectId를 생성하여 일정 상세 ID로 사용합니다.
      const scheduleDetailId = new mongoose.Types.ObjectId();

      // 새로운 일정 상세 객체를 생성합니다.
      const newDetail = {
        scheduleDetailId,
        scheduleId,
        ...detail,
        _id: scheduleDetailId,
      };

      // createScheduleDetail 함수를 호출하여 상세 일정을 데이터베이스에 저장합니다.
      const scheduleDetail = await createScheduleDetail(newDetail);

      // 일정 상세 저장이 실패한 경우 500 응답을 반환합니다.
      if (!scheduleDetail) {
        return res.status(500).json({ code: 5, msg: "일정 상세 수정 실패" });
      }
    }

    return res.status(200).json({ code: "ok", msg: "일정 수정 성공" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 일정 상세 가져오기 마이페이지
export const fetchScheduleDetails = async (
  req: express.Request,
  res: express.Response
) => {
  // 사용자 정보 가져오기
  const { userId } = req.user;

  const { scheduleId } = req.params;

  const scheduleid = new mongoose.Types.ObjectId(scheduleId);

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // scheduleId과 userId로 일정 가져오기 권한 확인
    const schedule = await getScheduleByScheduleId(scheduleid, userObjectId);
    if (!schedule) {
      return res.status(500).json({ code: 4, msg: "일정 조회 실패" });
    }

    // scheduleId로 상세 일정 가져오기
    const scheduleDetails = await getScheduleDetails(scheduleid);

    if (!scheduleDetails) {
      return res.status(500).json({ code: 2, msg: "상세 일정 조회 실패" });
    }

    return res.status(200).json(scheduleDetails);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 일정 등록하기
export const saveSchedule = async (
  req: express.Request,
  res: express.Response
) => {
  // 사용자 정보에서 userId를 추출합니다.
  const { userId } = req.user;
  // 요청 본문에서 일정과 상세 일정 정보를 추출합니다.
  const { scheduleDto, detailScheduleDto } = req.body;

  // 사용자가 로그인되어 있지 않으면 403 응답을 반환합니다.
  if (!userId) {
    return res.status(403).json({ code: 1, msg: "로그인 필요" });
  }

  // 일정 정보나 상세 일정 정보가 없는 경우 401 응답을 반환합니다.
  if (!scheduleDto || !detailScheduleDto) {
    return res.status(401).json({ code: 2, msg: "유효성 에러" });
  }

  try {
    // 새로운 ObjectId를 생성하여 일정 ID로 사용합니다.
    const scheduleId = new mongoose.Types.ObjectId();

    // 새로운 일정 객체를 생성합니다. scheduleId와 _id는 같은 값을 가집니다.
    const newSchedule = {
      scheduleId,
      ...scheduleDto,
      userId,
      _id: scheduleId,
    };

    // createSchedule 함수를 호출하여 일정을 데이터베이스에 저장합니다.
    const schedule = await createSchedule(newSchedule);

    // 일정 저장이 실패한 경우 500 응답을 반환합니다.
    if (!schedule) {
      return res.status(500).json({ code: 2, msg: "일정 등록 실패" });
    }

    // 각 상세 일정을 데이터베이스에 저장합니다.
    for (let i = 0; i < detailScheduleDto.length; i++) {
      const detail = detailScheduleDto[i];

      // 새로운 ObjectId를 생성하여 일정 상세 ID로 사용합니다.
      const scheduleDetailId = new mongoose.Types.ObjectId();

      // 새로운 일정 상세 객체를 생성합니다.
      const newDetail = {
        scheduleDetailId,
        scheduleId,
        ...detail,
        _id: scheduleDetailId,
      };

      // createScheduleDetail 함수를 호출하여 상세 일정을 데이터베이스에 저장합니다.
      const scheduleDetail = await createScheduleDetail(newDetail);

      // 일정 상세 저장이 실패한 경우 500 응답을 반환합니다.
      if (!scheduleDetail) {
        return res.status(500).json({ code: 5, msg: "일정 상세 등록 실패" });
      }
    }

    console.log("성공");

    // 일정과 상세 일정 모두 성공적으로 저장된 경우 200 응답을 반환합니다.
    return res.status(200).json({ code: "ok", msg: "일정 등록 성공" });
  } catch (error) {
    // 오류가 발생하면 콘솔에 오류를 기록하고 500 응답을 반환합니다.
    console.log(error);

    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

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
  const { scheduleIds } = req.body;
  console.log(scheduleIds);
  console.log(userId);

  try {
    // 본인 글 확인
    let scheduleIdsArr: Types.ObjectId[] = [];
    for (let deleted of scheduleIds) {
      const scheduleId = new mongoose.Types.ObjectId(deleted);
      const post = await getScheduleByScheduleId(scheduleId, userId);

      if (!post) {
        return res.status(400).json({ code: 2, msg: "일정 조회 에러" });
      }
      scheduleIdsArr.push(scheduleId);
    }

    const response = await deleteSchedules(scheduleIdsArr);

    console.log(response);

    if (!response) {
      return res.status(400).json({ code: 4, msg: "일정 삭제 실패" });
    }

    return res.status(200).json({ code: "ok", msg: "일정 삭제 성공" });
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
