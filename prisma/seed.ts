import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import * as dotenv from 'fs'

// Load .env.local manually
try {
  const raw = dotenv.readFileSync('.env.local', 'utf-8')
  for (const line of raw.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim()
    }
  }
} catch { /* .env.local not found, rely on existing env */ }

function getArg(name: string): string | undefined {
  const flag = `--${name}=`
  const arg = process.argv.find((a) => a.startsWith(flag))
  return arg ? arg.slice(flag.length) : process.env[`SEED_${name.toUpperCase()}`]
}

async function main() {
  const email = getArg('email')
  const password = getArg('password')
  const firstName = getArg('firstName') || 'Ife'
  const dbUrl = process.env.DATABASE_URL

  if (!email || !password) {
    console.error('Usage: pnpm db:seed --email=you@example.com --password=yourpassword')
    process.exit(1)
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters')
    process.exit(1)
  }

  if (!dbUrl) {
    console.error('DATABASE_URL is not set')
    process.exit(1)
  }

  const client = new MongoClient(dbUrl)
  await client.connect()

  const db = client.db()
  const users = db.collection('users')

  const hashedPassword = await bcrypt.hash(password, 12)
  const emailLower = email.toLowerCase()

  const existing = await users.findOne({ email: emailLower })

  if (existing) {
    await users.updateOne({ email: emailLower }, { $set: { password: hashedPassword } })
    console.log(`✓ Password updated for: ${emailLower}`)
  } else {
    await users.insertOne({
      email: emailLower,
      password: hashedPassword,
      firstName,
      createdAt: new Date(),
    })
    console.log(`✓ Created user: ${emailLower} (${firstName})`)
  }

  await client.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
