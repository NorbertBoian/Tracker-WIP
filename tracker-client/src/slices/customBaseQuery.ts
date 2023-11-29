import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

const baseQuery = fetchBaseQuery({
  baseUrl: `https://${import.meta.env.VITE_SERVER_URL}`,
  credentials: "include",
});

export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // console.log({ args, api, extraOptions }, "customBaseQuery");
  const result = await baseQuery(args, api, extraOptions);
  const { error, meta } = result;
  if (api.type === "query" && error) {
    // console.log(error, "customBaseQuery");
    // if (error.data) {
    //   return { data: error.data, meta };
    // } else {
    //   return { data: 'error', meta };
    // }
    return { data: "error", meta };
  } else {
    return result;
  }
};
