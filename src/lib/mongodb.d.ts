import { MongoClient } from 'mongodb';

declare global {
  let _mongoClientPromise: Promise<MongoClient> | undefined;
}

declare const clientPromise: Promise<MongoClient>;
export default clientPromise; 