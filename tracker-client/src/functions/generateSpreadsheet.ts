import { store } from "../store";
export const generateSpreadsheet = () => {
  const { year, month, rate, holidayRate, requiredHours, bigRate, user } =
    store.getState().named;
  const days = getPresentDates();
  const beganArray = days.map((day) => day.began);
  const endedArray = days.map((day) => day.ended);
  const specialRateArray = days.map((day) => day.specialRate);
  const holidays = days.map((day) => day.holiday);
  fetch(
    `https://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/generatespreadsheet`,
    {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user,
        monthSheetId: "1ijQZV2CEobH7zyEQM1Zwmwcz-phWPj9BNd_BlxEviFo",
        inputs1: beganArray,
        inputs2: endedArray,
        month,
        year,
        standardRate: rate,
        holidayRate,
        requiredDailyHours: requiredHours[1],
        specialRate: bigRate,
        specialRateArr: specialRateArray,
        holidays,
      }),
    },
  ).then((response) => response.json());
  // .then(console.log);
};
