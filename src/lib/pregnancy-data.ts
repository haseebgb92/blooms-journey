
export type PregnancyWeek = {
  week: number;
  babySize: string;
  babyDevelopment: string[];
  momSymptoms: string[];
  imageHint: string;
  image?: string;
};

export const pregnancyData: PregnancyWeek[] = [
  {
    week: 1,
    babySize: "This week is calculated from the first day of your last period.",
    babyDevelopment: [
      "No baby has been conceived yet.",
      "The body is preparing for ovulation.",
      "The uterine lining is shedding."
    ],
    momSymptoms: [
      "Menstrual bleeding",
      "Period-related cramps and fatigue"
    ],
    imageHint: "calendar date",
    image: "/images/week1.jpg"
  },
  {
    week: 2,
    babySize: "Ovulation occurs this week.",
    babyDevelopment: [
      "An egg is released from the ovary.",
      "Fertilization may occur if sperm meets the egg.",
      "This is the week of conception."
    ],
    momSymptoms: [
      "End of menstrual period",
      "Slight increase in basal body temperature",
      "Possible light ovulation pain"
    ],
    imageHint: "flower blooming",
    image: "/images/week2.jpg"
  },
  {
    week: 3,
    babySize: "About the size of a pinhead.",
    babyDevelopment: [
      "The fertilized egg (zygote) is rapidly dividing into a ball of cells (blastocyst).",
      "It travels down the fallopian tube to the uterus.",
      "Implantation into the uterine wall may occur."
    ],
    momSymptoms: [
      "Often no symptoms",
      "Some may experience light implantation spotting or cramping"
    ],
    imageHint: "poppy seed",
    image: "/images/week3.jpg"
  },
  {
    week: 4,
    babySize: "About the size of a poppy seed.",
    babyDevelopment: [
      "The blastocyst has implanted in the uterine lining.",
      "The amniotic sac and placenta are beginning to form.",
      "Early brain, spinal cord, and heart development begins."
    ],
    momSymptoms: [
      "Missed period is the first major sign",
      "Mild fatigue",
      "Breast tenderness"
    ],
    imageHint: "poppy seed",
    image: "/images/week4.jpg"
  },
  {
    week: 5,
    babySize: "About the size of a sesame seed.",
    babyDevelopment: [
      "The heart begins to form and may start to beat.",
      "The neural tube (which becomes the brain and spinal cord) is developing.",
      "Major organs like the kidneys and liver are starting to grow."
    ],
    momSymptoms: [
      "Morning sickness may begin",
      "Frequent urination",
      "Increased fatigue"
    ],
    imageHint: "sesame seed",
    image: "/images/week5.jpg"
  },
  {
    week: 6,
    babySize: "About the size of a lentil.",
    babyDevelopment: [
      "Facial features like eyes and nostrils are forming.",
      "Small buds that will become arms and legs are visible.",
      "The heartbeat can often be detected on an ultrasound."
    ],
    momSymptoms: [
      "Heightened sense of smell",
      "Food aversions or cravings",
      "Mood swings"
    ],
    imageHint: "lentil bean",
    image: "/images/week6.jpg"
  },
  {
    week: 7,
    babySize: "About the size of a blueberry.",
    babyDevelopment: [
      "The baby's head is growing rapidly.",
      "The heart is beating about 150 times per minute.",
      "The baby is developing tiny fingers and toes."
    ],
    momSymptoms: [
      "Morning sickness may be at its peak",
      "Breast tenderness continues",
      "Fatigue and mood swings"
    ],
    imageHint: "blueberry fruit",
    image: "/images/week7.jpg"
  },
  {
    week: 8,
    babySize: "About the size of a kidney bean.",
    babyDevelopment: [
      "All major organs are developing.",
      "The baby is starting to move, though you can't feel it yet.",
      "The baby's facial features are becoming more defined."
    ],
    momSymptoms: [
      "Morning sickness may continue",
      "Frequent urination",
      "Breast changes continue"
    ],
    imageHint: "kidney bean",
    image: "/images/week8.jpg"
  },
  {
    week: 9,
    babySize: "About the size of a grape.",
    babyDevelopment: [
      "The baby's heart has four chambers now.",
      "The baby is developing external genitalia.",
      "The baby can make small movements."
    ],
    momSymptoms: [
      "Morning sickness may start to improve",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "grape fruit",
    image: "/images/week9.jpg"
  },
  {
    week: 10,
    babySize: "About the size of a kumquat.",
    babyDevelopment: [
      "The baby's major organs are fully formed.",
      "The baby is now called a fetus.",
      "The baby can move its arms and legs."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "kumquat fruit",
    image: "/images/week10.jpg"
  },
  {
    week: 11,
    babySize: "About the size of a fig.",
    babyDevelopment: [
      "The baby's head makes up about half of its body length.",
      "The baby's bones are hardening.",
      "The baby can hiccup."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "fig fruit",
    image: "/images/week11.jpg"
  },
  {
    week: 12,
    babySize: "About the size of a lime.",
    babyDevelopment: [
      "The baby's reflexes are developing.",
      "The baby can make sucking movements.",
      "The baby's fingernails and toenails are growing."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "lime fruit",
    image: "/images/week12.jpg"
  },
  {
    week: 13,
    babySize: "About the size of a lemon.",
    babyDevelopment: [
      "The baby's vocal cords are developing.",
      "The baby can make facial expressions.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "lemon fruit",
    image: "/images/week13.jpg"
  },
  {
    week: 14,
    babySize: "About the size of a peach.",
    babyDevelopment: [
      "The baby's hair is growing.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "peach fruit",
    image: "/images/week14.jpg"
  },
  {
    week: 15,
    babySize: "About the size of an apple.",
    babyDevelopment: [
      "The baby's skin is very thin and transparent.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "apple fruit",
    image: "/images/week15.jpg"
  },
  {
    week: 16,
    babySize: "About the size of an avocado.",
    babyDevelopment: [
      "The baby's heart is pumping about 25 quarts of blood daily.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "avocado fruit",
    image: "/images/week16.jpg"
  },
  {
    week: 17,
    babySize: "About the size of a pear.",
    babyDevelopment: [
      "The baby's skeleton is changing from cartilage to bone.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "pear fruit",
    image: "/images/week17.jpg"
  },
  {
    week: 18,
    babySize: "About the size of a bell pepper.",
    babyDevelopment: [
      "The baby can hear sounds from the outside world.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "bell pepper",
    image: "/images/week18.jpg"
  },
  {
    week: 19,
    babySize: "About the size of a mango.",
    babyDevelopment: [
      "The baby's skin is covered with a waxy coating called vernix.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "mango fruit",
    image: "/images/week19.jpg"
  },
  {
    week: 20,
    babySize: "About the size of a banana.",
    babyDevelopment: [
      "The baby is halfway through pregnancy!",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "banana fruit",
    image: "/images/week20.jpg"
  },
  {
    week: 21,
    babySize: "About the size of a carrot.",
    babyDevelopment: [
      "The baby's bone marrow is making blood cells.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "carrot vegetable",
    image: "/images/week21.jpg"
  },
  {
    week: 22,
    babySize: "About the size of a spaghetti squash.",
    babyDevelopment: [
      "The baby's taste buds are developing.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "spaghetti squash",
    image: "/images/week22.jpg"
  },
  {
    week: 23,
    babySize: "About the size of a grapefruit.",
    babyDevelopment: [
      "The baby's lungs are developing surfactant.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "grapefruit fruit",
    image: "/images/week23.jpg"
  },
  {
    week: 24,
    babySize: "About the size of an ear of corn.",
    babyDevelopment: [
      "The baby's fingerprints and footprints are formed.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "ear of corn",
    image: "/images/week24.jpg"
  },
  {
    week: 25,
    babySize: "About the size of a rutabaga.",
    babyDevelopment: [
      "The baby's hands are fully developed.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "rutabaga vegetable",
    image: "/images/week25.jpg"
  },
  {
    week: 26,
    babySize: "About the size of a scallion.",
    babyDevelopment: [
      "The baby's eyes are opening for the first time.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "scallion onion",
    image: "/images/week26.jpg"
  },
  {
    week: 27,
    babySize: "About the size of a head of cauliflower.",
    babyDevelopment: [
      "The baby's brain is growing rapidly.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "cauliflower head",
    image: "/images/week27.jpg"
  },
  {
    week: 28,
    babySize: "About the size of a large eggplant.",
    babyDevelopment: [
      "The baby can dream (REM sleep).",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "eggplant vegetable",
    image: "/images/week28.jpg"
  },
  {
    week: 29,
    babySize: "About the size of a butternut squash.",
    babyDevelopment: [
      "The baby's muscles and lungs are continuing to mature.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "butternut squash",
    image: "/images/week29.jpg"
  },
  {
    week: 30,
    babySize: "About the size of a large cabbage.",
    babyDevelopment: [
      "The baby's brain is growing rapidly.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "cabbage head",
    image: "/images/week30.jpg"
  },
  {
    week: 31,
    babySize: "About the size of a coconut.",
    babyDevelopment: [
      "The baby can turn its head from side to side.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "coconut fruit",
    image: "/images/week31.jpg"
  },
  {
    week: 32,
    babySize: "About the size of a large jicama.",
    babyDevelopment: [
      "The baby's toenails have reached the tips of its toes.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "jicama root",
    image: "/images/week32.jpg"
  },
  {
    week: 33,
    babySize: "About the size of a pineapple.",
    babyDevelopment: [
      "The baby's immune system is developing.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "pineapple fruit",
    image: "/images/week33.jpg"
  },
  {
    week: 34,
    babySize: "About the size of a cantaloupe.",
    babyDevelopment: [
      "The baby's fingernails have reached the tips of its fingers.",
      "The baby can make sucking movements.",
      "The baby's bones are getting stronger."
    ],
    momSymptoms: [
      "Morning sickness may be improving",
      "Breast tenderness",
      "Fatigue"
    ],
    imageHint: "cantaloupe melon",
    image: "/images/week34.jpg"
  },
  {
    week: 35,
    babySize: "About the size of a honeydew melon.",
    babyDevelopment: [
      "The baby's hearing is fully developed.",
      "The baby has a firm grasp.",
      "The kidneys are fully developed and the liver can process some waste."
    ],
    momSymptoms: [
      "Frequent urination as the baby presses on your bladder",
      "Feeling large and uncomfortable",
      "Nesting instinct may kick in"
    ],
    imageHint: "honeydew melon",
    image: "/images/week35.jpg"
  },
  {
    week: 36,
    babySize: "About the size of a head of romaine lettuce.",
    babyDevelopment: [
      "The baby is gaining about an ounce a day.",
      "The baby is shedding most of the downy lanugo hair.",
      "The baby has likely dropped into the pelvis ('lightening')."
    ],
    momSymptoms: [
      "Easier to breathe once the baby drops",
      "Increased pelvic pressure",
      "Weekly doctor's visits begin"
    ],
    imageHint: "romaine lettuce",
    image: "/images/week36.jpg"
  },
  {
    week: 37,
    babySize: "About the length of a stalk of Swiss chard.",
    babyDevelopment: [
      "The baby is now considered 'early term'.",
      "The brain and lungs are still maturing.",
      "The baby is practicing skills: inhaling, exhaling, sucking, and blinking."
    ],
    momSymptoms: [
      "Changes in vaginal discharge (bloody show)",
      "Dull backache",
      "Monitoring for signs of labor"
    ],
    imageHint: "swiss chard",
    image: "/images/week37.jpg"
  },
  {
    week: 38,
    babySize: "About the length of a leek.",
    babyDevelopment: [
      "The baby has a firm grasp.",
      "The brain weighs about 14 ounces.",
      "The baby's eye color is likely blue or gray at birth, but may change."
    ],
    momSymptoms: [
      "Swollen feet and ankles",
      "Anxiety or excitement about labor",
      "Diarrhea or loose stools can be a pre-labor sign"
    ],
    imageHint: "leek vegetable",
    image: "/images/week38.jpg"
  },
  {
    week: 39,
    babySize: "About the size of a mini watermelon.",
    babyDevelopment: [
      "The baby is now considered 'full term'.",
      "The baby's chest is prominent.",
      "Fat is still being added to keep the baby warm after birth."
    ],
    momSymptoms: [
      "Losing the mucus plug",
      "Contractions may become stronger and more regular",
      "Water may break"
    ],
    imageHint: "watermelon fruit",
    image: "/images/week39.jpg"
  },
  {
    week: 40,
    babySize: "About the size of a small pumpkin.",
    babyDevelopment: [
      "The baby is ready for birth.",
      "The umbilical cord is about 20 inches long.",
      "The baby will continue to grow until birth."
    ],
    momSymptoms: [
      "You've reached your due date!",
      "Anticipation and waiting",
      "Discussing induction options with your provider if overdue"
    ],
    imageHint: "pumpkin gourd",
    image: "/images/week40.jpg"
  }
];
