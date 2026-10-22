const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/user");
const Item = require("../models/item");

const USER_LISTINGS_MAP = {
  "user1@rewear.test": [
    {
      title: "Vintage Leather Biker Jacket",
      brand: "Zara",
      description: "Edgy faux-leather biker jacket with silver hardware and asymmetrical zip.",
      category: "Jacket",
      size: "L",
      condition: "Like new",
      estimatedValue: 2800,
    },
    {
      title: "Navy Slim-Fit Casual Shirt",
      brand: "Levi's",
      description: "Soft washed cotton navy shirt, versatile for smart casual occasions.",
      category: "Shirt",
      size: "M",
      condition: "Good",
      estimatedValue: 1200,
    },
  ],
  "user2@rewear.test": [
    {
      title: "Floral Embroidered Summer Dress",
      brand: "Mango",
      description: "Breezy A-line cotton dress with delicate floral embroidery on sleeves.",
      category: "Dress",
      size: "S",
      condition: "Like new",
      estimatedValue: 1900,
    },
    {
      title: "Canvas Tote Shoulder Bag",
      brand: "H&M",
      description: "Sturdy cream canvas everyday tote bag with internal zip pocket.",
      category: "Bag",
      size: "One Size",
      condition: "Good",
      estimatedValue: 850,
    },
    {
      title: "Beige Linen Wide-Leg Pants",
      brand: "Uniqlo",
      description: "Lightweight breathable linen blend trousers with elasticated waistband.",
      category: "Pants",
      size: "M",
      condition: "Like new",
      estimatedValue: 1500,
    },
  ],
  "user3@rewear.test": [
    {
      title: "Oversized Fleece Pullover Hoodie",
      brand: "Nike",
      description: "Cozy warm fleece pullover hoodie with front kangaroo pocket in sage green.",
      category: "Hoodie",
      size: "XL",
      condition: "Good",
      estimatedValue: 2200,
    },
    {
      title: "White Retro Running Sneakers",
      brand: "Adidas",
      description: "Classic court sneakers with cushioned sole and contrast stripes.",
      category: "Shoes",
      size: "42",
      condition: "Like new",
      estimatedValue: 3100,
    },
  ],
  "user4@rewear.test": [
    {
      title: "Classic Black Ribbed Knit Top",
      brand: "Zara",
      description: "Minimalist mock-neck ribbed knit top, perfect for layering.",
      category: "Top",
      size: "M",
      condition: "Like new",
      estimatedValue: 950,
    },
    {
      title: "Pleated Pastel Midi Dress",
      brand: "Forever 21",
      description: "Soft lilac pleated midi dress with cinched waist and flutter sleeves.",
      category: "Dress",
      size: "M",
      condition: "Good",
      estimatedValue: 1600,
    },
    {
      title: "Distressed High-Waist Denim Jeans",
      brand: "Levi's",
      description: "Authentic straight-leg blue denim with subtle knee distressing.",
      category: "Pants",
      size: "28",
      condition: "Good",
      estimatedValue: 1800,
    },
  ],
  "user5@rewear.test": [
    {
      title: "Waterproof Trail Windbreaker Jacket",
      brand: "Puma",
      description: "Lightweight weather-resistant running jacket with reflective accents.",
      category: "Jacket",
      size: "L",
      condition: "Like new",
      estimatedValue: 2400,
    },
    {
      title: "Graphic Skate Hoodie",
      brand: "Vans",
      description: "Heavyweight black cotton skate hoodie with classic back graphic.",
      category: "Hoodie",
      size: "L",
      condition: "Good",
      estimatedValue: 1700,
    },
  ],
  "user6@rewear.test": [
    {
      title: "Handcrafted Ethnic Kurti Dress",
      brand: "FabIndia",
      description: "Pure cotton block-printed A-line dress with side slits and wooden buttons.",
      category: "Dress",
      size: "S",
      condition: "Like new",
      estimatedValue: 1750,
    },
    {
      title: "Brown Vegan Leather Crossbody Bag",
      brand: "Accessorize",
      description: "Compact saddle bag with adjustable strap and antique brass buckle.",
      category: "Bag",
      size: "One Size",
      condition: "Good",
      estimatedValue: 1100,
    },
  ],
  "user7@rewear.test": [
    {
      title: "Black Streetwear Cargo Pants",
      brand: "Uniqlo",
      description: "Modern relaxed utility pants with multiple deep cargo pockets.",
      category: "Pants",
      size: "32",
      condition: "Like new",
      estimatedValue: 1900,
    },
    {
      title: "Striped Oxford Cotton Shirt",
      brand: "Tommy Hilfiger",
      description: "Classic blue and white striped button-down collar Oxford shirt.",
      category: "Shirt",
      size: "40",
      condition: "Good",
      estimatedValue: 1600,
    },
    {
      title: "Low-Top Suede Casual Shoes",
      brand: "Puma",
      description: "Navy suede lifestyle sneakers with clean rubber outsole.",
      category: "Shoes",
      size: "43",
      condition: "Fair",
      estimatedValue: 1300,
    },
  ],
  "user8@rewear.test": [
    {
      title: "Boho Tiered Maxi Dress",
      brand: "H&M",
      description: "Flowy emerald green tiered maxi dress in soft viscose fabric.",
      category: "Dress",
      size: "M",
      condition: "Like new",
      estimatedValue: 1800,
    },
    {
      title: "Olive Green Utility Cropped Top",
      brand: "Zara",
      description: "Structured cotton button-front cropped top with chest flap pockets.",
      category: "Top",
      size: "S",
      condition: "Good",
      estimatedValue: 800,
    },
  ],
  "user9@rewear.test": [
    {
      title: "Quilted Winter Puffer Jacket",
      brand: "Jack & Jones",
      description: "Insulated matte black puffer jacket with fleece-lined collar.",
      category: "Jacket",
      size: "XL",
      condition: "Like new",
      estimatedValue: 3200,
    },
    {
      title: "Heather Grey Zip Hoodie",
      brand: "Gap",
      description: "Comfortable everyday full-zip fleece hoodie with waffle hood lining.",
      category: "Hoodie",
      size: "L",
      condition: "Good",
      estimatedValue: 1400,
    },
  ],
  "user10@rewear.test": [
    {
      title: "Polka Dot Wrap Sundress",
      brand: "Mango",
      description: "Vintage-inspired black and white polka dot wrap dress with ruffle hem.",
      category: "Dress",
      size: "S",
      condition: "Like new",
      estimatedValue: 1650,
    },
    {
      title: "Woven Straw Summer Beach Bag",
      brand: "Zara",
      description: "Natural round woven straw tote with leather handles.",
      category: "Bag",
      size: "One Size",
      condition: "Good",
      estimatedValue: 1200,
    },
    {
      title: "High-Rise Linen Trousers",
      brand: "Uniqlo",
      description: "Tailored off-white linen pants with front pleats and side pockets.",
      category: "Pants",
      size: "S",
      condition: "Like new",
      estimatedValue: 1400,
    },
  ],
  "user11@rewear.test": [
    {
      title: "Breathable Running Sports Shoes",
      brand: "Nike",
      description: "Lightweight mesh athletic shoes with responsive foam cushioning.",
      category: "Shoes",
      size: "41",
      condition: "Good",
      estimatedValue: 2100,
    },
    {
      title: "Casual Linen Half-Sleeve Shirt",
      brand: "Marks & Spencer",
      description: "Breezy pastel pink linen resort collar shirt.",
      category: "Shirt",
      size: "M",
      condition: "Like new",
      estimatedValue: 1350,
    },
  ],
  "user12@rewear.test": [
    {
      title: "Pastel Chiffon Evening Dress",
      brand: "Vero Moda",
      description: "Elegant mint green layered chiffon gown with beaded neckline.",
      category: "Dress",
      size: "M",
      condition: "Like new",
      estimatedValue: 2300,
    },
    {
      title: "Faux Leather Structured Handbag",
      brand: "Baggit",
      description: "Classic burgundy formal tote bag with twin handles and magnetic clasp.",
      category: "Bag",
      size: "One Size",
      condition: "Good",
      estimatedValue: 1100,
    },
  ],
  "user13@rewear.test": [
    {
      title: "Dark Wash Denim Trucker Jacket",
      brand: "Levi's",
      description: "Rugged dark blue denim jacket with contrast stitching and metal buttons.",
      category: "Jacket",
      size: "L",
      condition: "Like new",
      estimatedValue: 2600,
    },
    {
      title: "Chino Slim-Fit Cotton Pants",
      brand: "Peter England",
      description: "Tailored khaki flat-front chinos made from stretch cotton twill.",
      category: "Pants",
      size: "34",
      condition: "Good",
      estimatedValue: 1250,
    },
    {
      title: "Printed Casual Rayon Shirt",
      brand: "Zara",
      description: "Tropical botanical print camp collar summer party shirt.",
      category: "Shirt",
      size: "L",
      condition: "Like new",
      estimatedValue: 1100,
    },
  ],
  "user14@rewear.test": [
    {
      title: "Cozy Knitted Oversized Top",
      brand: "H&M",
      description: "Chunky cable-knit cream sweater with dropped shoulders.",
      category: "Top",
      size: "M",
      condition: "Like new",
      estimatedValue: 1150,
    },
    {
      title: "Lavender Graphic Pullover Hoodie",
      brand: "Urbanic",
      description: "Pastel lavender casual hoodie with minimal typography front print.",
      category: "Hoodie",
      size: "M",
      condition: "Good",
      estimatedValue: 1300,
    },
  ],
  "user15@rewear.test": [
    {
      title: "Black Lightweight Bomber Jacket",
      brand: "Zara",
      description: "Sleek nylon flight jacket with ribbed collar and sleeve utility pocket.",
      category: "Jacket",
      size: "XL",
      condition: "Good",
      estimatedValue: 2200,
    },
    {
      title: "Formal Leather Oxford Shoes",
      brand: "Bata Red Label",
      description: "Polished black cap-toe leather dress shoes for formal wear.",
      category: "Shoes",
      size: "43",
      condition: "Like new",
      estimatedValue: 2500,
    },
  ],
  "user16@rewear.test": [
    {
      title: "Emerald Silk Blend Festive Dress",
      brand: "Global Desi",
      description: "Rich emerald festive midi dress with gold zari accents and tasseled belt.",
      category: "Dress",
      size: "M",
      condition: "Like new",
      estimatedValue: 2100,
    },
    {
      title: "Embroidered Bohemian Sling Bag",
      brand: "FabIndia",
      description: "Compact colorful thread-embroidered ethnic sling bag with pom-pom charms.",
      category: "Bag",
      size: "One Size",
      condition: "Good",
      estimatedValue: 950,
    },
  ],
  "user17@rewear.test": [
    {
      title: "Casual Plaid Flannel Shirt",
      brand: "Roadster",
      description: "Warm brushed cotton red and black buffalo check button-down shirt.",
      category: "Shirt",
      size: "M",
      condition: "Good",
      estimatedValue: 900,
    },
    {
      title: "Khaki Relaxed Fit Cargo Pants",
      brand: "H&M",
      description: "Durable cotton twill utility cargos with drawstring cuffs.",
      category: "Pants",
      size: "32",
      condition: "Like new",
      estimatedValue: 1600,
    },
    {
      title: "Classic White Canvas Tennis Shoes",
      brand: "Converse",
      description: "Timeless low-top white canvas sneakers with signature rubber toe cap.",
      category: "Shoes",
      size: "42",
      condition: "Fair",
      estimatedValue: 1400,
    },
  ],
  "user18@rewear.test": [
    {
      title: "Cropped Pastel Fleece Hoodie",
      brand: "Nike",
      description: "Soft baby-blue cropped fleece hoodie with embroidered swoosh.",
      category: "Hoodie",
      size: "S",
      condition: "Like new",
      estimatedValue: 2000,
    },
    {
      title: "Square-Neck Floral Summer Top",
      brand: "Zara",
      description: "Smocked bodice top with puff sleeves and yellow ditsy floral print.",
      category: "Top",
      size: "S",
      condition: "Good",
      estimatedValue: 850,
    },
  ],
  "user19@rewear.test": [
    {
      title: "Denim Sherpa Lined Winter Jacket",
      brand: "Wrangler",
      description: "Heavyweight medium wash trucker jacket lined with warm faux sherpa.",
      category: "Jacket",
      size: "L",
      condition: "Good",
      estimatedValue: 2700,
    },
    {
      title: "Crisp White Formal Cotton Shirt",
      brand: "Arrow",
      description: "Non-iron premium 100% Egyptian cotton formal business shirt.",
      category: "Shirt",
      size: "42",
      condition: "Like new",
      estimatedValue: 1450,
    },
  ],
  "user20@rewear.test": [
    {
      title: "Indigo Block Print Cotton Dress",
      brand: "FabIndia",
      description: "Natural indigo dyed midi dress with flared skirt and mandarin collar.",
      category: "Dress",
      size: "L",
      condition: "Like new",
      estimatedValue: 1700,
    },
    {
      title: "Mini Tan Leather Backpack",
      brand: "Fossil",
      description: "Compact genuine tan leather backpack purse with gold zip closures.",
      category: "Bag",
      size: "One Size",
      condition: "Like new",
      estimatedValue: 2800,
    },
    {
      title: "Comfort Stretch Ankle Jeans",
      brand: "Levi's",
      description: "Mid-rise dark wash skinny jeans with gentle ankle crop.",
      category: "Pants",
      size: "30",
      condition: "Good",
      estimatedValue: 1650,
    },
  ],
};

async function main() {
  console.log("==================================================");
  console.log("   ReWear: Seed Sample Clothing Listings on Explore");
  console.log("==================================================");

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not found in backend .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(" Connected to MongoDB.");

  // Fetch all 20 test users
  const testEmails = Object.keys(USER_LISTINGS_MAP);
  const users = await User.find({ email: { $in: testEmails } });
  console.log(` Found ${users.length} test user account(s) in MongoDB.`);

  if (users.length === 0) {
    throw new Error("No test users found. Please run prepareTestUsers.js first.");
  }

  const userMap = new Map();
  users.forEach((u) => userMap.set(u.email, u));

  let createdCount = 0;
  let updatedCount = 0;

  for (const [email, itemsList] of Object.entries(USER_LISTINGS_MAP)) {
    const user = userMap.get(email);
    if (!user) {
      console.warn(`User ${email} not found, skipping.`);
      continue;
    }

    for (const itemDef of itemsList) {
      // Check if item with this title already exists for this owner
      const existing = await Item.findOne({
        title: itemDef.title,
        owner: user._id,
      });

      if (!existing) {
        await Item.create({
          title: itemDef.title,
          brand: itemDef.brand,
          description: itemDef.description,
          category: itemDef.category,
          size: itemDef.size,
          condition: itemDef.condition,
          image: "", // Will use ClothingCard category fallback images
          location: user.location || "India",
          availability: "available",
          estimatedValue: itemDef.estimatedValue,
          owner: user._id,
        });
        createdCount++;
      } else {
        existing.brand = itemDef.brand;
        existing.description = itemDef.description;
        existing.category = itemDef.category;
        existing.size = itemDef.size;
        existing.condition = itemDef.condition;
        existing.location = user.location || "India";
        existing.availability = "available";
        existing.estimatedValue = itemDef.estimatedValue;
        await existing.save();
        updatedCount++;
      }
    }
  }

  console.log(`\n Listings Seeding Completed:`);
  console.log(` - Created new items: ${createdCount}`);
  console.log(` - Updated existing items: ${updatedCount}`);

  // Summary of total items now in database
  const totalItems = await Item.countDocuments();
  const availableItems = await Item.countDocuments({ availability: "available" });
  console.log(` Total items in database: ${totalItems}`);
  console.log(` Available items ready for Explore: ${availableItems}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Listing seed failed:", err);
  process.exit(1);
});
