
export type Resource = {
  slug: string;
  type: 'Article' | 'Video';
  title: string;
  description: string;
  image: string;
  imageHint: string;
  content?: string; 
  videoId?: string; 
};

export const resourcesData: Resource[] = [
  {
    type: "Article",
    title: "Nutrition Essentials for a Healthy Pregnancy",
    description: "Discover the key nutrients you and your baby need, from folic acid to iron.",
    image: "/images/week5.jpg",
    imageHint: "healthy food",
    slug: "pregnancy-nutrition",
    content: `
# Complete Pregnancy Nutrition Guide

A healthy, balanced diet is one of the most important things you can do for yourself and your baby during pregnancy. Here's your comprehensive guide to pregnancy nutrition.

## Essential Nutrients for Pregnancy

### **Folic Acid (Vitamin B9)**
- **Why it's important:** Prevents neural tube defects like spina bifida
- **Daily requirement:** 400-800 mcg
- **Best sources:** Leafy greens (spinach, kale), citrus fruits, beans, fortified cereals
- **When to start:** Ideally 3 months before conception

### **Iron**
- **Why it's important:** Prevents anemia and supports baby's growth
- **Daily requirement:** 27 mg (increased from 18 mg pre-pregnancy)
- **Best sources:** Lean red meat, poultry, fish, fortified cereals, beans
- **Tip:** Pair with vitamin C-rich foods to enhance absorption

### **Calcium**
- **Why it's important:** Builds baby's bones and teeth, protects your bone density
- **Daily requirement:** 1,000 mg
- **Best sources:** Dairy products, fortified plant milks, leafy greens, almonds
- **Note:** Your body absorbs calcium more efficiently during pregnancy

### **Protein**
- **Why it's important:** Essential for baby's growth and development
- **Daily requirement:** 75-100 grams
- **Best sources:** Lean meat, poultry, fish, eggs, beans, nuts, dairy

### **Omega-3 Fatty Acids**
- **Why it's important:** Supports baby's brain and eye development
- **Best sources:** Fatty fish (salmon, sardines), walnuts, flaxseeds, chia seeds
- **Note:** Choose low-mercury fish options

## Foods to Include Daily

**Breakfast:** Greek yogurt with berries and nuts
**Lunch:** Grilled chicken salad with leafy greens
**Dinner:** Salmon with quinoa and steamed vegetables
**Snacks:** Apple with peanut butter, carrot sticks with hummus

## Foods to Limit or Avoid

- **High-mercury fish:** Shark, swordfish, king mackerel, tilefish
- **Raw or undercooked foods:** Sushi, rare meat, raw eggs
- **Unpasteurized dairy:** Soft cheeses like brie, feta, blue cheese
- **Excess caffeine:** Limit to 200 mg per day
- **Alcohol:** Completely avoid during pregnancy

## Hydration

- **Water intake:** Aim for 8-12 glasses daily
- **Signs of dehydration:** Dark urine, dizziness, fatigue
- **Tips:** Carry a water bottle, add lemon for flavor

## Managing Common Issues

**Morning Sickness:** Eat small, frequent meals. Try ginger tea or crackers.
**Heartburn:** Avoid spicy foods, eat smaller meals, don't lie down after eating.
**Constipation:** Increase fiber intake, stay hydrated, exercise regularly.

*Remember: Every pregnancy is unique. Always consult your healthcare provider for personalized nutrition advice based on your specific needs and any medical conditions.*
    `
  },
  {
    type: "Video",
    title: "Guided Prenatal Meditation",
    description: "A 10-minute guided meditation to help you connect with your baby and find calm.",
    image: "/images/week15.jpg",
    imageHint: "meditation relaxation",
    slug: "prenatal-meditation",
    videoId: "rvaqPPjtxng"
  },
  {
    type: "Article",
    title: "Understanding the Trimesters of Pregnancy",
    description: "A week-by-week guide to the changes in your body and your baby's development.",
    image: "/images/week25.jpg",
    imageHint: "calendar timeline",
    slug: "trimester-guide",
    content: `
# Complete Guide to Pregnancy Trimesters

Pregnancy is an incredible journey divided into three distinct phases, each with its own unique characteristics, challenges, and milestones. Understanding what to expect during each trimester can help you prepare mentally and physically for the changes ahead.

## First Trimester (Weeks 1-12): The Foundation

### **Baby's Development**
- **Weeks 1-4:** Conception and implantation
- **Weeks 5-8:** Major organs begin forming (heart, brain, spinal cord)
- **Weeks 9-12:** Baby is now called a fetus, all major organs are present
- **Size:** Grows from microscopic to about 2.5 inches long

### **Your Body Changes**
- **Hormonal surge:** Estrogen and progesterone levels increase dramatically
- **Breast changes:** Tenderness, enlargement, darker nipples
- **Fatigue:** Extreme tiredness due to hormonal changes
- **Morning sickness:** Nausea and vomiting (can occur any time of day)
- **Frequent urination:** Increased blood flow to kidneys

### **Common Symptoms & Solutions**
- **Morning sickness:** Eat small, frequent meals, try ginger, stay hydrated
- **Fatigue:** Rest when possible, maintain good nutrition
- **Mood swings:** Normal due to hormones, practice self-care
- **Breast tenderness:** Wear supportive bras, avoid underwire

### **Important Milestones**
- First prenatal appointment (usually 8-10 weeks)
- First ultrasound (dating scan)
- Blood tests and genetic screening options

## Second Trimester (Weeks 13-28): The Golden Period

### **Baby's Development**
- **Weeks 13-16:** Baby begins moving (though you may not feel it yet)
- **Weeks 17-20:** You'll likely feel first movements (quickening)
- **Weeks 21-24:** Baby's face is fully formed, fingerprints develop
- **Weeks 25-28:** Baby responds to light and sound
- **Size:** Grows from about 3 inches to 14 inches long

### **Your Body Changes**
- **Energy returns:** Many women feel their best during this trimester
- **Baby bump appears:** Your pregnancy becomes visible
- **Skin changes:** "Pregnancy glow," possible stretch marks
- **Hair changes:** Often thicker and shinier
- **Back pain:** As your center of gravity shifts

### **Common Symptoms & Solutions**
- **Round ligament pain:** Sharp pains in lower abdomen, normal stretching
- **Heartburn:** Eat smaller meals, avoid lying down after eating
- **Leg cramps:** Stretch before bed, stay hydrated
- **Back pain:** Practice good posture, wear supportive shoes

### **Important Milestones**
- Anatomy scan (18-22 weeks)
- Gender reveal (if desired)
- Feeling baby's first movements
- Planning for maternity leave

## Third Trimester (Weeks 29-40): The Final Countdown

### **Baby's Development**
- **Weeks 29-32:** Baby gains weight rapidly, brain development accelerates
- **Weeks 33-36:** Baby practices breathing, immune system develops
- **Weeks 37-40:** Baby is considered full-term, ready for birth
- **Size:** Grows from about 15 inches to 20+ inches long

### **Your Body Changes**
- **Growing belly:** Baby bump is prominent
- **Braxton Hicks contractions:** Practice contractions, normal
- **Baby dropping:** Baby may move lower in pelvis (lightening)
- **Swelling:** Feet and ankles may swell
- **Difficulty sleeping:** Finding comfortable positions becomes challenging

### **Common Symptoms & Solutions**
- **Shortness of breath:** Baby pressing on diaphragm, normal
- **Frequent urination:** Baby pressing on bladder
- **Back pain:** Use pregnancy pillows, practice gentle stretches
- **Insomnia:** Create bedtime routine, use extra pillows

### **Important Milestones**
- Weekly doctor visits (starting around 36 weeks)
- Birth plan finalization
- Hospital bag packing
- Final preparations for baby's arrival

## Key Differences Between Trimesters

| Aspect | First Trimester | Second Trimester | Third Trimester |
|--------|----------------|------------------|-----------------|
| **Energy Level** | Very low | High | Variable |
| **Morning Sickness** | Common | Usually improves | Rare |
| **Baby Movements** | None felt | Begin to feel | Regular and strong |
| **Doctor Visits** | Monthly | Monthly | Weekly (late) |
| **Focus** | Survival | Enjoyment | Preparation |

## Tips for Each Trimester

### **First Trimester Survival Tips**
- Rest when you need to
- Eat what you can keep down
- Start taking prenatal vitamins
- Begin gentle exercise if approved by doctor

### **Second Trimester Wellness Tips**
- Enjoy your energy boost
- Start prenatal classes
- Begin planning for baby
- Continue or start gentle exercise

### **Third Trimester Preparation Tips**
- Rest when possible
- Practice relaxation techniques
- Pack your hospital bag
- Finalize birth plan

*Remember: Every pregnancy is unique. These are general guidelines, but your experience may vary. Always consult your healthcare provider with any concerns.*
    `
  },
    {
    type: "Video",
    title: "Safe Exercises for the Second Trimester",
    description: "Stay active and strong with these safe and effective exercises.",
    image: "/images/week35.jpg",
    imageHint: "woman exercising",
    slug: "second-trimester-exercise",
    videoId: "rvaqPPjtxng"
  },
  {
    type: "Article",
    title: "Staying Active: Safe Work and Activities During Pregnancy",
    description: "A guide to safe exercises and daily activities to help you stay healthy and comfortable throughout your pregnancy.",
    image: "/images/week38.jpg",
    imageHint: "pregnant woman walking",
    slug: "safe-activities-pregnancy",
    content: `
Staying active during pregnancy is beneficial for both you and your baby, but it's important to choose your activities wisely.

**Safe Exercises:**
Most experts agree that at least 30 minutes of moderate exercise on most days of the week is healthy. Great options include:
- **Walking:** A simple, effective, low-impact exercise.
- **Swimming:** The water supports your weight, making it gentle on your joints.
- **Stationary Cycling:** A safe way to get your heart rate up without the risk of falling.
- **Prenatal Yoga:** Helps with flexibility, breathing, and stress reduction.

**Activities to Approach with Caution or Avoid:**
- **Heavy Lifting:** Avoid lifting heavy objects, which can strain your back and pelvic floor.
- **Contact Sports:** Sports with a high risk of collision should be avoided.
- **Activities with Fall Risk:** Skiing, gymnastics, or horseback riding carry a risk of falling that could harm the baby.
- **Lying Flat on Your Back:** Especially in the second and third trimesters, this can put pressure on a major vein and reduce blood flow.

**Important Note:** This is general advice. Every pregnancy is unique. **Always consult your doctor or midwife** before starting or continuing any exercise program. They can give you personalized advice based on your health and fitness level.
    `
  },
  {
    type: "Article",
    title: "Sleep Solutions for Pregnancy",
    description: "Tips and techniques to help you get better sleep during pregnancy and prepare for postpartum rest.",
    image: "/images/week8.jpg",
    imageHint: "sleep rest",
    slug: "pregnancy-sleep-solutions",
    content: `
Getting quality sleep during pregnancy can be challenging, but it's essential for your health and your baby's development.

**Sleep Position:**
- Sleep on your left side to improve blood flow to your baby
- Use pillows to support your belly and between your knees
- Avoid sleeping on your back, especially in the second and third trimesters

**Creating a Sleep Routine:**
- Go to bed and wake up at the same time each day
- Create a relaxing bedtime routine (warm bath, reading, gentle stretching)
- Keep your bedroom cool, dark, and quiet
- Limit screen time before bed

**Managing Common Sleep Issues:**
- **Frequent Urination:** Limit fluids in the evening, but stay hydrated during the day
- **Heartburn:** Eat smaller meals and avoid lying down immediately after eating
- **Restless Legs:** Gentle stretching and massage before bed can help
- **Anxiety:** Practice relaxation techniques like deep breathing or meditation

**When to Seek Help:**
If sleep problems persist or significantly impact your daily life, talk to your healthcare provider. They can help identify underlying causes and suggest appropriate solutions.
    `
  },
  {
    type: "Video",
    title: "Prenatal Massage Techniques",
    description: "Learn safe self-massage techniques to relieve pregnancy discomfort and promote relaxation.",
    image: "/images/week18.jpg",
    imageHint: "massage therapy",
    slug: "prenatal-massage",
    videoId: "B5n3g2G_UXE"
  },
  {
    type: "Article",
    title: "Mental Health and Emotional Wellness",
    description: "Understanding and managing emotional changes during pregnancy, including stress, anxiety, and mood swings.",
    image: "/images/week26.jpg",
    imageHint: "mental health",
    slug: "pregnancy-mental-health",
    content: `
Pregnancy brings significant emotional and psychological changes. It's normal to experience a range of emotions, from joy and excitement to anxiety and mood swings.

**Common Emotional Changes:**
- **Mood Swings:** Hormonal changes can cause rapid mood shifts
- **Anxiety:** Worries about the baby's health, labor, and parenting are common
- **Stress:** Physical changes and life adjustments can be overwhelming
- **Depression:** Some women experience prenatal depression

**Coping Strategies:**
- **Talk About It:** Share your feelings with your partner, friends, or healthcare provider
- **Practice Self-Care:** Make time for activities you enjoy
- **Stay Connected:** Maintain relationships with friends and family
- **Seek Support:** Join pregnancy support groups or online communities
- **Professional Help:** Don't hesitate to seek counseling if needed

**When to Seek Professional Help:**
- Persistent feelings of sadness or hopelessness
- Excessive worry or anxiety that interferes with daily life
- Thoughts of harming yourself or your baby
- Difficulty sleeping or eating for extended periods

**Remember:** Your mental health is just as important as your physical health. Taking care of yourself emotionally helps you take better care of your baby.
    `
  },
  {
    type: "Article",
    title: "Preparing Your Home for Baby",
    description: "A comprehensive guide to creating a safe, comfortable, and nurturing environment for your newborn.",
    image: "/images/week34.jpg",
    imageHint: "baby nursery",
    slug: "preparing-home-for-baby",
    content: `
Preparing your home for your baby's arrival is an exciting part of pregnancy. Here's a comprehensive guide to help you create a safe and comfortable environment.

**Essential Baby Gear:**
- **Sleeping:** Crib or bassinet with a firm mattress and fitted sheets
- **Feeding:** Bottles, formula (if not breastfeeding), nursing pillow
- **Diapering:** Diapers, wipes, changing table or pad
- **Transportation:** Car seat, stroller, baby carrier
- **Safety:** Baby monitor, outlet covers, cabinet locks

**Nursery Setup:**
- Choose a quiet location away from drafts and direct sunlight
- Keep the room at a comfortable temperature (68-72°F)
- Install blackout curtains for better sleep
- Ensure good ventilation
- Keep the room clean and dust-free

**Safety Considerations:**
- Install smoke and carbon monoxide detectors
- Secure heavy furniture to walls
- Cover electrical outlets
- Remove small objects that could be choking hazards
- Install baby gates at stairs
- Keep cleaning supplies and medications locked away

**Creating a Calming Environment:**
- Use soft, soothing colors
- Add gentle lighting options
- Include white noise machines if helpful
- Keep the room organized and clutter-free

**Remember:** You don't need everything at once. Start with the essentials and add items as needed. Focus on safety and comfort rather than perfection.
    `
  }
];
