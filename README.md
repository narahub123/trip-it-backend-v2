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
