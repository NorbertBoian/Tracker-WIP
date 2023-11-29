import express, { Request, Response } from "express";
import { json } from "body-parser";
import cors from "cors";
import knex from "knex";
import { updateLockStatus } from "./controllers/updateLockStatus";
import { logUserIn } from "./controllers/logUserIn";
import { registerUser } from "./controllers/registerUser";
import { getUserDetails } from "./controllers/getUserDetails";
import session from "express-session";
import connectSessionKnex from "connect-session-knex";
import { COOKIE_NAME, __prod__ } from "./constants";
import { getUserSettings } from "./controllers/getUserSettings";
import { getCustomMonthSettings } from "./controllers/getCustomMonthSettings";
import { getDefaultMonthSettings } from "./controllers/getDefaultMonthSettings";
import { updateUserSettings } from "./controllers/updateUserSettings";
import { updateCustomMonthSettings } from "./controllers/updateCustomMonthSettings";
import { onboardingStatus } from "./controllers/onboardingStatus";
import { updatePreferredLanguage } from "./controllers/updatePreferredLanguage";
import { updateDates } from "./controllers/updateDates";
import { updateDateProperty } from "./controllers/updateDateProperty";
import { getDates } from "./controllers/getDates";
import { logUserOut } from "./controllers/logUserOut";
import { getSpreadsheet } from "./controllers/spreadSheet/getSpreadsheet";
import { updateStreamClientIds } from "./controllers/updateStreamClientIds";

const app = express();
const knexSessionStore = connectSessionKnex(session);

const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
});

const store = new knexSessionStore({ knex: db, tablename: "sessions" });

const oneYear = 1000 * 60 * 60 * 24 * 365;

const streamClientIds = new Map<
  string,
  { response: Response; lastGetSpreadsheetRequest?: Request }
>();

app.use(
  session({
    name: COOKIE_NAME,
    store,
    proxy: true,
    cookie: {
      maxAge: oneYear,
      sameSite: "none",
      httpOnly: true,
      secure: __prod__,
    },
    secret: process.env.SESSION_SECRET as string,
    saveUninitialized: false,
    resave: false,
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_ADDRESS,
    credentials: true,
  }),
);
app.use(json());

// if (process.env.CLIENT_ADDRESS)
//   app.use(
//     cors({
//       origin: `${process.env.CLIENT_ADDRESS.slice(0, -4)}5173`,
//       credentials: true,
//     }),
//   );

app.get("/spreadsheetprogress", (req, res) =>
  updateStreamClientIds(req, res, streamClientIds),
);
app.post("/test", (req, res) => {
  console.log(req);
  return res.json("test");
});

app.put("/updatedates", (req, res) => updateDates(req, res, db));

app.put("/updatedateproperty", (req, res) => updateDateProperty(req, res, db));

app.post("/getdates", (req, res) => getDates(req, res, db));

app.post("/getusersettings", (req, res) => getUserSettings(req, res, db));

app.post("/getcustommonthsettings", (req, res) =>
  getCustomMonthSettings(req, res, db),
);

app.post("/getdefaultmonthsettings", (req, res) =>
  getDefaultMonthSettings(req, res, db),
);

app.put("/updatecustommonthsettings", (req, res) =>
  updateCustomMonthSettings(req, res, db),
);

app.put("/updateusersettings", (req, res) => updateUserSettings(req, res, db));

app.put("/updatelockstatus", (req, res) => updateLockStatus(req, res, db));

app.put("/updatepreferredlanguage", (req, res) =>
  updatePreferredLanguage(req, res, db),
);

app.post("/getspreadsheet", (req, res) =>
  getSpreadsheet(req, res, streamClientIds),
);

app.post("/onboardingstatus", (req, res) => onboardingStatus(req, res, db));

app.post("/register", (req, res) => registerUser(req, res, db));

app.post("/getuserdetails", (req, res) => getUserDetails(req, res, db));

app.post("/login", (req, res) => logUserIn(req, res, db));

app.delete("/logout", logUserOut);

app.listen(process.env.PORT, () => {
  console.log(`app is running on port ${process.env.PORT}`);
});

// https
//   .createServer(
//     {
//       key: readFileSync("key.pem"),
//       cert: readFileSync("cert.pem"),
//     },
//     app,
//   )
//   .listen(process.env.SERVER_PORT, () => {
//     console.log(`app is running on port ${process.env.SERVER_PORT}`);
//   });
