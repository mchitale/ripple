// 30 wildcard questions that rotate daily.
// These are also seeded into the DB via the SQL setup script.
// The daily wildcard is selected by: day_of_year % questions.length

export const WILDCARD_QUESTIONS = [
  "Did anything surprise you today?",
  "What's one thing you're quietly proud of today?",
  "Who did you think about today, and why?",
  "What's one small thing that made today different from yesterday?",
  "Did you say yes to something you'd normally say no to — or vice versa?",
  "What's sitting with you right now that you haven't said out loud?",
  "If today were a weather report, what would it say?",
  "What's the most human thing that happened to you today?",
  "Did you notice anything beautiful today?",
  "What did today teach you about yourself?",
  "What conversation do you wish you'd had today?",
  "Did something make you laugh unexpectedly?",
  "What are you looking forward to tomorrow?",
  "What would you do differently about today if you could rewind it?",
  "Is there something you've been avoiding? Did it come up today?",
  "What's one thing you want to remember about today?",
  "Did you spend time on something that truly matters to you?",
  "What took more energy than it should have?",
  "What gave you energy unexpectedly?",
  "Did you feel fully yourself today, or a bit off?",
  "What's the most honest thing you can say about today in one sentence?",
  "Did anything shift in your perspective today?",
  "What small act of kindness did you give or receive?",
  "What are you grateful for that you didn't expect?",
  "What's one thing that stressed you out that probably won't matter in a year?",
  "Did you spend time in your head or in the present today?",
  "What made you feel most connected to someone today?",
  "What's something you learned today, big or small?",
  "Did you honour your body today? How or how not?",
  "If a friend asked how your day was, what's the real answer?",
]

export function getTodaysWildcard() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff  = new Date() - start
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return WILDCARD_QUESTIONS[dayOfYear % WILDCARD_QUESTIONS.length]
}
