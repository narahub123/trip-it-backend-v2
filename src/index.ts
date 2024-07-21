// 필요한 모듈들을 import 합니다.
import express from "express";
import http from "http";
import bodyParser from "body-parser"; // JSON 및 URL-encoded 요청 본문을 파싱
import cookieParser from "cookie-parser"; // 쿠키 파싱
import compression from "compression"; // HTTP 응답을 압축
import cors from "cors"; // CORS 활성화

// Express 애플리케이션을 생성합니다.
const app = express();

// CORS 설정을 추가합니다.
// credentials 옵션을 true로 설정하여 자격 증명을 포함한 요청을 허용합니다.
app.use(
  cors({
    credentials: true,
  })
);

// compression 미들웨어를 사용하여 HTTP 응답을 압축합니다.
app.use(compression());

// cookie-parser 미들웨어를 사용하여 쿠키를 파싱합니다.
app.use(cookieParser());

// body-parser 미들웨어를 사용하여 JSON 형식의 요청 본문을 파싱합니다.
app.use(bodyParser.json());

// HTTP 서버를 생성합니다.
const server = http.createServer(app);

// 서버가 포트 8080에서 실행되도록 설정합니다.
server.listen(8080, () => {
  console.log("Server running on http://localhost:8080/");
});
