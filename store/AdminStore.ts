import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@goalhub_admin_streams";
const ADMIN_PASSWORD = "goalhub2024";

export const AdminStore = {
  password: ADMIN_PASSWORD,

  async verifyPassword(input: string): Promise<boolean> {
    return input.trim() === ADMIN_PASSWORD;
  },

  async getStreamUrls(): Promise<Record<string, string>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  async setStreamUrl(matchId: string, url: string): Promise<void> {
    try {
      const current = await AdminStore.getStreamUrls();
      current[matchId] = url.trim();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // silent fail
    }
  },

  async clearStreamUrl(matchId: string): Promise<void> {
    try {
      const current = await AdminStore.getStreamUrls();
      delete current[matchId];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {}
  },
};
