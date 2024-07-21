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

#### troubleshooting

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
