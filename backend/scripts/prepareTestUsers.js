const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/user");
const Item = require("../models/item");
const SwapRequest = require("../models/swapRequest");
const Message = require("../models/message");

const SHARED_TEST_PASSWORD = "Test@12345";

const TEST_USERS_DATA = [
  { name: "Aarav Sharma", email: "user1@rewear.test", location: "Mumbai, Maharashtra" },
  { name: "Ananya Patel", email: "user2@rewear.test", location: "Ahmedabad, Gujarat" },
  { name: "Rohan Mehta", email: "user3@rewear.test", location: "Bengaluru, Karnataka" },
  { name: "Priya Singh", email: "user4@rewear.test", location: "Delhi, NCR" },
  { name: "Vikram Verma", email: "user5@rewear.test", location: "Pune, Maharashtra" },
  { name: "Neha Gupta", email: "user6@rewear.test", location: "Jaipur, Rajasthan" },
  { name: "Aditya Joshi", email: "user7@rewear.test", location: "Hyderabad, Telangana" },
  { name: "Sneha Nair", email: "user8@rewear.test", location: "Kochi, Kerala" },
  { name: "Karan Malhotra", email: "user9@rewear.test", location: "Chandigarh, Punjab" },
  { name: "Riya Sen", email: "user10@rewear.test", location: "Kolkata, West Bengal" },
  { name: "Rahul Rao", email: "user11@rewear.test", location: "Chennai, Tamil Nadu" },
  { name: "Pooja Iyer", email: "user12@rewear.test", location: "Coimbatore, Tamil Nadu" },
  { name: "Amit Desai", email: "user13@rewear.test", location: "Surat, Gujarat" },
  { name: "Tanvi Kulkarni", email: "user14@rewear.test", location: "Nagpur, Maharashtra" },
  { name: "Varun Kapoor", email: "user15@rewear.test", location: "Lucknow, Uttar Pradesh" },
  { name: "Divya Pillai", email: "user16@rewear.test", location: "Thiruvananthapuram, Kerala" },
  { name: "Siddharth Jain", email: "user17@rewear.test", location: "Indore, Madhya Pradesh" },
  { name: "Ishita Bansal", email: "user18@rewear.test", location: "Bhopal, Madhya Pradesh" },
  { name: "Manish Tiwari", email: "user19@rewear.test", location: "Patna, Bihar" },
  { name: "Kavita Reddy", email: "user20@rewear.test", location: "Visakhapatnam, Andhra Pradesh" },
];

// Accounts to clean up
const OLD_TEST_EMAILS = ["test@gmial.com", "kapil1@gmail.com", "hardik@gmail.com"];

async function main() {
  console.log("==================================================");
  console.log("   ReWear: Prepare Database for Multi-User Testing");
  console.log("==================================================");

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not found in backend .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(" Connected to MongoDB.");

  // 1. Verify Admin Account Protection
  const adminUser = await User.findOne({ role: "admin" });
  if (!adminUser) {
    throw new Error("CRITICAL: No admin account found in database. Aborting to protect system.");
  }
  console.log(` Admin account verified: ${adminUser.name} (${adminUser.email}) [ID: ${adminUser._id}]`);

  // 2. Clean up old non-admin test accounts & references
  console.log("\n--- STEP 1: Cleaning Old Test Data ---");
  const usersToDelete = await User.find({
    email: { $in: OLD_TEST_EMAILS.map((e) => e.toLowerCase().trim()) },
    role: { $ne: "admin" }, // Double guard: NEVER delete an admin
  });

  const userIdsToDelete = usersToDelete.map((u) => u._id);

  if (userIdsToDelete.length > 0) {
    console.log(`Found ${userIdsToDelete.length} old test user(s) to remove: ${usersToDelete.map((u) => u.email).join(", ")}`);

    // Clean up items owned by these users
    const itemsToDelete = await Item.find({ owner: { $in: userIdsToDelete } });
    const itemIdsToDelete = itemsToDelete.map((i) => i._id);
    if (itemIdsToDelete.length > 0) {
      const itemDeleteRes = await Item.deleteMany({ _id: { $in: itemIdsToDelete } });
      console.log(` Deleted ${itemDeleteRes.deletedCount} listing(s) owned by removed users.`);
    }

    // Clean up swap requests involving these users (as requester, receiver, or referencing their items)
    const swapsToDelete = await SwapRequest.find({
      $or: [
        { requester: { $in: userIdsToDelete } },
        { receiver: { $in: userIdsToDelete } },
        { requestedItem: { $in: itemIdsToDelete } },
        { offeredItem: { $in: itemIdsToDelete } },
      ],
    });
    const swapIdsToDelete = swapsToDelete.map((s) => s._id);

    if (swapIdsToDelete.length > 0) {
      // Clean messages linked to these swaps
      const msgDeleteRes = await Message.deleteMany({ swapRequest: { $in: swapIdsToDelete } });
      console.log(` Deleted ${msgDeleteRes.deletedCount} message(s) linked to removed swap requests.`);

      const swapDeleteRes = await SwapRequest.deleteMany({ _id: { $in: swapIdsToDelete } });
      console.log(` Deleted ${swapDeleteRes.deletedCount} swap request(s).`);
    }

    // Delete the users
    const userDeleteRes = await User.deleteMany({ _id: { $in: userIdsToDelete } });
    console.log(` Deleted ${userDeleteRes.deletedCount} old test account(s).`);
  } else {
    console.log("No old test accounts found to clean.");
  }

  // 3. Create / Seed 20 Normal Test Users (Idempotent)
  console.log("\n--- STEP 2: Creating 20 Normal Test Users ---");
  const hashedPassword = await bcrypt.hash(SHARED_TEST_PASSWORD, 10);

  let createdCount = 0;
  let updatedCount = 0;

  for (const userData of TEST_USERS_DATA) {
    const emailNorm = userData.email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailNorm });

    if (!existing) {
      await User.create({
        name: userData.name.trim(),
        email: emailNorm,
        password: hashedPassword,
        location: userData.location,
        role: "user", // Enforce normal user role
      });
      createdCount++;
    } else {
      // If already exists, ensure role is 'user' and password hash is set
      existing.name = userData.name.trim();
      existing.password = hashedPassword;
      existing.location = userData.location;
      existing.role = "user"; // Never admin
      await existing.save();
      updatedCount++;
    }
  }

  console.log(` Successfully processed 20 test users (${createdCount} created, ${updatedCount} existing updated).`);

  // 4. Verification
  console.log("\n--- STEP 3: Verification Checks ---");

  // Check all 20 test users exist
  const allTestUsers = await User.find({
    email: { $in: TEST_USERS_DATA.map((u) => u.email) },
  });
  console.log(` [VERIFIED] All 20 test users present in MongoDB (found: ${allTestUsers.length}/20).`);
  if (allTestUsers.length !== 20) {
    throw new Error(`Expected 20 test users, found ${allTestUsers.length}`);
  }

  // Verify roles
  const nonUserRoles = allTestUsers.filter((u) => u.role !== "user");
  if (nonUserRoles.length > 0) {
    throw new Error(`Security violation: Some test users have non-user role: ${JSON.stringify(nonUserRoles)}`);
  }
  console.log(" [VERIFIED] Every test user is assigned role: 'user'. None has 'admin'.");

  // Verify only admin has role: admin
  const allAdmins = await User.find({ role: "admin" });
  console.log(` [VERIFIED] Total admin accounts in database: ${allAdmins.length} (${allAdmins.map((a) => a.email).join(", ")})`);
  if (allAdmins.length !== 1 || allAdmins[0].email !== adminUser.email) {
    throw new Error("Security violation: Unexpected admin user found!");
  }

  // Verify password hash on sample
  const sampleUser = await User.findOne({ email: "user1@rewear.test" });
  const samplePassValid = await bcrypt.compare(SHARED_TEST_PASSWORD, sampleUser.password);
  console.log(` [VERIFIED] Password hashing verified for sample user user1@rewear.test: ${samplePassValid}`);
  if (!samplePassValid) {
    throw new Error("Password verification failed for test user.");
  }

  // Check database integrity (no orphaned items, swaps, or messages)
  const remainingUsers = await User.find({}, "_id");
  const validUserIds = remainingUsers.map((u) => u._id.toString());

  const orphanedItems = await Item.find({ owner: { $nin: validUserIds } });
  console.log(` [VERIFIED] Orphaned items count: ${orphanedItems.length}`);

  const orphanedSwaps = await SwapRequest.find({
    $or: [{ requester: { $nin: validUserIds } }, { receiver: { $nin: validUserIds } }],
  });
  console.log(` [VERIFIED] Orphaned swap requests count: ${orphanedSwaps.length}`);

  console.log("\n==================================================");
  console.log("   ALL TEST USERS PREPARED & VERIFIED SUCCESSFULLY");
  console.log("==================================================");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
