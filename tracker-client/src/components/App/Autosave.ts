import { memo, useEffect } from "react";
import { saveDatesInLongTermStorage } from "../../functions/saveDatesInLongTermStorage";
import { store, useAppSelector } from "../../store";

const saveDates = () => {
  const { dates } = store.getState().main;
  if (dates.data) saveDatesInLongTermStorage(dates.data);
};

export const Autosave = memo(() => {
  const autosaveInterval = useAppSelector(
    (state) => state.main.autosaveInterval,
  );
  const autosaveIntervalData = autosaveInterval.data;

  useEffect(() => {
    let autosaveInterval;
    if (autosaveIntervalData) {
      autosaveInterval = autosaveIntervalData * 1000;
    }
    const autosave = autosaveInterval
      ? setInterval(saveDates, autosaveInterval)
      : undefined;
    return () => {
      if (autosave) clearInterval(autosave);
    };
  }, [autosaveIntervalData]);

  return null;
});

Autosave.displayName = "Autosave";
