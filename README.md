# Trip-it backend v2

<details>
<summary>2024년 7월 21일 </summary>

### nodejs 서버 환경 구축

#### nodemon, typescript, ts-node 설치

### Express 서버 구축

#### express, body-parser, cookie-parser, compression, cors 설치

#### typescript가 설치되어 있기 때문에 상기의 라이브러리에 대한 types 설치

#### express 서버 구축을 위한 코드 작성

### mongodb 연결 하기

#### mongoose 설치

#### mongoose를 이용해서 mongodb와 연결

#### .env를 이용해서 mongodb url을 환경 변수 처리해서 보안을 높임

### mongoose를 이용한 스키마 작성

### 회원 가입 구현

#### 회원가입을 처리할 auth controller, user api, auth router 생성

#### 보안을 위해 패스워드를 bcryptjs를 이용해서 해싱하고 저장함

<details>
<summary>troubleshooting: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client</summary>

![image](https://github.com/user-attachments/assets/27d559f9-7e4b-4b2e-9fe1-25e10905bcf7)
닉네임 중복 확인 시 나타나는 에러
해결
중복 확인 후 중복 닉네임이 있을 경우 return으로 프론트엔드에 보내줘야 하는데 return을 안써서 발생한 에러

```typescript
if (existingNicknameUser) {
  console.log("동일 닉네임이 존재합니다.");
  return res.status(400).json({
    code: 2,
    msg: "이미 존재하는 닉네임입니다.",
  });
} else {
  console.log("동일 닉네임이 존재하지 않습니다.");
}
```

</details>

### 로그인 구현하기

#### formData를 받을 수 있는 설정 추가하기

#### 이메일 비밀번호 확인하기

#### jwt 생성 및 전송

<details>
<summary> CORS 에러 다루기 </summary>

백엔드에서 프론트로 데이터를 정확히 전달했는데도 불구하고 전달 받지 못했다는 에러가 뜸
![image](https://github.com/user-attachments/assets/97bd2875-9a63-4f47-a54b-0189bc8b9afc)

확인 결과 cors 에러로 확인됨
![image](https://github.com/user-attachments/assets/326b4d40-2264-4050-a192-38b712e5c0bc)

해결

```javascript
app.use(
  cors({
    origin: [
      `http://${ip}:3000`,
      `http://${ip}:3001`,
      `http://localhost:3000`,
      `http://localhost:3001`,
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
```

</details>

### access 토큰 및 refresh 토큰을 이용한 로그인 관리

</details>
<details>
<summary>2024년 7월 22일</summary>

## 마이페이지 프로필 페이지 구현

### 유저 정보 전달하기

#### access 토큰을 통해서 유저 정보를 가져와서 응답하기

#### access 토큰을 통해서 얻은 정보를 req.user에 넣어주기

- request에 user 필드가 없기 때문에 tsconfig.json을 통해서 설정을 넣어주어야 함

#### spring과 다르게 reissue을 통해서는 req.user에 user 정보를 직접 넣을 수 없기 때문에 미들웨어를 이용해서 넣어줌

#### req.user에 있는 email을 통해서 유저를 조회하여 데이터 전달

### 비밀번호 변경하기

#### 비밀번호 확인하기

#### 비밀번호 변경하기

### 전달할 유저 정보 변경

#### 보안을 위해서 패스워드는 제외하고 전달

### 프로필 업데이트

</details>

<details>

<summary>2024년 7월 24일</summary>

## 차단 페이지 서버 만들기

### 마이페이지와 관리자 페이지 모두 구현하기

#### aggregate를 이용한 차단 목록 구현

#### 차단 목록 정렬 구현

#### 차단 페이징 구현

</details>

<details>

<summary>2024년 7월 25일</summary>

## 차단 페이지 서버 만들기

### 마이페이지 차단 해제 구현하기

### 관리자 페이지 차단 해제 구현

### aggregate를 이용해서 리턴 date의 포멧 변경하기

</details>

<details>
<summary>2024년 7월 27일</summary>

## 신고 페이지 구현

### 마이 페이지 신고

- 신고 목록

### 관리자 페이지 신고

- 신고 목록
- 신고 처리하기
</details>

<details>
<summary>2024년 7월 28일</summary>

## 관리자 페이지 차단, 신고를 위한 코드 수정

## 메시지 모달을 위한 에러 관리

</details>

<details>
<summary>2024년 7월 29일</summary>

## 신고가 타당할 경우 신고 처리하고 User 테이블의 reportCount에 1 추가하기

### 아직 postId에 대한 정보가 없어서 실패

## 로그인 할 때의 리프레시 토큰 로직 변경

## 모집글 db 구현하기

### 마이페이지 모집글 목록

### 관리자 페이지 모집글 목록

## 일정 db 구현하기

### 마이페이지 일정 목록

### 관리자 페이지 일정 목록

</details>

<details>
<summary>7월 30일</summary>

## 프로필 업데이트 patch 사용

## 등급에 따른 로그인 차단

## 신고 등록시 등급 변경 로직 추가

</details>

<details>
<summary>7월 31일</summary>

## 일정, 모집글 삭제 api 구현

## 제네릭 테스트 성공

</details>

<details>
<summary>8월 5일</summary>

## 일정 외부 api로 데이터 가져와 프론트로 보내기

</details>

<details>
<summary>8월 6일</summary>

## 일정 등록하기

</details>

<details>
<summary>8월 일</summary>

## 상세 일정 불러오기

</details>
