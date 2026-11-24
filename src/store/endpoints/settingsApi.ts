import { GlobalData, GlobalDataApiResponse } from "@/server/types/global";
import { api } from "../api";

export const settingsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGlobalSettings: build.query<GlobalData | null, void>({
      query: () => "/user/get-global",
      transformResponse: (res: GlobalDataApiResponse) => {
        const data = res.data ?? null;
        if (!data) return null;
        // Never expose the Conversions API token to the browser.
        return { ...data, meta_pixel_access_token: "" };
      },
    }),
  }),
});

export const { useGetGlobalSettingsQuery } = settingsApi;
