import { supabase } from './supabase.js'
import { hashPassword, generateInviteCode, getAvatarColour } from './utils.js'

// ── GROUPS ──────────────────────────────────────────────

export async function createGroup({ groupName, creatorName, password }) {
  const passwordHash = await hashPassword(password)
  const inviteCode   = generateInviteCode()
  const avatarColour = getAvatarColour(creatorName)

  // Insert group (admin_member_id set after member is created)
  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .insert({ name: groupName, invite_code: inviteCode, password_hash: passwordHash })
    .select()
    .single()

  if (groupErr) throw groupErr

  // Insert creator as first member
  const { data: user, error: userErr } = await supabase
    .from('members')
    .insert({ display_name: creatorName, avatar_colour: avatarColour, group_id: group.id })
    .select()
    .single()

  if (userErr) throw userErr

  // Mark creator as admin
  await supabase.from('groups').update({ admin_member_id: user.id }).eq('id', group.id)

  return { group: { ...group, admin_member_id: user.id }, user }
}

export async function kickMember(memberId) {
  const { error } = await supabase.from('members').delete().eq('id', memberId)
  if (error) throw error
}

export async function getGroupAdmin(groupId) {
  const { data } = await supabase
    .from('groups')
    .select('admin_member_id')
    .eq('id', groupId)
    .single()
  return data?.admin_member_id || null
}

export async function joinGroup({ inviteCode, memberName, password }) {
  const passwordHash = await hashPassword(password)

  // Find group by code
  const { data: group, error: groupErr } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()

  if (groupErr || !group) throw new Error('Group not found. Double-check the invite code.')

  // Verify password
  if (group.password_hash !== passwordHash) throw new Error('Wrong password. Ask your group admin.')

  const avatarColour = getAvatarColour(memberName)

  // Check if name already taken in this group
  const { data: existing } = await supabase
    .from('members')
    .select('*')
    .eq('group_id', group.id)
    .eq('display_name', memberName)
    .single()

  let user
  if (existing) {
    // Return existing member (rejoining)
    user = existing
  } else {
    const { data: newUser, error: userErr } = await supabase
      .from('members')
      .insert({ display_name: memberName, avatar_colour: avatarColour, group_id: group.id })
      .select()
      .single()
    if (userErr) throw userErr
    user = newUser
  }

  return { group, user }
}

export async function getGroupMembers(groupId) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at')
  if (error) throw error
  return data
}

// ── CHECK-INS ────────────────────────────────────────────

export async function submitCheckin({ userId, groupId, period, date, values }) {
  // Upsert so re-submitting overwrites rather than duplicates
  const { data, error } = await supabase
    .from('checkins')
    .upsert(
      {
        member_id:      userId,
        group_id:       groupId,
        period,
        date,
        mood:           values.mood,
        energy:         values.energy,
        sleep_quality:  values.sleepQuality,
        social_battery: values.socialBattery,
        gym:            values.gym,
        shower:         values.shower,
        water:          values.water,
        wildcard_text:  values.wildcardText,
      },
      { onConflict: 'member_id,group_id,period,date' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTodaysCheckins(groupId, date) {
  const { data, error } = await supabase
    .from('checkins')
    .select(`*, members(display_name, avatar_colour)`)
    .eq('group_id', groupId)
    .eq('date', date)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getUserTodayCheckin(userId, groupId, date, period) {
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .eq('member_id', userId)
    .eq('group_id', groupId)
    .eq('date', date)
    .eq('period', period)
    .single()
  return data // null if not submitted yet
}

export async function getRecentCheckins(groupId, days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await supabase
    .from('checkins')
    .select(`*, members(display_name, avatar_colour)`)
    .eq('group_id', groupId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

// ── REAL-TIME SUBSCRIPTION ───────────────────────────────

export function subscribeToCheckins(groupId, callback) {
  return supabase
    .channel(`checkins:${groupId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'checkins', filter: `group_id=eq.${groupId}` },
      callback
    )
    .subscribe()
}
