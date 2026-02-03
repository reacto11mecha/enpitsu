import { EventEmitter } from "events";
import { Redis } from "ioredis";

import { cache } from "@enpitsu/redis";

const SETTINGS_KEY = "enpitsu:global-settings";
const PUBSUB_CHANNEL = "enpitsu:settings-sync";

export interface AppSettings {
  canLogin: boolean;
  tokenSource: string;
  tokenFlags: string;
  minimalTokenLength: number;
  maximalTokenLength: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  canLogin: true,
  tokenSource: "^[A-Z]{2}-[0-9]{3}$",
  tokenFlags: "",
  minimalTokenLength: 6,
  maximalTokenLength: 6,
};

export class SettingsManager extends EventEmitter {
  private localSettings: AppSettings;
  private subscriber: Redis;

  constructor() {
    super();

    this.localSettings = { ...DEFAULT_SETTINGS };

    // Membuat koneksi redis khusus untuk subscribe (blocking)
    this.subscriber = cache.duplicate();

    this.initializeSync();
  }

  // Setup listener untuk sinkronisasi antar service/instance
  private async initializeSync() {
    // 1. Ambil data awal dari Redis saat aplikasi start
    await this.fetchFromRedis();

    // 2. Subscribe ke channel update
    await this.subscriber.subscribe(PUBSUB_CHANNEL);

    this.subscriber.on("message", (channel) => {
      if (channel === PUBSUB_CHANNEL) {
        // Jika ada sinyal update dari instance lain, refresh local cache
        this.fetchFromRedis();
      }
    });
  }

  // Mengambil data dari Redis dan menyimpannya di memory lokal
  private async fetchFromRedis() {
    try {
      const stored = await cache.hgetall(SETTINGS_KEY);

      // Jika redis kosong (pertama kali deploy), gunakan default
      if (Object.keys(stored).length === 0) {
        // Opsional: Tulis default ke Redis agar persistent
        await this.saveToRedis(DEFAULT_SETTINGS);
        return;
      }

      // Parsing string dari Redis kembali ke tipe data asli
      const parsedSettings: AppSettings = {
        canLogin: stored.canLogin === "true", // string "true" -> boolean true
        tokenSource: stored.tokenSource ?? DEFAULT_SETTINGS.tokenSource,
        tokenFlags: stored.tokenFlags ?? DEFAULT_SETTINGS.tokenFlags,
        minimalTokenLength: parseInt(
          stored.minimalTokenLength ??
            String(DEFAULT_SETTINGS.minimalTokenLength),
          10,
        ),
        maximalTokenLength: parseInt(
          stored.maximalTokenLength ??
            String(DEFAULT_SETTINGS.maximalTokenLength),
          10,
        ),
      };

      this.localSettings = parsedSettings;
      this.emit("update", this.localSettings);
    } catch (err) {
      console.error("Failed to sync settings from Redis:", err);
    }
  }

  // Helper untuk menyimpan map objek ke Redis Hash
  private async saveToRedis(values: Partial<AppSettings>) {
    // Konversi semua nilai ke string untuk Redis
    const record: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      record[key] = String(value);
    }

    await cache.hset(SETTINGS_KEY, record);
  }

  // Mengembalikan nilai dari Memory (Synchronous, seperti baseline)
  getSettings(): AppSettings {
    return { ...this.localSettings };
  }

  getClientTokenSetting() {
    return {
      validate: (txt: string) => {
        try {
          return new RegExp(
            this.localSettings.tokenSource,
            this.localSettings.tokenFlags,
          ).test(txt);
        } catch (e: any) {
          return false;
        }
      },
      minimalTokenLength: this.localSettings.minimalTokenLength,
      maximalTokenLength: this.localSettings.maximalTokenLength,
    };
  }

  // Builder untuk update: Simpan ke Redis -> Publish Event -> Update Local
  private async updateBuilder<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void> {
    try {
      // 1. Update Redis Storage
      await this.saveToRedis({ [key]: value });

      // 2. Update Local State (Optimistic update agar responsif)
      this.localSettings[key] = value;
      this.emit("update", this.localSettings);

      // 3. Beritahu instance lain untuk refresh data mereka
      await cache.publish(PUBSUB_CHANNEL, "UPDATE");
    } catch (err) {
      console.error(`Failed to update setting ${key}:`, err);
      throw err;
    }
  }

  // Exposed updaters
  updateSettings = {
    canLogin: (status: boolean) => this.updateBuilder("canLogin", status),
    tokenSource: (source: string) => this.updateBuilder("tokenSource", source),
    tokenFlags: (flags: string) => this.updateBuilder("tokenFlags", flags),
    minimalTokenLength: (len: number) =>
      this.updateBuilder("minimalTokenLength", len),
    maximalTokenLength: (len: number) =>
      this.updateBuilder("maximalTokenLength", len),
  } as const;
}

export const settings = new SettingsManager();
