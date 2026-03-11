// Client-side correlation and insight calculations

// Pearson correlation coefficient between two arrays
function pearson(xs, ys) {
  const n = xs.length
  if (n < 3) return null
  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n
  const num   = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0)
  const denX  = Math.sqrt(xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0))
  const denY  = Math.sqrt(ys.reduce((sum, y) => sum + (y - meanY) ** 2, 0))
  if (denX === 0 || denY === 0) return null
  return num / (denX * denY)
}

function avg(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function round1(n) { return Math.round(n * 10) / 10 }

// ── PUBLIC API ───────────────────────────────────────────

export function computeInsights(checkins) {
  if (!checkins || checkins.length < 4) return null

  const mornings = checkins.filter(c => c.period === 'morning')
  const evenings  = checkins.filter(c => c.period === 'evening')

  // Helper: pair consecutive morning/evening on same date
  const paired = mornings
    .map(m => ({ m, e: evenings.find(e => e.date === m.date && e.member_id === m.member_id) }))
    .filter(p => p.e)

  const insights = []

  // 1. Sleep → next-day energy
  const sleepVsEnergy = mornings
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce((acc, curr, i, arr) => {
      if (i === 0) return acc
      const prev = arr[i - 1]
      if (prev.member_id === curr.member_id && curr.sleep_quality && prev.sleep_quality) {
        acc.push({ sleep: prev.sleep_quality, energy: curr.energy })
      }
      return acc
    }, [])

  if (sleepVsEnergy.length >= 3) {
    const r = pearson(sleepVsEnergy.map(d => d.sleep), sleepVsEnergy.map(d => d.energy))
    if (r !== null) {
      insights.push({
        id: 'sleep-energy',
        title: 'Sleep → Energy',
        emoji: '💤',
        description: r > 0.4
          ? `Strong link: better sleep strongly predicts higher energy the next morning (r=${round1(r)}).`
          : r > 0.2
          ? `Moderate link: sleep quality has some bearing on next-day energy (r=${round1(r)}).`
          : `Interestingly, sleep quality doesn't predict energy much for your group (r=${round1(r)}).`,
        correlation: r,
        bars: sleepVsEnergy.slice(-7).map(d => ({ label: d.sleep, value: d.energy })),
      })
    }
  }

  // 2. Gym days vs mood
  const gymDays   = checkins.filter(c => c.gym === 'full session').map(c => c.mood).filter(Boolean)
  const nonGymDays = checkins.filter(c => c.gym !== 'full session').map(c => c.mood).filter(Boolean)

  if (gymDays.length >= 2 && nonGymDays.length >= 2) {
    const gymAvg    = round1(avg(gymDays))
    const nonGymAvg = round1(avg(nonGymDays))
    const diff      = round1(gymAvg - nonGymAvg)
    insights.push({
      id: 'gym-mood',
      title: 'Gym days vs mood',
      emoji: '🏋️',
      description: diff > 0
        ? `On gym days, the group's average mood is ${diff > 0 ? '+' : ''}${diff} points higher (${gymAvg} vs ${nonGymAvg}).`
        : `Surprisingly, gym days don't seem to boost mood for your group. Rest days average ${nonGymAvg} vs gym days ${gymAvg}.`,
      bars: [
        { label: 'Rest', value: nonGymAvg * 10 },
        { label: 'Gym',  value: gymAvg * 10 },
      ],
    })
  }

  // 3. Water intake stats
  const waterData = checkins.filter(c => c.water != null)
  if (waterData.length >= 4) {
    const byMember = waterData.reduce((acc, c) => {
      const name = c.members?.display_name || 'Unknown'
      if (!acc[name]) acc[name] = []
      acc[name].push(c.water)
      return acc
    }, {})
    const memberAvgs = Object.entries(byMember)
      .map(([name, vals]) => ({ name, avg: round1(avg(vals)) }))
      .sort((a, b) => b.avg - a.avg)

    if (memberAvgs.length >= 2) {
      const best  = memberAvgs[0]
      const worst = memberAvgs[memberAvgs.length - 1]
      insights.push({
        id: 'water',
        title: 'Water intake',
        emoji: '💧',
        description: `${best.name} leads with ${best.avg} glasses/day. ${worst.name} averages ${worst.avg}. Staying hydrated, ${worst.name}?`,
        bars: memberAvgs.map(m => ({ label: m.name, value: m.avg * 10 })),
      })
    }
  }

  // 4. Wildcard engagement vs evening mood
  if (paired.length >= 3) {
    const withNote    = paired.filter(p => p.m.wildcard_text?.trim()).map(p => p.e.mood).filter(Boolean)
    const withoutNote = paired.filter(p => !p.m.wildcard_text?.trim()).map(p => p.e.mood).filter(Boolean)
    if (withNote.length >= 2 && withoutNote.length >= 2) {
      const withAvg    = round1(avg(withNote))
      const withoutAvg = round1(avg(withoutNote))
      insights.push({
        id: 'wildcard-mood',
        title: 'Writing → evening mood',
        emoji: '✦',
        isWildcard: true,
        description: withAvg > withoutAvg
          ? `When someone fills in the wildcard, their evening mood averages ${withAvg} vs ${withoutAvg} on days they skip it.`
          : `The wildcard doesn't seem to shift evening mood much — but the entries are great to read back.`,
        bars: [
          { label: 'Skipped', value: withoutAvg * 10 },
          { label: 'Wrote',   value: withAvg * 10 },
        ],
      })
    }
  }

  // 5. Energy trend (7-day rolling average)
  const energyByDate = mornings.reduce((acc, c) => {
    if (!acc[c.date]) acc[c.date] = []
    if (c.energy) acc[c.date].push(c.energy)
    return acc
  }, {})
  const energyTrend = Object.entries(energyByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, vals]) => ({ label: new Date(date).toLocaleDateString('en-GB', { weekday: 'short' }), value: avg(vals) * 10 }))

  if (energyTrend.length >= 4) {
    insights.push({
      id: 'energy-trend',
      title: 'Group energy this week',
      emoji: '⚡',
      description: 'Average morning energy across the group over the last 7 days.',
      bars: energyTrend,
    })
  }

  return insights
}

// Compute per-member streaks
export function computeStreaks(checkins, members) {
  return members.map(member => {
    const memberCheckins = checkins.filter(c => c.member_id === member.id)
    const dates = [...new Set(memberCheckins.map(c => c.date))].sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date()
      expected.setDate(expected.getDate() - i)
      const expectedStr = expected.toISOString().split('T')[0]
      if (dates[i] === expectedStr || (i === 0 && dates[0] === today)) {
        streak++
      } else break
    }
    return { ...member, streak }
  })
}
