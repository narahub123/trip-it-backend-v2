import mongoose, { Types } from "mongoose";
import { User } from "../db/users";
import { UserInputType } from "types/users";

// 회원 등급 변경
export const patchUserRole = (userId: Types.ObjectId, role: string) => {
  try {
    return User.findOneAndUpdate({ _id: userId }, { role }, { new: true });
  } catch (error) {
    throw error;
  }
};

// 회원 조회 with UserId
export const getUserByUserId = (userId: Types.ObjectId) => {
  try {
    return User.findOne({ _id: userId });
  } catch (error) {
    throw error;
  }
};

// 회원 가입
export const createUser = async (userData: UserInputType) => {
  try {
    // 새로운 ObjectId를 생성하여 userId에 할당
    const userId = new mongoose.Types.ObjectId();

    // 사용자 정보와 생성된 userId를 포함하여 User 모델 인스턴스 생성
    const user = new User({
      ...userData,
      userId,
      _id: userId, // _id 필드에 userId를 설정
    });

    // 사용자 정보를 데이터베이스에 저장하고 결과를 반환
    return await user.save();
  } catch (error) {
    // 오류 발생 시 콘솔에 오류를 출력
    console.log("회원 생성 에러", error);
    throw new Error("회원 생성 실패");
  }
};

// 이메일을 이용해 회원 확인
export const getUserByEmail = (email: string) => {
  try {
    // 이메일로 사용자 정보를 조회하여 반환
    return User.findOne({ email });
  } catch (error) {
    console.log("이메일로 회원 조회 실패", error);
    throw new Error("이메일로 회원 조회 실패");
  }
};

// 닉네임을 이용해 회원 확인
export const getUserByNickname = (nickname: string) => {
  try {
    // 닉네임으로 사용자 정보를 조회하여 반환
    return User.findOne({ nickname });
  } catch (error) {
    console.log("닉네임으로 회원 조회 실패", error);
    throw new Error("닉네임으로 회원 조회 실패");
  }
};

// 비밀번호 업데이트
export const patchPassword = (email: string, password: string) => {
  try {
    // 사용자 이메일로 찾아서 비밀번호를 업데이트
    // email: 업데이트할 사용자의 이메일
    // password: 새로운 비밀번호 (해싱된 상태여야 함)
    // { new: true }: 업데이트된 문서를 반환
    return User.findOneAndUpdate(
      { email }, // 조건: 주어진 이메일로 사용자 찾기
      { password }, // 업데이트할 내용: 새로운 비밀번호
      { new: true } // 업데이트 후 반환할 문서의 옵션 (업데이트된 문서 반환)
    );
  } catch (error) {
    // 비밀번호 업데이트 중 오류가 발생한 경우
    console.log("비밀번호 업데이트 실패", error);
    throw new Error("비밀번호 변경 실패"); // 오류를 발생시켜 상위 호출 스택으로 전파
  }
};

// 프로필 업데이트
export const patchProfile = (
  email: string,
  profile: { userpic?: string; nickname?: string; intro?: string }
) => {
  const user = User.findOneAndUpdate(
    { email },
    {
      userpic: profile.userpic,
      nickname: profile.nickname,
      intro: profile.intro,
    },
    { new: true }
  );

  return user;
};

// 유저 목록을 가져오는 함수
export const getUsers = (
  sortKey: string, // 정렬할 필드의 키
  sortValue: string, // 정렬 방식 ('asc' 또는 'desc')
  skip: number, // 건너뛸 문서의 수 (페이징을 위한)
  limit: number, // 가져올 문서의 수 (페이징을 위한)
  field: string, // 검색할 필드
  search: string // 검색어
) => {
  try {
    return User.aggregate([
      {
        // 사용자 데이터의 필드 선택 및 변환
        $project: {
          userId: 1, // 사용자 ID
          email: 1, // 이메일
          username: 1, // 사용자 이름
          nickname: 1, // 닉네임
          birth: 1, // 생년월일
          gender: {
            // 성별 필드를 변환
            $switch: {
              branches: [
                { case: { $eq: ["$gender", "m"] }, then: "남성" }, // 'm'을 '남성'으로 변환
                { case: { $eq: ["$gender", "f"] }, then: "여성" }, // 'f'를 '여성'으로 변환
              ],
              default: "미지정", // 다른 값의 경우 '미지정'으로 처리
            },
          },
          intro: 1, // 사용자 소개
          role: {
            // 역할 필드를 변환
            $switch: {
              branches: [
                { case: { $eq: ["$role", "ROLE_USER"] }, then: "일반회원" }, // 'ROLE_USER'를 '일반회원'으로 변환
                { case: { $eq: ["$role", "ROLE_ADMIN"] }, then: "관리자" }, // 'ROLE_ADMIN'을 '관리자'로 변환
              ],
              default: "미지정", // 다른 값의 경우 '미지정'으로 처리
            },
          },
          userpic: 1, // 사용자 프로필 사진
          reportCount: 1, // 신고 횟수
          regdate: {
            // 등록일자를 문자열 형식으로 변환
            $dateToString: {
              format: "%Y%m%d", // YYYYMMDD 형식
              date: "$regdate",
            },
          },
          endDate: {
            // 종료일자를 문자열 형식으로 변환
            $dateToString: {
              format: "%Y%m%d", // YYYYMMDD 형식
              date: "$endDate",
            },
          },
        },
      },
      {
        // 검색 필터 적용
        $match: {
          [field]: { $regex: search, $options: "i" }, // 대소문자 구분 없이 검색
        },
      },
      {
        // 페이징 및 정렬 처리
        $facet: {
          content: [
            {
              // 정렬
              $sort: {
                [sortKey]: sortValue === "desc" ? -1 : 1, // 정렬 방식 결정
              },
            },
            {
              // 건너뛸 문서의 수 설정
              $skip: skip,
            },
            {
              // 가져올 문서의 수 설정
              $limit: limit,
            },
          ],
          totalElements: [{ $count: "count" }], // 전체 문서 수를 카운트
        },
      },
      {
        // 전체 문서 수가 없을 경우 0으로 설정
        $addFields: {
          totalElements: { $ifNull: ["$totalElements.count", 0] },
        },
      },
    ]).exec(); // 집계 쿼리 실행
  } catch (error) {
    console.error("Error fetching users:", error); // 에러 발생 시 로그 출력
    throw error; // 클라이언트에게 에러 전달
  }
};

// 신고 횟수 추가하기
export const addReportCount = (
  userId: Types.ObjectId, // 업데이트할 보고서의 ID
  reportCount: number // 업데이트할 신고 횟수
) => {
  try {
    // User 모델의 findOneAndUpdate 메서드를 사용하여 사용자 정보를 업데이트합니다.
    return User.findOneAndUpdate(
      { _id: userId }, // 업데이트할 문서의 조건: reportId와 일치하는 문서
      {
        $set: { reportCount }, // 업데이트할 필드와 값: reportFalse를 새로운 값으로 설정
      },
      { new: true } // 업데이트 후 새로 업데이트된 문서를 반환
    );
  } catch (error) {
    // 에러 발생 시 콘솔에 에러를 로그로 남깁니다.
    console.log(error);

    // 에러를 다시 던져서 호출한 곳에서 처리할 수 있게 합니다.
    throw error;
  }
};

// refresh 토큰 업데이트
export const updateRefreshToken = (email: string, refreshToken: string) => {
  try {
    return User.findOneAndUpdate({ email }, { refreshToken }, { new: true });
  } catch (error) {
    console.log(error);

    throw error;
  }
};

// 유저 정보를 refreshToken을 이용해서 가져오기
export const getUserByRefreshToken = (refreshToken: string) => {
  try {
    return User.findOne({ refreshToken });
  } catch (error) {
    throw error;
  }
};

// 유저 등급 및 endDate 업데이트
export const patchRoleAndEndDate = (
  userId: Types.ObjectId,
  role: string,
  endDate: Date
) => {
  try {
    return User.findOneAndUpdate({ userId }, { role, endDate }, { new: true });
  } catch (error) {
    throw error;
  }
};
