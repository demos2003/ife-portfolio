import { MongoClient, ObjectId, Document } from 'mongodb'

const uri = process.env.DATABASE_URL!

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!globalForMongo._mongoClientPromise) {
  const client = new MongoClient(uri)
  globalForMongo._mongoClientPromise = client.connect()
}

const clientPromise = globalForMongo._mongoClientPromise

export async function getDb() {
  const client = await clientPromise
  return client.db()
}

// Converts MongoDB _id (ObjectId) → id (string) for JSON responses
export function toDoc(doc: Document): Record<string, unknown> & { id: string } {
  const { _id, ...rest } = doc
  return { ...rest, id: (_id as ObjectId).toString() }
}

export { ObjectId }
