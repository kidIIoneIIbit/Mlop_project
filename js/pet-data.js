/* ================================================
   PET-DATA.JS — Product catalog, breeds, scoring
   ================================================ */

/* ─── Breed lists ────────────────────────────────── */
const BREEDS = {
    dog: [
        'Mix / Unknown', 'Golden Retriever', 'Labrador Retriever', 'German Shepherd',
        'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Dachshund',
        'Siberian Husky', 'Shih Tzu', 'Pomeranian', 'Chihuahua', 'Border Collie',
        'Maltese', 'Yorkshire Terrier', 'Boxer', 'Great Dane', 'Corgi'
    ],
    cat: [
        'Mix / Unknown', 'Persian', 'Maine Coon', 'Siamese', 'British Shorthair',
        'Scottish Fold', 'Ragdoll', 'American Shorthair', 'Sphynx', 'Bengal',
        'Abyssinian', 'Burmese', 'Russian Blue', 'Norwegian Forest', 'Birman'
    ]
};

/* ─── Product Catalog (20 products) ─────────────── */
const PRODUCTS = [
    // ── Dogs ──────────────────────────────────────────
    {
        id: 'P001',
        name: 'Royal Canin Renal Support',
        brand: 'Royal Canin',
        species: 'dog',
        emoji: '🐕',
        price: 890,
        unit: '3kg',
        tags: ['kidney', 'senior'],
        targets: ['Kidney', 'Senior Care'],
        ageMin: 5, ageMax: 20,
        protein: 'Chicken & Rice',
        proteinPct: 18,
        fatPct: 8,
        fiberPct: 5.2,
        moisture: 10,
        calories: 350,
        description: 'Specially formulated to support dogs with kidney disease. Low phosphorus, high-quality protein to reduce renal workload.',
        suitableFor: 'Dogs 5+ years with kidney conditions',
        diseaseSupport: ['Kidney'],
        ageGroup: 'Senior (5+ years)',
        highlight: 'Low phosphorus',
        scoreBoost: { Kidney: 35, 'Senior Care': 15 }
    },
    {
        id: 'P002',
        name: 'Hill\'s Perfect Weight',
        brand: 'Hill\'s Science Diet',
        species: 'dog',
        emoji: '🐶',
        price: 1250,
        unit: '3.5kg',
        tags: ['obesity', 'weight-loss'],
        targets: ['Weight Loss'],
        ageMin: 1, ageMax: 12,
        protein: 'Lean Chicken',
        proteinPct: 28,
        fatPct: 9,
        fiberPct: 8.1,
        moisture: 10,
        calories: 280,
        description: 'Clinically proven weight management formula with high fiber and lean protein to help achieve and maintain ideal body weight.',
        suitableFor: 'Overweight adult dogs 1–12 years',
        diseaseSupport: ['Obesity'],
        ageGroup: 'Adult (1–12 years)',
        highlight: 'High fiber, low calorie',
        scoreBoost: { Obesity: 35, 'Weight Loss': 30 }
    },
    {
        id: 'P003',
        name: 'Purina Pro Plan Sport',
        brand: 'Purina',
        species: 'dog',
        emoji: '🐕‍🦺',
        price: 980,
        unit: '4kg',
        tags: ['active', 'performance'],
        targets: ['Active Lifestyle'],
        ageMin: 1, ageMax: 8,
        protein: 'Salmon & Rice',
        proteinPct: 30,
        fatPct: 20,
        fiberPct: 2.5,
        moisture: 10,
        calories: 460,
        description: 'High-energy formula for active and working dogs. Supports muscle strength and endurance with optimized amino acid profile.',
        suitableFor: 'Active dogs 1–8 years',
        diseaseSupport: [],
        ageGroup: 'Adult (1–8 years)',
        highlight: 'High protein & energy',
        scoreBoost: { 'Active Lifestyle': 40 }
    },
    {
        id: 'P004',
        name: 'Royal Canin Hypoallergenic',
        brand: 'Royal Canin',
        species: 'dog',
        emoji: '🐕',
        price: 1450,
        unit: '2kg',
        tags: ['allergy', 'sensitive'],
        targets: ['Weight Loss'],
        ageMin: 1, ageMax: 15,
        protein: 'Hydrolyzed Soy',
        proteinPct: 22,
        fatPct: 12,
        fiberPct: 3.8,
        moisture: 10,
        calories: 340,
        description: 'Hydrolyzed protein formula minimizes allergic reactions. Single protein source for dogs with food sensitivities.',
        suitableFor: 'Dogs with skin or food allergies',
        diseaseSupport: ['Allergy'],
        ageGroup: 'All ages (1+ years)',
        highlight: 'Hydrolyzed protein',
        scoreBoost: { Allergy: 40 }
    },
    {
        id: 'P005',
        name: 'Purina EN Gastroenteric',
        brand: 'Purina Pro Plan Vet',
        species: 'dog',
        emoji: '🐶',
        price: 760,
        unit: '2kg',
        tags: ['digestive', 'gastrointestinal'],
        targets: ['Weight Loss'],
        ageMin: 1, ageMax: 15,
        protein: 'Chicken & Oatmeal',
        proteinPct: 24,
        fatPct: 13,
        fiberPct: 3.0,
        moisture: 10,
        calories: 370,
        description: 'Highly digestible formula to ease gastrointestinal distress. Prebiotic fiber supports healthy gut microbiome.',
        suitableFor: 'Dogs with digestive issues',
        diseaseSupport: ['Digestive'],
        ageGroup: 'Adult (1+ years)',
        highlight: 'Highly digestible',
        scoreBoost: { Digestive: 40 }
    },
    {
        id: 'P006',
        name: 'Hill\'s Senior 7+',
        brand: 'Hill\'s Science Diet',
        species: 'dog',
        emoji: '🐕',
        price: 1080,
        unit: '3kg',
        tags: ['senior', 'joint'],
        targets: ['Senior Care'],
        ageMin: 7, ageMax: 20,
        protein: 'Turkey & Barley',
        proteinPct: 20,
        fatPct: 10,
        fiberPct: 4.5,
        moisture: 10,
        calories: 300,
        description: 'Science-based formula for dogs 7+. Supports cognitive function, joint health, and immune system with antioxidant blend.',
        suitableFor: 'Senior dogs 7+ years',
        diseaseSupport: ['Kidney', 'Digestive'],
        ageGroup: 'Senior (7+ years)',
        highlight: 'Brain & joint support',
        scoreBoost: { 'Senior Care': 40, Kidney: 10 }
    },
    {
        id: 'P007',
        name: 'Acana Heritage Prairie',
        brand: 'Acana',
        species: 'dog',
        emoji: '🐕‍🦺',
        price: 1680,
        unit: '2kg',
        tags: ['active', 'premium', 'grain-free'],
        targets: ['Active Lifestyle'],
        ageMin: 1, ageMax: 10,
        protein: 'Prairie Lamb & Duck',
        proteinPct: 33,
        fatPct: 19,
        fiberPct: 4.0,
        moisture: 9,
        calories: 470,
        description: 'Premium biologically appropriate diet. 70% animal ingredients from free-range lamb and duck. Grain-free.',
        suitableFor: 'Active adult dogs 1–10 years',
        diseaseSupport: ['Allergy'],
        ageGroup: 'Adult (1–10 years)',
        highlight: '70% meat ingredients',
        scoreBoost: { 'Active Lifestyle': 30, Allergy: 15 }
    },
    {
        id: 'P008',
        name: 'Purina OM Overweight Mgmt',
        brand: 'Purina Pro Plan Vet',
        species: 'dog',
        emoji: '🐶',
        price: 890,
        unit: '3kg',
        tags: ['obesity', 'weight-loss', 'clinical'],
        targets: ['Weight Loss'],
        ageMin: 2, ageMax: 12,
        protein: 'Chicken & Corn',
        proteinPct: 30,
        fatPct: 7,
        fiberPct: 10.2,
        moisture: 10,
        calories: 260,
        description: 'Veterinary-formulated for overweight management. Ultra-high fiber keeps dogs feeling full while reducing calories.',
        suitableFor: 'Obese or overweight adult dogs',
        diseaseSupport: ['Obesity'],
        ageGroup: 'Adult (2–12 years)',
        highlight: 'Ultra-high fiber formula',
        scoreBoost: { Obesity: 40, 'Weight Loss': 35 }
    },
    // ── Cats ──────────────────────────────────────────
    {
        id: 'P009',
        name: 'Royal Canin Renal Cat',
        brand: 'Royal Canin',
        species: 'cat',
        emoji: '🐱',
        price: 680,
        unit: '2kg',
        tags: ['kidney', 'senior'],
        targets: ['Kidney', 'Senior Care'],
        ageMin: 4, ageMax: 20,
        protein: 'Chicken & Rice',
        proteinPct: 24,
        fatPct: 14,
        fiberPct: 4.8,
        moisture: 10,
        calories: 380,
        description: 'Specially developed for cats with chronic kidney disease. Restricted phosphorus and high-quality protein for renal support.',
        suitableFor: 'Cats 4+ years with kidney conditions',
        diseaseSupport: ['Kidney'],
        ageGroup: 'Adult & Senior (4+ years)',
        highlight: 'Low phosphorus formula',
        scoreBoost: { Kidney: 40, 'Senior Care': 12 }
    },
    {
        id: 'P010',
        name: 'Hill\'s Prescription Diet w/d',
        brand: 'Hill\'s Science Diet',
        species: 'cat',
        emoji: '🐈',
        price: 1120,
        unit: '1.8kg',
        tags: ['obesity', 'weight-loss', 'diabetes'],
        targets: ['Weight Loss'],
        ageMin: 1, ageMax: 15,
        protein: 'Chicken & Egg',
        proteinPct: 32,
        fatPct: 7,
        fiberPct: 9.5,
        moisture: 10,
        calories: 270,
        description: 'Multi-functional weight management for cats. High fiber, low fat, moderate protein — supports healthy glucose metabolism.',
        suitableFor: 'Overweight or diabetic cats',
        diseaseSupport: ['Obesity'],
        ageGroup: 'Adult (1+ years)',
        highlight: 'High fiber, low calorie',
        scoreBoost: { Obesity: 38, 'Weight Loss': 30 }
    },
    {
        id: 'P011',
        name: 'Orijen Cat & Kitten',
        brand: 'Orijen',
        species: 'cat',
        emoji: '🐈',
        price: 1980,
        unit: '1.8kg',
        tags: ['active', 'premium', 'grain-free'],
        targets: ['Active Lifestyle'],
        ageMin: 0, ageMax: 8,
        protein: 'Chicken, Turkey & Fish',
        proteinPct: 40,
        fatPct: 20,
        fiberPct: 3.0,
        moisture: 10,
        calories: 500,
        description: 'Biologically appropriate diet with 90% animal ingredients. Mirrors the diet cats evolved to eat. Highest protein formula.',
        suitableFor: 'Active cats all life stages',
        diseaseSupport: ['Allergy'],
        ageGroup: 'All life stages',
        highlight: '90% animal ingredients',
        scoreBoost: { 'Active Lifestyle': 40, Allergy: 10 }
    },
    {
        id: 'P012',
        name: 'Purina HA Hypoallergenic',
        brand: 'Purina Pro Plan Vet',
        species: 'cat',
        emoji: '🐱',
        price: 890,
        unit: '1.6kg',
        tags: ['allergy', 'sensitive'],
        targets: ['Weight Loss'],
        ageMin: 1, ageMax: 15,
        protein: 'Hydrolyzed Soy',
        proteinPct: 20,
        fatPct: 12,
        fiberPct: 3.5,
        moisture: 10,
        calories: 330,
        description: 'Hydrolyzed protein to eliminate common allergens. Supports skin and coat health in allergy-prone cats.',
        suitableFor: 'Cats with food allergies or sensitivities',
        diseaseSupport: ['Allergy'],
        ageGroup: 'Adult (1+ years)',
        highlight: 'Hydrolyzed protein',
        scoreBoost: { Allergy: 40 }
    },
    {
        id: 'P013',
        name: 'Royal Canin Digestive Care',
        brand: 'Royal Canin',
        species: 'cat',
        emoji: '🐈',
        price: 620,
        unit: '2kg',
        tags: ['digestive', 'sensitive-stomach'],
        targets: ['Weight Loss'],
        ageMin: 1, ageMax: 15,
        protein: 'Chicken & Fish',
        proteinPct: 28,
        fatPct: 14,
        fiberPct: 5.2,
        moisture: 10,
        calories: 360,
        description: 'Optimized digestibility with beet pulp and prebiotics for cats with sensitive stomachs and irregular digestion.',
        suitableFor: 'Cats with digestive sensitivities',
        diseaseSupport: ['Digestive'],
        ageGroup: 'Adult (1+ years)',
        highlight: 'Prebiotic & digestive enzymes',
        scoreBoost: { Digestive: 40 }
    },
    {
        id: 'P014',
        name: 'Hill\'s Adult 7+ Senior',
        brand: 'Hill\'s Science Diet',
        species: 'cat',
        emoji: '🐱',
        price: 780,
        unit: '1.6kg',
        tags: ['senior', 'vitality'],
        targets: ['Senior Care'],
        ageMin: 7, ageMax: 20,
        protein: 'Salmon & Chicken',
        proteinPct: 25,
        fatPct: 12,
        fiberPct: 4.0,
        moisture: 10,
        calories: 310,
        description: 'Anti-aging formula for cats 7+ with omega-6 acids, L-carnitine and antioxidants. Supports lean muscle and healthy organs.',
        suitableFor: 'Senior cats 7+ years',
        diseaseSupport: ['Kidney', 'Digestive'],
        ageGroup: 'Senior (7+ years)',
        highlight: 'Anti-aging antioxidants',
        scoreBoost: { 'Senior Care': 40, Kidney: 12 }
    },
    {
        id: 'P015',
        name: 'Acana Pacifica Cat',
        brand: 'Acana',
        species: 'cat',
        emoji: '🐈',
        price: 1450,
        unit: '1.8kg',
        tags: ['active', 'premium', 'fish'],
        targets: ['Active Lifestyle'],
        ageMin: 1, ageMax: 10,
        protein: 'Mackerel, Herring & Salmon',
        proteinPct: 37,
        fatPct: 18,
        fiberPct: 3.5,
        moisture: 10,
        calories: 450,
        description: 'Premium grain-free fish-based diet for active cats. Rich in DHA for brain health and EPA for joint support.',
        suitableFor: 'Active adult cats 1–10 years',
        diseaseSupport: ['Allergy'],
        ageGroup: 'Adult (1–10 years)',
        highlight: 'Wild-caught Pacific fish',
        scoreBoost: { 'Active Lifestyle': 35, Allergy: 12 }
    },
    {
        id: 'P016',
        name: 'Purina One Weight Control',
        brand: 'Purina',
        species: 'cat',
        emoji: '🐱',
        price: 480,
        unit: '1.5kg',
        tags: ['obesity', 'weight-loss', 'affordable'],
        targets: ['Weight Loss'],
        ageMin: 1, ageMax: 12,
        protein: 'Turkey & Pea',
        proteinPct: 34,
        fatPct: 10,
        fiberPct: 6.5,
        moisture: 10,
        calories: 290,
        description: 'Affordable weight management formula with real turkey as #1 ingredient. Helps cats reach and maintain healthy weight.',
        suitableFor: 'Overweight cats 1–12 years',
        diseaseSupport: ['Obesity'],
        ageGroup: 'Adult (1–12 years)',
        highlight: 'Budget-friendly weight formula',
        scoreBoost: { Obesity: 30, 'Weight Loss': 28 }
    },
    {
        id: 'P017',
        name: 'Farmina N&D Kidney',
        brand: 'Farmina',
        species: 'dog',
        emoji: '🐕',
        price: 1120,
        unit: '2kg',
        tags: ['kidney', 'grain-free'],
        targets: ['Kidney', 'Senior Care'],
        ageMin: 3, ageMax: 20,
        protein: 'White Fish & Pea',
        proteinPct: 16,
        fatPct: 12,
        fiberPct: 3.5,
        moisture: 10,
        calories: 320,
        description: 'Grain-free renal diet with omega-3 from fish oil. Low phosphorus and controlled protein to manage kidney disease progression.',
        suitableFor: 'Dogs with CKD aged 3+ years',
        diseaseSupport: ['Kidney'],
        ageGroup: 'Adult & Senior',
        highlight: 'Omega-3 fish oil for kidney',
        scoreBoost: { Kidney: 38, 'Senior Care': 10 }
    },
    {
        id: 'P018',
        name: 'Pro Plan Sensitive Skin & Stomach',
        brand: 'Purina Pro Plan',
        species: 'dog',
        emoji: '🐶',
        price: 890,
        unit: '2.5kg',
        tags: ['allergy', 'digestive', 'sensitive'],
        targets: [],
        ageMin: 1, ageMax: 15,
        protein: 'Salmon & Rice',
        proteinPct: 26,
        fatPct: 14,
        fiberPct: 3.8,
        moisture: 10,
        calories: 360,
        description: 'Dual formula addressing both skin sensitivities and stomach issues. High DHA omega-3 from salmon for skin barrier support.',
        suitableFor: 'Dogs with allergies and digestive issues',
        diseaseSupport: ['Allergy', 'Digestive'],
        ageGroup: 'Adult (1+ years)',
        highlight: 'Dual skin & digestive care',
        scoreBoost: { Allergy: 30, Digestive: 28 }
    },
    {
        id: 'P019',
        name: 'Royal Canin Indoor Sterilized',
        brand: 'Royal Canin',
        species: 'cat',
        emoji: '🐈‍⬛',
        price: 720,
        unit: '2kg',
        tags: ['indoor', 'sterilized', 'weight'],
        targets: ['Weight Loss', 'Senior Care'],
        ageMin: 1, ageMax: 12,
        protein: 'Poultry & Rice',
        proteinPct: 30,
        fatPct: 9,
        fiberPct: 7.0,
        moisture: 10,
        calories: 295,
        description: 'Tailored for indoor sterilized cats with tendency to gain weight. L-carnitine supports fat metabolism. Fiber for hairball control.',
        suitableFor: 'Indoor sterilized cats 1–12 years',
        diseaseSupport: ['Obesity', 'Digestive'],
        ageGroup: 'Adult (1–12 years)',
        highlight: 'Indoor + hairball control',
        scoreBoost: { 'Weight Loss': 20, Obesity: 25, Digestive: 15 }
    },
    {
        id: 'P020',
        name: 'Taste of the Wild Pacific Stream',
        brand: 'Taste of the Wild',
        species: 'dog',
        emoji: '🐕‍🦺',
        price: 1380,
        unit: '6kg',
        tags: ['active', 'grain-free', 'premium'],
        targets: ['Active Lifestyle'],
        ageMin: 1, ageMax: 12,
        protein: 'Smoked Salmon',
        proteinPct: 25,
        fatPct: 15,
        fiberPct: 3.0,
        moisture: 10,
        calories: 400,
        description: 'Grain-free recipe with real smoked salmon, omega-3 fatty acids. Rich mixture of antioxidant-rich fruits and vegetables.',
        suitableFor: 'Active adult dogs 1–12 years',
        diseaseSupport: ['Allergy'],
        ageGroup: 'Adult (1–12 years)',
        highlight: 'Real smoked salmon',
        scoreBoost: { 'Active Lifestyle': 30, Allergy: 15 }
    }
];

/* ─── Scoring Engine ─────────────────────────────── */
function scoreProduct(product, profile) {
    let score = 50; // base score

    const { species, age, weight, conditions, goals } = profile;

    // Species match (critical)
    if (product.species !== species) return 0;

    // Age compatibility
    if (age < product.ageMin || age > product.ageMax) score -= 20;
    else score += 10;

    // Condition matches
    conditions.forEach(cond => {
        if (cond === 'None') { score += 5; return; }
        if (product.diseaseSupport.includes(cond)) {
            score += (product.scoreBoost[cond] || 20);
        }
    });

    // Goal matches
    goals.forEach(goal => {
        if (product.targets.includes(goal)) {
            score += (product.scoreBoost[goal] || 15);
        }
    });

    // Weight/obesity heuristic
    if (weight !== null) {
        const heavyDog = species === 'dog' && weight > 30;
        const heavyCat = species === 'cat' && weight > 6;
        if ((heavyDog || heavyCat) && product.tags.includes('obesity')) score += 15;
    }

    // Senior age bonus
    const isSenior = (species === 'dog' && age >= 7) || (species === 'cat' && age >= 10);
    if (isSenior && product.tags.includes('senior')) score += 12;

    // Active lifestyle bonus for young animals
    const isYoungActive = age < 5;
    if (isYoungActive && product.tags.includes('active')) score += 8;

    // Clamp 0–100
    return Math.min(100, Math.max(0, Math.round(score)));
}

function getRecommendations(profile, clickLog = []) {
    const products = PRODUCTS.filter(p => p.species === profile.species);

    // Adaptive boost: find categories of clicked products
    const boostCategories = {};
    clickLog.forEach(click => {
        const p = PRODUCTS.find(x => x.id === click.productId);
        if (p) {
            p.diseaseSupport.forEach(d => { boostCategories[d] = (boostCategories[d] || 0) + 8; });
            p.tags.forEach(t => { boostCategories[t] = (boostCategories[t] || 0) + 5; });
        }
    });

    const scored = products.map(p => {
        let s = scoreProduct(p, profile);
        // Apply adaptive boost
        Object.entries(boostCategories).forEach(([cat, boost]) => {
            if (p.diseaseSupport.includes(cat) || p.tags.includes(cat)) s += boost;
        });
        s = Math.min(100, s);
        return { ...p, score: s };
    });

    return scored
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

function generateReason(product, profile) {
    const parts = [];
    const { conditions, goals, age, species } = profile;

    // Condition-specific reason
    conditions.forEach(cond => {
        if (cond === 'None') return;
        if (product.diseaseSupport.includes(cond)) {
            const condReasons = {
                Kidney: `Low phosphorus & restricted protein — supports ${species === 'dog' ? 'canine' : 'feline'} kidney function`,
                Obesity: `High fiber, low-calorie formula — promotes healthy weight loss`,
                Allergy: `Hydrolyzed/single protein source — minimizes allergic reactions`,
                Digestive: `Highly digestible ingredients with prebiotics — soothes GI tract`
            };
            if (condReasons[cond]) parts.push(condReasons[cond]);
        }
    });

    // Goal-specific reason
    goals.forEach(goal => {
        if (goal === 'Senior Care' && age >= 5) parts.push(`Antioxidant-rich formula supports aging ${species === 'dog' ? 'dogs' : 'cats'} 5+ years`);
        if (goal === 'Active Lifestyle') parts.push(`High protein & calorie-dense — fuels active ${species === 'dog' ? 'dogs' : 'cats'}`);
        if (goal === 'Weight Loss') parts.push(`Calorie-controlled with L-carnitine to burn fat and maintain muscle`);
    });

    // Fallback
    if (parts.length === 0) {
        parts.push(`${product.highlight} — balanced nutrition for your ${species === 'dog' ? 'dog' : 'cat'}`);
    }

    return parts[0];
}

/* ─── LocalStorage helpers ───────────────────────── */
const STORAGE = {
    saveProfile(profile) { localStorage.setItem('petProfile', JSON.stringify(profile)); },
    getProfile() { try { return JSON.parse(localStorage.getItem('petProfile')) || null; } catch { return null; } },
    getClickLog() { try { return JSON.parse(localStorage.getItem('clickLog')) || []; } catch { return []; } },
    addClick(productId, productName) {
        const log = STORAGE.getClickLog();
        log.push({
            productId, productName,
            timestamp: new Date().toISOString(),
            sessionId: `sess_${Date.now().toString(36)}`
        });
        localStorage.setItem('clickLog', JSON.stringify(log));
    },
    clearAll() { localStorage.removeItem('petProfile'); localStorage.removeItem('clickLog'); },
    getProduct(id) { return PRODUCTS.find(p => p.id === id) || null; }
};
