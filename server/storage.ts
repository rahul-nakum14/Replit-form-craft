import { storage as mongoStorage } from "./services/storageAdapter";

/**
 * Storage adapter for MongoDB database operations
 * This provides consistent methods for database operations
 */
export const storage = mongoStorage;