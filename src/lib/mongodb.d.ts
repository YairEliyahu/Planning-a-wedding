import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

declare const clientPromise: Promise<MongoClient>;
export default clientPromise; 