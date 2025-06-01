import { config } from "dotenv";
config();

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { transactionsTable } from "./schema";

// Connect to Supabase PostgreSQL database
const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Run migrations if needed
const migrateDb = async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
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
    userId: 1,
  },
  {
    type: "expense" as const,
    amount: 1200,
    description: "Rent Payment",
    category: "Housing",
    date: "2025-05-05",
    userId: 1,
  },
  {
    type: "expense" as const,
    amount: 85,
    description: "Grocery Shopping",
    category: "Food",
    date: "2025-05-10",
    userId: 1,
  },
  {
    type: "expense" as const,
    amount: 45,
    description: "Netflix Subscription",
    category: "Entertainment",
    date: "2025-05-15",
    userId: 1,
  },
  {
    type: "income" as const,
    amount: 1000,
    description: "Freelance Work",
    category: "Side Hustle",
    date: "2025-05-18",
    userId: 1,
  },
  {
    type: "expense" as const,
    amount: 60,
    description: "Dinner with Friends",
    category: "Dining Out",
    date: "2025-05-20",
    userId: 1,
  },
  {
    type: "expense" as const,
    amount: 120,
    description: "Electric Bill",
    category: "Utilities",
    date: "2025-05-25",
    userId: 1,
  },
  {
    type: "expense" as const,
    amount: 35,
    description: "Gas",
    category: "Transportation",
    date: "2025-05-28",
    userId: 1,
  },
  {
    type: "income" as const,
    amount: 250,
    description: "Tax Refund",
    category: "Other Income",
    date: "2025-05-30",
    userId: 1,
  },
  {
    type: "income" as const,
    amount: 4500,
    description: "Monthly Salary",
    category: "Salary",
    date: "2025-06-01",
    userId: 2,
  },
  {
    type: "expense" as const,
    amount: 950,
    description: "Rent Payment",
    category: "Housing",
    date: "2025-06-03",
    userId: 2,
  },
  {
    type: "expense" as const,
    amount: 75,
    description: "Grocery Shopping",
    category: "Food",
    date: "2025-06-07",
    userId: 2,
  },
  {
    type: "expense" as const,
    amount: 15,
    description: "Spotify Subscription",
    category: "Entertainment",
    date: "2025-06-10",
    userId: 2,
  },
  {
    type: "income" as const,
    amount: 800,
    description: "Freelance Project",
    category: "Side Hustle",
    date: "2025-06-12",
    userId: 2,
  },
  {
    type: "expense" as const,
    amount: 40,
    description: "Coffee Shop",
    category: "Dining Out",
    date: "2025-06-15",
    userId: 2,
  },
  {
    type: "expense" as const,
    amount: 95,
    description: "Internet Bill",
    category: "Utilities",
    date: "2025-06-18",
    userId: 2,
  },
  {
    type: "expense" as const,
    amount: 50,
    description: "Bus Pass",
    category: "Transportation",
    date: "2025-06-20",
    userId: 2,
  },
  {
    type: "expense" as const,
    amount: 120,
    description: "Gym Membership",
    category: "Health",
    date: "2025-06-22",
    userId: 2,
  },
  {
    type: "income" as const,
    amount: 300,
    description: "Investment Dividend",
    category: "Investment",
    date: "2025-06-25",
    userId: 2,
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
    await sql.end();
  }
};

// Run the seeding process
main();
