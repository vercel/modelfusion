import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

import { Cache } from "./Cache";

/**
 * FileCache class implements the Cache interface.
 * It provides a file-based cache with TTL and size-based eviction strategies.
 */
export class FileCache implements Cache {
  /**
   * The directory where the cache files are stored.
   * @type {string}
   */
  cacheDir;

  /**
   * The default lifespan of a cached item, in milliseconds.
   * Cached items older than this value will be evicted.
   * @type {number}
   */
  expiresIn = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  /**
   * The maximum allowed size of the cache, in bytes.
   * If the cache exceeds this size, some items will be evicted.
   * @type {number}
   */
  maxCacheSize = 0.5 * 1024 * 1024 * 1024; // 0.5 GB

  /**
   * Constructor for the FileCache class.
   * It creates the cache directory if it doesn't exist.
   * @param {object} options - The options for the cache.
   * @param {string} options.cacheDir - The directory where the cache files are stored.
   * @param {number} options.expiresIn - The lifespan of a cached item, in milliseconds.
   * @param {number} options.maxCacheSize - The maximum allowed size of the cache, in bytes.
   */
  constructor({
    expiresIn = 24 * 60 * 60 * 1000, // 1 day in milliseconds
    cacheDir = path.resolve(process.cwd(), ".cache"), // Default cache directory is './cache'
    maxCacheSize = 0.5 * 1024 * 1024 * 1024, // Default max cache size is 0.5 GB
  } = {}) {
    this.expiresIn = expiresIn;
    this.cacheDir = cacheDir;
    this.maxCacheSize = maxCacheSize;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Hashes the key for a cache item.
   * The key is an object with properties `functionType`, `functionId`, and `input`.
   * The hash is used as the filename for the cache item.
   * @param {object} key - The key for the cache item.
   * @returns {string} The hash of the key.
   */
  private hashKey(key: {
    functionType: string;
    functionId?: string | undefined;
    input: unknown;
  }) {
    const keyString = JSON.stringify(key);
    const hash = crypto.createHash("sha256");
    hash.update(keyString);
    return hash.digest("hex");
  }

  /**
   * Looks up a value in the cache.
   * If the value is found and is not expired, it is returned.
   * If the value is not found or is expired, null is returned.
   * @param {object} key - The key for the cache item.
   * @returns {Promise<object|null>} The cached value, or null if the value is not found or is expired.
   */
  async lookupValue(key: {
    functionType: string;
    functionId?: string | undefined;
    input: unknown;
  }): Promise<object | null> {
    const filePath = path.join(this.cacheDir, this.hashKey(key));
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          if (err.code === "ENOENT") {
            resolve(null); // File not found, resolve with null
          } else {
            reject(err); // Other error, reject promise
          }
        } else {
          const parsedData = JSON.parse(data);
          if (Date.now() - parsedData.time > this.expiresIn) {
            // If the item is too old, delete the file and return a cache miss
            fs.unlink(filePath, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(null);
              }
            });
          } else {
            resolve(parsedData.value); // File found and not expired, resolve with data
          }
        }
      });
    });
  }

  /**
   * Stores a value in the cache.
   * The value is stored with the current time, so it can be expired later.
   * @param {object} key - The key for the cache item.
   * @param {unknown} value - The value to store.
   * @returns {Promise<void>}
   */
  async storeValue(
    key: {
      functionType: string;
      functionId?: string | undefined;
      input: unknown;
    },
    value: unknown
  ): Promise<void> {
    const filePath = path.join(this.cacheDir, this.hashKey(key));
    const data = { value, time: Date.now() }; // Include the current time in the stored data
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(data), "utf8", (err) => {
        if (err) {
          reject(err); // Error writing file, reject promise
        } else {
          this.checkCacheSize().then(resolve).catch(reject); // Check the cache size after writing the file
        }
      });
    });
  }

  /**
   * Checks the total size of the cache.
   * If the cache is too large, it evicts the oldest items until the total cache size is within the limit.
   *
   * @returns {Promise<void>} A promise that resolves when the cache size check (and possible eviction) is complete.
   */
  private async checkCacheSize(): Promise<void> {
    const files = await fs.promises.readdir(this.cacheDir);
    let totalSize = 0;
    const fileDetails: { file: string; stats: fs.Stats }[] = [];

    // Get the size and stats for each file
    for (const file of files) {
      const stats = await fs.promises.stat(path.join(this.cacheDir, file));
      totalSize += stats.size;
      fileDetails.push({ file, stats });
    }

    // If the cache is too large, delete the oldest files until it's small enough
    if (totalSize > this.maxCacheSize) {
      // Sort the files by modification time, oldest first
      fileDetails.sort(
        (a, b) => a.stats.mtime.getTime() - b.stats.mtime.getTime()
      );

      // Delete files until the cache is small enough
      for (const { file, stats } of fileDetails) {
        if (totalSize <= this.maxCacheSize) {
          break;
        }
        await fs.promises.unlink(path.join(this.cacheDir, file));
        totalSize -= stats.size;
      }
    }
  }
}
