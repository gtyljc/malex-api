// if you want to use dayjs inside this project you must to
// import it from this file instead of importing it direct;

// plugins
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween"

// set up dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export { dayjs };