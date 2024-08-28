import {
  getScheduleByScheduleId,
  getSchedulesByUserId,
} from "../apis/schedules";
import {
  createPost,
  deletePosts,
  getPost,
  getPostByPostId,
  getPosts,
  getPostsByGuest,
  getPostsByUserId,
} from "../apis/posts";
import express from "express";
import mongoose, { mongo } from "mongoose";
import { getUserByUserId } from "../apis/users";
import { metros } from "../data/metros";
import { Post } from "../db/posts";

// 마이 페이지 모집글 목록을 가져오는 핸들러
export const fetchPostsByUserId = async (
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
    // 사용자 ID를 기준으로 모집글을 가져옴
    const response = await getPostsByUserId(userId);

    // 모집글 조회에 실패한 경우, 400 상태 코드와 함께 에러 메시지 반환
    if (!response) {
      return res.status(400).json({ code: 2, msg: "모집글 조회 실패" });
    }

    // 조회한 모집글을 클라이언트에 반환
    return res.status(200).json(response);
  } catch (error) {
    // 서버 내부 에러 발생 시, 500 상태 코드와 함께 에러 메시지 반환
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 관리자 페이지에서 모집글 목록을 가져오는 핸들러
export const fetchPostsAdmin = async (
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
    // 정렬 키, 정렬 값, 스킵 수, 페이지당 항목 수, 필드, 검색어를 기준으로 모집글을 가져옴
    const result = await getPosts(
      sortKey.toString(),
      sortValue.toString(),
      skip,
      limit,
      field.toString(),
      search.toString()
    );

    // 모집글 목록을 가져오지 못한 경우, 400 상태 코드와 함께 에러 메시지 반환
    if (!result) {
      return res.status(400).json({ code: 2, msg: "에러" });
    }

    // 조회한 모집글을 클라이언트에 반환
    const posts = result[0];
    return res.status(200).json(posts);
  } catch (error) {
    // 서버 내부 에러 발생 시, 500 상태 코드와 함께 에러 메시지 반환
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 마이페이지 모집글 삭제
export const deletePostsM = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;
  const { deletes } = req.body;
  try {
    // 본인 글 확인
    for (let deleted of deletes) {
      const post = await getPostByPostId(deleted);

      if (!post) {
        return res.status(400).json({ code: 2, msg: "모집글 조회 에러" });
      }

      if (post.userId !== userId) {
        return res.status(403).json({ code: 1, msg: "삭제 권한 없음" });
      }
    }

    const response = await deletePosts(deletes);

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
export const deletePostsA = async (
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

    const response = await deletePosts(deletes);

    if (!response) {
      return res.status(400).json({ code: 4, msg: "모집글 삭제 실패" });
    }

    return res.status(200).json({ code: "ok", msg: "모집글 삭제 성공" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 일정 제목 가져오기
export const fetchScheduleTitles = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;

  try {
    const schedules = await getSchedulesByUserId(userId);

    if (!schedules) {
      return res.status(400).json({ code: 2, msg: "모집글 조회 실패" });
    }

    // 포스트 제목 목록만 반환

    const scheduleTitles = schedules.map((schedule) => schedule.scheduleTitle);
    const scheduleIds = schedules.map((schedule) => schedule.scheduleId);

    const response = {
      userId,
      scheduleTitles,
      scheduleId: scheduleIds,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 모집글 등록하기
export const savePost = async (req: express.Request, res: express.Response) => {
  const {
    userId,
    scheduleId,
    postTitle,
    postContent,
    personnel,
    postPic,
    recruitStatus,
    viewCount,
    exposureStatus,
  } = req.body;

  const missingFields = [];

  if (!userId) missingFields.push("userId");
  if (!scheduleId) missingFields.push("scheduleId");
  if (!postTitle) missingFields.push("postTitle");
  if (!postContent) missingFields.push("postContent");
  if (!personnel) missingFields.push("personnel");
  if (!postPic) missingFields.push("postPic");
  if (!recruitStatus) missingFields.push("recruitStatus");

  if (!exposureStatus) missingFields.push("exposureStatus");

  if (missingFields.length > 0) {
    return res.status(400).json({
      code: 1,
      msg: `bad request, missing fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    const postId = new mongoose.Types.ObjectId();
    const post = {
      postId,
      userId,
      scheduleId,
      postTitle,
      postContent,
      personnel,
      postPic,
      recruitStatus,
      viewCount,
      exposureStatus,
      _id: postId,
    };

    const newPost = await createPost(post);
    if (!newPost) {
      return res.status(401).json({ code: 2, msg: "모집글 등록 실패" });
    }

    res.status(201).json(newPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 게스트 모집글 목록
export const fetchPostsByGuest = async (
  req: express.Request,
  res: express.Response
) => {
  const path = req.path;

  const metroId = req.query.metroId ? req.query.metroId.toString() : "";
  const search = req.query.query ? req.query.query.toString() : "";
  const limit = req.query.size ? Number(req.query.size) : 12; // 한 페이지에 표시할 항목 수
  const page = Number(req.query.page) || 0; // 현재 페이지 (기본값은 1)
  const skip = page * limit; // 페이지네이션을 위한 스킵 수
  const sortKey =
    path.split("/")[2] === "communityList" ? "postDate" : "viewCount";

  try {
    const posts = await getPostsByGuest(skip, limit, sortKey, metroId, search);
    console.log(posts);

    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 모집글 상세
export const fetchPost = async (
  req: express.Request,
  res: express.Response
) => {
  console.log(req.user);

  const currentUser = req.user.userId;

  const userId = new mongoose.Types.ObjectId(req.params.userId);

  const postId = new mongoose.Types.ObjectId(req.params.postId);

  try {
    const post = await getPost(userId, postId);
    const user = await getUserByUserId(userId);
    const schedule = await getScheduleByScheduleId(post.scheduleId, userId);

    const start = schedule.startDate; // 문자열
    const end = schedule.endDate; // 문자열

    console.log(typeof start); // "string"

    const response = {
      userId,
      loggedUserId: currentUser,
      nickname: user.nickname,
      gender: user.gender,
      birth: user.birth,
      userpic: user.userpic,
      scheduleId: post.scheduleId,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      metroId: schedule.metroId,
      metroName: metros.find((metro) => metro.areaCode === schedule.metroId)
        .name,
      postId,
      postTitle: post.postTitle,
      postContent: post.postContent,
      personnel: post.personnel,
      postPic: post.postPic,
      exposureStatus: post.exposureStatus,
      viewCount: post.viewCount,
      postDate: post.postDate,
    };

    return res.status(200).json([response]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

// 모집글 수정
export const updatePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { postTitle, postContent, postPic } = req.body;
  const postId = new mongoose.Types.ObjectId(req.params.postId);

  try {
    const post = await getPostByPostId(postId);

    const newPost = {
      ...post,
      postTitle,
      postContent,
      postPic,
    };

    const response = await Post.findOneAndUpdate({ postId }, newPost, {
      new: true,
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};

export const deletePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.user;
  const postId = new mongoose.Types.ObjectId(req.params.postId);

  try {
    const post = await getPostByPostId(postId);

    if (userId.toString() !== post.userId.toString()) {
      return res.status(403).json({ code: 1, msg: "권한 없음" });
    }

    const deletedPost = await Post.findOneAndDelete(postId);

    // 삭제된 게시물이 없으면 404 상태 코드 반환
    if (!deletedPost) {
      return res
        .status(404)
        .json({ code: 2, msg: "게시물을 찾을 수 없습니다" });
    }

    res.status(200).json(deletedPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 3, msg: "내부 에러" });
  }
};
