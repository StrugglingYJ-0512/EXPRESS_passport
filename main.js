var express = require("express");
var app = express();
var fs = require("fs");
var bodyParser = require("body-parser");
var compression = require("compression");
var helmet = require("helmet");
app.use(helmet());
var session = require("express-session");
var FileStore = require("session-file-store")(session);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    secret: "asadlfkj!@#!@#dfgasdg",
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
  })
);
// passport
var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

// **아래의 콜백함수에서 < 로그인 성공 여부를 판단 >을 어떻게 하는지에 관한 로직이다._ 아직은 먼지 모르겠음.
passport.use(
  new LocalStrategy(
    /* auth.js에서 login form 을 맞추기 위한 2번째 방법으로,
     name에 파라미터 값을 넘겨주는 방식!
     */
    {
      usernameField: "email",
      passwordField: "pwd",
    },
    function (username, password, done) {
      /* *위의 form 형식의 name 변경 로직까지 넣은 후 추가한 것이다!
        콘솔 찍는 이유 : 
        1) 현재의 콜백이 잘 호출 되는지 확인 
        2) passport가 우리한테 username, password를 콜백 내로 주입시켜 주는지 확인.
       */
      console.log("LocalStrategy", username, password);
      /* * 출력 결과 : LocalStrategy egoing777@gmail.com 111111
         해설 : 1) LocalStrategy : string값으로 콘솔에 찍었기 때문 ==> 콜백 함수가 잘 실행됨
                2) username, password : 이 콜백 함수가 호출 될 때, 
                passport가 인자로 format 에 전송한 username, password 를 잘 전달 해줬다는 것!
         */

      User.findOne({ username: username }, function (err, user) {
        // User.findOne : MongoDB 문법
        /* username 으로 : 사용자 중 username 찾는다.
         User.findOne({ username: username} 가 잘 실행되면, user 데이터를 가져온다.
         이 user값은  콜백함수의 user 파라미터 값에 넘겨준다. 
        */
        if (err) {
          return done(err);
          // 만약 err가 발생하면, 이 전체 콜백의 3번째 파라미터인 done 함수를 호출한다.
          // done 함수안에  err를 첫번째 인자로 넘겨준다.
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
          // 만약 그 user가 없다면,  done 함수로 호출 할 떄, 두번째 인자로 false를 줘라.
          // 3번째 인자로 왜 실패했는지를 알려줘라. 나머지는 우리가 알아서 하겠다! 라는 뜻!
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Incorrect password." });
          // 여기까지 코드가 왔다면 사용자는 존재.
          // but, 사용자의 password를 체크하니 틀렸다.
          // 마찬가지로 done 함수에 false를 주고, 왜 틀린지를 알려줘라.
        }
        return done(null, user);
        // 여기까지 왔다면!! 사용자가 존재한다는 뜻!
        // 사용자의 정보를 담아서( user ) done 함수의 2번쨰 인자로 줘라.
        // 나머지는 우리가 알아서 하겠다!!
      });
      // ** 즉, 이 done 함수를 어떻게 호출하느냐에 따라서 로그인에 성공 실패를 passport에 알려 줄 수 있다!
    }
  )
);

/* Q. 밑의 콜백함수(passport.authenticate) 내용은, 성공하면 "/",
 실패하면,"/auth/login" 경로로 간다. 
그렇다면,  어떻게 로그인 성공했는지를 판단하지?
 A. passportjs.org > configure에 명세 나와있음
 */
app.post(
  "/auth/login_process",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  })
);

app.get("*", function (request, response, next) {
  fs.readdir("./data", function (error, filelist) {
    request.list = filelist;
    next();
  });
});

var indexRouter = require("./routes/index");
var topicRouter = require("./routes/topic");
var authRouter = require("./routes/auth");

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
