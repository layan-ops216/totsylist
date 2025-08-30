export const mockBabyRegistryData = {
  summary: {
    due_date: "Having a baby in February",
    budget: "midtier",
    key_prefs: ["eco-friendly"],
    disclaimers: ["Generated recommendations based on your needs"]
  },
  categories: [
    {
      category: "Newborn Essentials",
      priority: "essential",
      items: [
        {
          name: "Glass Baby Bottles (4-pack)",
          brand: "Philips Avent",
          why: "BPA-free glass, easy to clean, eco-friendly option",
          eco_friendly: true,
          est_price_usd: 35
        },
        {
          name: "Organic Cotton Onesies (6-pack)",
          brand: "Burt's Bees Baby",
          why: "Soft organic cotton, perfect for sensitive newborn skin",
          eco_friendly: true,
          est_price_usd: 28
        }
      ]
    },
    {
      category: "Sleep & Comfort",
      priority: "essential",
      items: [
        {
          name: "Convertible Crib",
          brand: "Babyletto Hudson",
          why: "Sustainable wood, converts to toddler bed",
          eco_friendly: true,
          est_price_usd: 350
        },
        {
          name: "Organic Crib Mattress",
          brand: "Naturepedic",
          why: "Organic materials, dual firmness for newborn safety",
          eco_friendly: true,
          est_price_usd: 300
        }
      ]
    },
    {
      category: "Diaper Station",
      priority: "essential",
      items: [
        {
          name: "Eco-Friendly Diapers (Size 1)",
          brand: "Honest Company",
          why: "Plant-based materials, hypoallergenic for newborns",
          eco_friendly: true,
          est_price_usd: 45
        },
        {
          name: "Changing Pad",
          brand: "Keekaroo Peanut",
          why: "Easy to clean, no fabric cover needed",
          eco_friendly: true,
          est_price_usd: 160
        }
      ]
    },
    {
      category: "Going Out",
      priority: "nice_to_have",
      items: [
        {
          name: "Infant Car Seat",
          brand: "Chicco KeyFit 30",
          why: "Top safety ratings, easy installation for February baby",
          eco_friendly: false,
          est_price_usd: 200
        },
        {
          name: "Baby Carrier",
          brand: "Ergobaby Omni 360",
          why: "Multiple positions, great for bonding with newborn",
          eco_friendly: false,
          est_price_usd: 180
        }
      ]
    }
  ]
};
