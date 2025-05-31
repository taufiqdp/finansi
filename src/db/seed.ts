import { resolve } from "node:path";
import { config } from "dotenv";
config();

import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { transactionsTable } from "./schema";

// Connect to the database
const sqlite = new Database("local.db");
const db = drizzle(sqlite);

// Run migrations if needed
const migrateDb = async () => {
  migrate(db, { migrationsFolder: resolve(__dirname, "migrations") });
  console.log("Migrations completed");
};

// Sample transaction data
const sampleTransactions = [
  {
    type: "income" as const,
    amount: 5000,
    description: "Monthly Salary",
    category: "Salary",
    date: "2025-05-01",
  },
  {
    type: "expense" as const,
    amount: 1200,
    description: "Rent Payment",
    category: "Housing",
    date: "2025-05-05",
  },
  {
    type: "expense" as const,
    amount: 85,
    description: "Grocery Shopping",
    category: "Food",
    date: "2025-05-10",
  },
  {
    type: "expense" as const,
    amount: 45,
    description: "Netflix Subscription",
    category: "Entertainment",
    date: "2025-05-15",
  },
  {
    type: "income" as const,
    amount: 1000,
    description: "Freelance Work",
    category: "Side Hustle",
    date: "2025-05-18",
  },
  {
    type: "expense" as const,
    amount: 60,
    description: "Dinner with Friends",
    category: "Dining Out",
    date: "2025-05-20",
  },
  {
    type: "expense" as const,
    amount: 120,
    description: "Electric Bill",
    category: "Utilities",
    date: "2025-05-25",
  },
  {
    type: "expense" as const,
    amount: 35,
    description: "Gas",
    category: "Transportation",
    date: "2025-05-28",
  },
  {
    type: "income" as const,
    amount: 250,
    description: "Tax Refund",
    category: "Other Income",
    date: "2025-05-30",
  },
];

// Seed the database
const seedDatabase = async () => {
  console.log("Seeding database...");

  // Clear existing data first (optional)
  await db.delete(transactionsTable);

  // Insert new data
  const insertPromises = sampleTransactions.map((transaction) =>
    db.insert(transactionsTable).values(transaction)
  );

  await Promise.all(insertPromises);

  console.log(`Seeded ${sampleTransactions.length} transactions`);
};

// Main function
const main = async () => {
  try {
    await migrateDb();
    await seedDatabase();
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
};

// Run the seeding process
main();
