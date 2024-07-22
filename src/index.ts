// 필요한 모듈들을 import 합니다.
import express from "express";
import http from "http";
import bodyParser from "body-parser"; // JSON 및 URL-encoded 요청 본문을 파싱
import cookieParser from "cookie-parser"; // 쿠키 파싱
import compression from "compression"; // HTTP 응답을 압축
import cors from "cors"; // CORS 활성화
import mongoose from "mongoose"; // MongoDB와 연결
import dotenv from "dotenv"; // 환경 변수 로딩

import router from "./routers"; // 라우터 모듈을 가져옴
import { verifyToken } from "./middlewares/verifyToken";

// 환경 변수를 로드합니다. .env 파일에서 설정을 가져옵니다.
dotenv.config();

// Express 애플리케이션을 생성합니다.
const app = express();

// 연결할 ip 주소
const ip = "172.16.1.82";

// CORS 설정을 추가합니다.
// credentials 옵션을 true로 설정하여 자격 증명을 포함한 요청을 허용합니다.
app.use(
  cors({
    // 허용할 출처(origin) 설정
    origin: [
      `http://${ip}:3000`,
      `http://${ip}:3001`,
      `http://localhost:3000`,
      `http://localhost:3001`,
    ],
    // 허용할 HTTP 메소드 설정
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // 자격 증명(credentials)을 포함한 요청 허용
    credentials: true,
  })
);

// compression 미들웨어를 사용하여 HTTP 응답을 압축합니다.
app.use(compression());

// cookie-parser 미들웨어를 사용하여 쿠키를 파싱합니다.
app.use(cookieParser());

// body-parser 미들웨어를 사용하여 JSON 형식의 요청 본문을 파싱합니다.
// app.use(bodyParser.json());
// express 4.0 이상에서는 body-parser를 설치할 필요가 없다고 함
app.use(express.json());

// URL-encoded 형식의 요청 본문을 파싱합니다.(formData 받기)
// extended 옵션을 false로 설정하여 querystring 모듈을 사용합니다.
app.use(express.urlencoded({ extended: false }));

// HTTP 서버를 생성합니다.
const server = http.createServer(app);

// 서버가 포트 8080에서 실행되도록 설정합니다.
server.listen(8080, () => {
  console.log("Server running on http://localhost:8080/");
});

// mongoose의 Promise를 Node.js의 Promise로 설정합니다. 비동기 처리 방식 유지
mongoose.Promise = Promise; // 최신 버전의 mongoose에서는 생략 가능

// 환경 변수에서 MongoDB 연결 문자열을 가져옵니다.
const MONGO_URL = process.env.MONGO_URL;

// MongoDB에 연결합니다.
// 연결 성공 시 콘솔에 메시지를 출력하고,
// 연결 오류 발생 시 에러 메시지를 출력합니다.
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB에 성공적으로 연결되었습니다.");
  })
  .catch((error) => {
    console.error("MongoDB 연결 중 오류 발생:", error);
  });

// MongoDB 연결 에러를 처리합니다.
mongoose.connection.on("error", (error: Error) => console.log(error));

// 애플리케이션의 루트 경로에 라우터를 연결합니다.
app.use("/", verifyToken, router());
