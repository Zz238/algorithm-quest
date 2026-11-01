// GitHub's public profile is already included in the Supabase OAuth session.
// No extra API token, scope or profile request is needed.
export function accountProfile(user) {
  const metadata=user?.user_metadata||{};
  const identity=user?.identities?.find(item=>item.provider==='github')?.identity_data||{};
  const name=[metadata.user_name,metadata.preferred_username,identity.user_name,identity.preferred_username,metadata.name,identity.name]
    .find(value=>typeof value==='string'&&value.trim())?.trim()||'GitHub 学习者';
  let avatarUrl='';
  for(const value of [metadata.avatar_url,identity.avatar_url]) {
    try {
      const url=new URL(value);
      if(url.protocol==='https:'&&/^avatars\d*\.githubusercontent\.com$/.test(url.hostname)&&!url.username&&!url.password) {
        avatarUrl=url.href;break;
      }
    } catch { /* A missing or invalid avatar falls back to the account's initial. */ }
  }
  return {name,avatarUrl,initial:Array.from(name)[0].toUpperCase()};
}
