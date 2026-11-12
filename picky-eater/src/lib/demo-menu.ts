// The Demo mode menu: a made-up restaurant, "Harbor & Vine", with 3 pages and 45 dishes.
// Each dish has a printed description (what a customer sees) and an ingredient list
// (what the kitchen knows). Demo scoring checks the user's rules, including their own
// "+ Other" entries, against these ingredients, fully offline.
//
// The menu deliberately includes test cases:
// - obvious allergens (peanut satay, shrimp scampi, mac & cheese)
// - hidden ones (pesto → pine nuts, Caesar → anchovy + egg, miso → fish stock, tiramisu → wine)
// - vegan and halal-friendly dishes, high-protein and low-carb options
// - vague dishes that must come back "Ask your server" (soup of the day, shared fryer, sorbet)

export type DemoPage = { number: number; title: string };

export const DEMO_RESTAURANT = "Harbor & Vine";

export const DEMO_PAGES: DemoPage[] = [
  { number: 1, title: "Starters & Salads" },
  { number: 2, title: "Mains" },
  { number: 3, title: "Sides, Desserts & Drinks" },
];

/** Goal fit 0–100, in this order. */
const GOAL_ORDER = ["healthy", "high_protein", "low_carb", "low_calorie", "low_sodium", "low_sugar", "gut_friendly", "heart_healthy", "high_fiber"] as const;
type GoalFit = Record<(typeof GOAL_ORDER)[number], number>;
const g = (...v: number[]): GoalFit => Object.fromEntries(GOAL_ORDER.map((id, i) => [id, v[i]])) as GoalFit;

export type DemoDish = {
  name: string;
  description: string;
  price: string;
  page: number;
  section: string;
  ingredients: string[];
  goals: GoalFit;
  reasons: string[];
  tags: string[];
  /**
   * Rules a real server would need to confirm: built-in rule ids, or
   * "ALL" (recipe unknown) / "ALL_ALLERGENS" (e.g. a flavor that changes daily).
   */
  unsure?: string[] | "ALL" | "ALL_ALLERGENS";
  /** Certifications printed on the menu, e.g. halal-certified meat. */
  certified?: ("halal" | "kosher")[];
};

export const DEMO_DISHES: DemoDish[] = [
  /* ---------- Page 1: Starters & Salads ---------- */
  { page: 1, section: "Starters", name: "Chicken Satay Skewers", price: "$11", description: "Grilled chicken skewers with peanut sauce",
    ingredients: ["chicken", "peanut", "soy sauce", "garlic", "coconut milk", "brown sugar", "cucumber"], goals: g(60, 85, 60, 65, 35, 45, 50, 55, 25),
    reasons: ["Grilled chicken gives you plenty of protein.", "The peanut sauce adds sugar and salt."], tags: ["High protein", "Contains peanuts", "Grilled"] },
  { page: 1, section: "Starters", name: "Edamame with Sea Salt", price: "$6", description: "Steamed soybeans, flaky sea salt",
    ingredients: ["edamame", "sea salt"], goals: g(85, 70, 55, 85, 40, 95, 70, 85, 85),
    reasons: ["A light, plant-based snack with protein and fiber."], tags: ["Vegan", "High fiber", "Contains soy"] },
  { page: 1, section: "Starters", name: "Crispy Calamari", price: "$12", description: "Fried squid, lemon aioli. Cooked in a shared fryer",
    ingredients: ["squid", "wheat flour", "egg", "garlic", "lemon", "vegetable oil"], unsure: ["fish", "shellfish", "sesame", "soy", "peanuts"], goals: g(30, 55, 30, 40, 30, 90, 35, 30, 15),
    reasons: ["Deep-fried, so it's heavy for a starter.", "It's cooked in a fryer shared with other foods."], tags: ["Fried", "Seafood", "Shared fryer"] },
  { page: 1, section: "Starters", name: "Hummus & Warm Pita", price: "$9", description: "Chickpeas, tahini, garlic, olive oil",
    ingredients: ["chickpea", "tahini", "garlic", "lemon", "olive oil", "pita bread"], goals: g(75, 40, 20, 55, 55, 90, 70, 75, 70),
    reasons: ["Chickpeas bring fiber and some protein.", "The pita adds carbs."], tags: ["Vegan", "Contains sesame", "High fiber"] },
  { page: 1, section: "Starters", name: "Vietnamese Spring Rolls", price: "$9", description: "Fresh rice paper rolls, shrimp, herbs, peanut dip",
    ingredients: ["rice paper", "shrimp", "rice noodle", "lettuce", "mint", "fish sauce", "peanut"], goals: g(80, 55, 50, 70, 45, 85, 65, 70, 45),
    reasons: ["Fresh, not fried, so they're light.", "The dipping sauce has peanuts and fish sauce."], tags: ["Fresh", "Contains shellfish", "Contains peanuts"] },
  { page: 1, section: "Starters", name: "Burrata & Heirloom Tomatoes", price: "$13", description: "Creamy burrata, tomatoes, basil, balsamic",
    ingredients: ["burrata", "tomato", "basil", "olive oil", "balsamic vinegar"], goals: g(55, 45, 70, 50, 55, 80, 50, 50, 30),
    reasons: ["Fresh tomatoes and basil.", "Burrata is rich and high in fat."], tags: ["Vegetarian", "Contains dairy"] },
  { page: 1, section: "Starters", name: "Buffalo Chicken Wings", price: "$12", description: "Spicy wings, celery sticks, blue cheese dip",
    ingredients: ["chicken", "butter", "hot sauce", "chili", "celery", "blue cheese"], goals: g(25, 75, 75, 25, 10, 85, 25, 15, 10),
    reasons: ["High in protein and low in carbs.", "Very salty, with a rich cheese dip."], tags: ["Spicy", "High protein", "Contains dairy"] },
  { page: 1, section: "Salads", name: "Kale Caesar", price: "$12", description: "Kale, parmesan, croutons, classic Caesar dressing",
    ingredients: ["kale", "parmesan", "crouton", "anchovy", "egg yolk", "garlic", "mustard", "lemon"], goals: g(60, 45, 55, 55, 35, 90, 55, 55, 55),
    reasons: ["Kale is full of nutrients.", "Caesar dressing is made with anchovy and raw egg."], tags: ["Contains fish", "Contains egg", "Contains dairy"] },
  { page: 1, section: "Salads", name: "Greek Salad", price: "$11", description: "Tomato, cucumber, red onion, olives, feta",
    ingredients: ["tomato", "cucumber", "red onion", "olive", "feta", "oregano", "olive oil"], goals: g(80, 35, 75, 75, 30, 90, 65, 75, 50),
    reasons: ["Lots of fresh vegetables.", "Feta and olives are salty."], tags: ["Vegetarian", "Contains dairy"] },
  { page: 1, section: "Salads", name: "Quinoa Power Bowl", price: "$14", description: "Quinoa, chickpeas, sweet potato, avocado, tahini",
    ingredients: ["quinoa", "chickpea", "sweet potato", "spinach", "avocado", "tahini", "lemon"], goals: g(95, 65, 35, 60, 75, 85, 85, 90, 95),
    reasons: ["Packed with fiber and plant protein.", "Healthy fats from avocado and tahini."], tags: ["Vegan", "High fiber", "Contains sesame"] },
  { page: 1, section: "Salads", name: "Thai Beef Salad", price: "$15", description: "Grilled beef, lime, chili, mint, red onion, peanuts",
    ingredients: ["beef", "lime", "fish sauce", "chili", "mint", "red onion", "peanut", "cucumber"], goals: g(75, 85, 75, 70, 35, 70, 65, 60, 45),
    reasons: ["Lean grilled beef and lots of fresh herbs.", "The dressing uses fish sauce."], tags: ["High protein", "Spicy", "Contains peanuts"] },
  { page: 1, section: "Salads", name: "Cobb Salad", price: "$15", description: "Chicken, bacon, egg, avocado, blue cheese, ranch",
    ingredients: ["chicken", "bacon", "egg", "avocado", "blue cheese", "tomato", "lettuce", "buttermilk ranch"], goals: g(55, 90, 85, 40, 25, 80, 50, 40, 40),
    reasons: ["Lots of protein and very low in carbs.", "Bacon and blue cheese add salt and fat."], tags: ["High protein", "Low carb", "Contains pork"] },
  { page: 1, section: "Soups", name: "Chef's Soup of the Day", price: "$8", description: "Ask your server about today's soup",
    ingredients: [], unsure: "ALL", goals: g(60, 40, 50, 65, 40, 70, 60, 60, 55),
    reasons: ["The recipe changes every day, so we can't check it for you."], tags: ["Changes daily"] },
  { page: 1, section: "Soups", name: "Miso Soup", price: "$5", description: "Miso broth, tofu, seaweed, scallion",
    ingredients: ["miso", "tofu", "seaweed", "scallion", "bonito fish stock"], goals: g(80, 40, 80, 90, 10, 90, 85, 60, 30),
    reasons: ["Light and good for your gut.", "The broth is very salty and made with fish stock."], tags: ["Gut-friendly", "Contains soy", "Contains fish"] },

  /* ---------- Page 2: Mains ---------- */
  { page: 2, section: "From the Grill", name: "Grilled Salmon Plate", price: "$24", description: "Salmon, asparagus, lemon butter, wild rice",
    ingredients: ["salmon", "asparagus", "butter", "lemon", "wild rice"], goals: g(92, 92, 60, 65, 65, 90, 75, 95, 55),
    reasons: ["Rich in protein and heart-healthy fats.", "Wild rice adds some carbs."], tags: ["High protein", "Omega-3s", "Contains fish"] },
  { page: 2, section: "From the Grill", name: "Ribeye Steak & Fries", price: "$34", description: "12 oz ribeye, garlic butter, hand-cut fries",
    ingredients: ["beef", "butter", "garlic", "potato fries"], goals: g(30, 95, 40, 20, 35, 90, 30, 20, 25),
    reasons: ["One of the highest-protein dishes here.", "Red meat, butter, and fries make it heavy."], tags: ["High protein", "Red meat", "Fried"] },
  { page: 2, section: "From the Grill", name: "Halal Chicken Shawarma Plate", price: "$17", description: "Halal-certified chicken, rice, salad, garlic sauce",
    ingredients: ["chicken", "rice", "garlic", "lemon", "lettuce", "tomato", "onion"], certified: ["halal"], goals: g(70, 88, 35, 55, 40, 80, 60, 65, 40),
    reasons: ["Lean chicken with a fresh salad.", "The rice makes it higher in carbs."], tags: ["Halal", "High protein"] },
  { page: 2, section: "From the Grill", name: "Lamb Kofta", price: "$21", description: "Spiced lamb skewers, yogurt sauce, couscous",
    ingredients: ["lamb", "onion", "parsley", "cumin", "yogurt", "couscous"], goals: g(55, 85, 40, 45, 40, 85, 55, 45, 40),
    reasons: ["Good protein from lamb.", "Couscous is made from wheat."], tags: ["High protein", "Contains dairy", "Contains wheat"] },
  { page: 2, section: "From the Grill", name: "BBQ Pulled Pork Sandwich", price: "$16", description: "Slow-cooked pork, BBQ sauce, brioche bun, slaw",
    ingredients: ["pork", "bbq sauce", "sugar", "vinegar", "brioche bun", "cabbage", "mayo"], goals: g(25, 70, 15, 25, 15, 25, 30, 20, 25),
    reasons: ["Sweet BBQ sauce and a big bun.", "High in sugar and salt."], tags: ["Contains pork", "Contains wheat", "Sugary"] },
  { page: 2, section: "Pasta & Noodles", name: "Linguine al Pesto", price: "$18", description: "Linguine with house basil pesto",
    ingredients: ["linguine pasta", "basil", "pine nut", "parmesan", "garlic", "olive oil"], goals: g(40, 35, 5, 30, 45, 80, 40, 50, 35),
    reasons: ["Mostly pasta, so it's high in carbs.", "House pesto is made with pine nuts and parmesan."], tags: ["Vegetarian", "Contains nuts", "Contains dairy"] },
  { page: 2, section: "Pasta & Noodles", name: "Pad Thai", price: "$17", description: "Rice noodles, shrimp, egg, peanuts, tamarind",
    ingredients: ["rice noodle", "shrimp", "egg", "peanut", "tamarind", "fish sauce", "bean sprout", "sugar"], goals: g(45, 60, 15, 35, 20, 40, 45, 40, 40),
    reasons: ["Sweet and salty, with lots of noodles.", "Has peanuts, shrimp, egg, and fish sauce."], tags: ["Contains peanuts", "Contains shellfish", "Contains egg"] },
  { page: 2, section: "Pasta & Noodles", name: "Spaghetti Carbonara", price: "$19", description: "Spaghetti, pancetta, egg, pecorino, black pepper",
    ingredients: ["spaghetti pasta", "pancetta", "egg", "pecorino cheese", "black pepper"], goals: g(25, 60, 10, 20, 25, 90, 25, 20, 25),
    reasons: ["Rich and creamy from egg and cheese.", "Pancetta is cured pork."], tags: ["Contains pork", "Contains egg", "Contains dairy"] },
  { page: 2, section: "Pasta & Noodles", name: "Wild Mushroom Risotto", price: "$18", description: "Arborio rice, wild mushrooms, parmesan, white wine",
    ingredients: ["arborio rice", "mushroom", "parmesan", "butter", "white wine", "onion"], goals: g(45, 30, 10, 35, 35, 85, 40, 45, 30),
    reasons: ["Creamy and filling, but mostly rice.", "Cooked with wine and butter."], tags: ["Vegetarian", "Contains dairy", "Contains alcohol"] },
  { page: 2, section: "Pasta & Noodles", name: "Chicken Ramen", price: "$17", description: "Wheat noodles, chicken broth, soft egg, scallion",
    ingredients: ["wheat noodle", "chicken broth", "soy sauce", "egg", "scallion", "sesame oil"], goals: g(45, 70, 20, 45, 10, 80, 55, 40, 30),
    reasons: ["Warm and filling, with good protein.", "Ramen broth is very salty."], tags: ["Contains wheat", "Contains egg", "Contains soy"] },
  { page: 2, section: "Plant-Based", name: "Chickpea & Spinach Curry", price: "$16", description: "Chickpeas, spinach, coconut, rice. May contain nuts",
    ingredients: ["chickpea", "spinach", "tomato", "coconut milk", "ginger", "garlic", "onion", "basmati rice"], unsure: ["tree_nuts", "peanuts"], goals: g(85, 55, 30, 65, 55, 80, 80, 85, 90),
    reasons: ["Lots of fiber and plant protein.", "The kitchen says it may contain nuts."], tags: ["Vegan", "High fiber", "May contain nuts"] },
  { page: 2, section: "Plant-Based", name: "Black Bean Burger", price: "$15", description: "Black bean patty, whole wheat bun, vegan mayo",
    ingredients: ["black bean", "whole wheat bun", "lettuce", "tomato", "onion", "vegan mayo"], goals: g(75, 60, 25, 50, 40, 70, 80, 75, 85),
    reasons: ["Plant protein and lots of fiber.", "The bun adds carbs."], tags: ["Vegan", "High fiber", "Contains wheat"] },
  { page: 2, section: "Plant-Based", name: "Tofu Teriyaki Bowl", price: "$15", description: "Tofu, teriyaki glaze, brown rice, broccoli, sesame",
    ingredients: ["tofu", "soy sauce", "sugar", "brown rice", "broccoli", "sesame seed"], goals: g(80, 65, 30, 60, 25, 45, 70, 75, 75),
    reasons: ["A balanced bowl with plant protein.", "Teriyaki sauce is sweet and salty."], tags: ["Vegan", "Contains soy", "Contains sesame"] },
  { page: 2, section: "Plant-Based", name: "Eggplant Parmesan", price: "$17", description: "Breaded eggplant, tomato sauce, mozzarella",
    ingredients: ["eggplant", "breadcrumb", "egg", "mozzarella", "parmesan", "tomato sauce"], goals: g(40, 45, 20, 35, 30, 75, 40, 40, 45),
    reasons: ["Breaded and baked with lots of cheese.", "Vegetarian, but quite heavy."], tags: ["Vegetarian", "Contains dairy", "Contains egg"] },
  { page: 2, section: "Seafood", name: "Market Fish Tacos", price: "$16", description: "Catch of the day, corn tortillas, chipotle crema",
    ingredients: ["white fish", "corn tortilla", "cabbage", "sour cream", "chipotle", "lime"], unsure: ["shellfish"], goals: g(70, 75, 40, 60, 45, 80, 60, 70, 50),
    reasons: ["Lean fish and fresh cabbage.", "The fish changes daily, so ask what it is."], tags: ["Contains fish", "Contains dairy"] },
  { page: 2, section: "Seafood", name: "Shrimp Scampi", price: "$23", description: "Shrimp, garlic, butter, white wine, spaghetti",
    ingredients: ["shrimp", "garlic", "butter", "white wine", "lemon", "spaghetti pasta"], goals: g(40, 70, 15, 35, 30, 85, 35, 40, 25),
    reasons: ["Good protein from shrimp.", "Lots of butter and pasta."], tags: ["Contains shellfish", "Contains dairy", "Contains alcohol"] },

  /* ---------- Page 3: Sides, Desserts & Drinks ---------- */
  { page: 3, section: "Sides", name: "Sweet Potato Fries", price: "$6", description: "Crispy sweet potato fries. Shared fryer",
    ingredients: ["sweet potato fries", "vegetable oil", "sea salt"], unsure: ["gluten", "wheat", "gluten_free", "fish", "shellfish"], goals: g(55, 15, 20, 40, 40, 75, 50, 50, 55),
    reasons: ["More fiber than regular fries.", "Fried in a fryer shared with other foods."], tags: ["Vegan", "Fried", "Shared fryer"] },
  { page: 3, section: "Sides", name: "Garlic Broccoli", price: "$5", description: "Steamed broccoli, garlic, olive oil, lemon",
    ingredients: ["broccoli", "garlic", "olive oil", "lemon"], goals: g(95, 35, 85, 90, 85, 95, 80, 90, 90),
    reasons: ["Light, fresh, and full of fiber."], tags: ["Vegan", "Low carb", "High fiber"] },
  { page: 3, section: "Sides", name: "Mac & Cheese", price: "$7", description: "Macaroni, aged cheddar, crispy breadcrumbs",
    ingredients: ["macaroni pasta", "cheddar cheese", "milk", "butter", "breadcrumb"], goals: g(15, 30, 5, 15, 15, 70, 20, 15, 10),
    reasons: ["Comfort food, heavy on cheese and pasta."], tags: ["Vegetarian", "Contains dairy", "Contains wheat"] },
  { page: 3, section: "Sides", name: "Side Salad", price: "$5", description: "Mixed greens, cucumber, cherry tomatoes, balsamic",
    ingredients: ["mixed greens", "cucumber", "cherry tomato", "balsamic vinegar", "olive oil"], goals: g(90, 15, 85, 95, 80, 85, 70, 85, 60),
    reasons: ["Light and fresh, with almost no calories."], tags: ["Vegan", "Low calorie"] },
  { page: 3, section: "Sides", name: "Garlic Naan", price: "$4", description: "Tandoor-baked flatbread, garlic, ghee",
    ingredients: ["wheat flour", "ghee", "garlic", "yogurt"], goals: g(20, 20, 5, 30, 30, 85, 40, 25, 15),
    reasons: ["Soft white bread brushed with butter."], tags: ["Vegetarian", "Contains wheat", "Contains dairy"] },
  { page: 3, section: "Desserts", name: "Tiramisu", price: "$9", description: "Espresso-soaked ladyfingers, mascarpone, cocoa",
    ingredients: ["ladyfinger biscuit", "wheat flour", "egg", "mascarpone cheese", "espresso", "cocoa", "marsala wine", "sugar"], goals: g(10, 15, 5, 10, 40, 5, 15, 10, 5),
    reasons: ["A rich dessert with lots of sugar.", "Made with marsala wine and raw egg."], tags: ["Dessert", "Contains alcohol", "Contains dairy"] },
  { page: 3, section: "Desserts", name: "Mango Sticky Rice", price: "$8", description: "Sweet sticky rice, fresh mango, coconut milk",
    ingredients: ["sticky rice", "mango", "coconut milk", "sugar", "sesame seed"], goals: g(30, 10, 5, 20, 60, 10, 30, 25, 25),
    reasons: ["Fresh fruit, but very sweet."], tags: ["Vegan", "Dessert", "Contains coconut"] },
  { page: 3, section: "Desserts", name: "Chocolate Avocado Mousse", price: "$8", description: "Vegan. Avocado, cocoa, maple, coconut cream, almonds",
    ingredients: ["avocado", "cocoa", "maple syrup", "coconut cream", "almond"], goals: g(55, 15, 30, 40, 85, 35, 40, 55, 55),
    reasons: ["A lighter dessert made from avocado.", "Topped with almonds."], tags: ["Vegan", "Dessert", "Contains nuts"] },
  { page: 3, section: "Desserts", name: "Cherry Almond Tart", price: "$9", description: "Cherries, almond cream, butter pastry",
    ingredients: ["cherry", "almond", "wheat flour", "butter", "egg", "sugar"], goals: g(15, 15, 5, 15, 55, 10, 15, 15, 15),
    reasons: ["A buttery pastry with sugar and nuts."], tags: ["Dessert", "Contains nuts", "Contains wheat"] },
  { page: 3, section: "Desserts", name: "Seasonal Sorbet", price: "$6", description: "Ask about today's flavor",
    ingredients: ["fruit", "sugar"], unsure: "ALL_ALLERGENS", goals: g(30, 0, 20, 60, 95, 10, 25, 40, 10),
    reasons: ["Light, but mostly sugar.", "The flavor changes, so ask what's in it."], tags: ["Dessert", "Changes daily"] },
  { page: 3, section: "Drinks", name: "Fresh Mint Lemonade", price: "$5", description: "Lemon, mint, cane sugar",
    ingredients: ["lemon", "mint", "cane sugar"], goals: g(40, 0, 15, 50, 100, 10, 30, 50, 0),
    reasons: ["Refreshing, but most of it is sugar."], tags: ["Vegan", "Sugary"] },
  { page: 3, section: "Drinks", name: "Mango Lassi", price: "$6", description: "Yogurt, mango, cardamom",
    ingredients: ["yogurt", "mango", "milk", "sugar", "cardamom"], goals: g(50, 40, 15, 45, 75, 20, 85, 50, 15),
    reasons: ["Yogurt is good for your gut.", "Sweetened with sugar."], tags: ["Vegetarian", "Contains dairy", "Gut-friendly"] },
  { page: 3, section: "Drinks", name: "Ginger Kombucha", price: "$6", description: "Fermented tea, ginger. Contains trace alcohol",
    ingredients: ["fermented tea", "ginger", "cane sugar"], unsure: ["no_alcohol", "halal"], goals: g(65, 0, 60, 85, 95, 55, 95, 60, 0),
    reasons: ["Great for your gut.", "Fermented drinks have a tiny bit of alcohol."], tags: ["Vegan", "Gut-friendly"] },
  { page: 3, section: "Drinks", name: "House Red Wine", price: "$10", description: "Glass of our house red",
    ingredients: ["red wine"], goals: g(30, 0, 70, 55, 100, 70, 30, 40, 0),
    reasons: ["Contains alcohol and sulfites."], tags: ["Alcohol", "Contains sulfites"] },
  { page: 3, section: "Drinks", name: "Iced Matcha Oat Latte", price: "$6", description: "Matcha, oat milk, maple syrup",
    ingredients: ["matcha", "oat milk", "maple syrup"], goals: g(60, 10, 30, 60, 90, 40, 50, 60, 15),
    reasons: ["Dairy-free, with a little sweetness."], tags: ["Vegan", "Dairy-free"] },
];
