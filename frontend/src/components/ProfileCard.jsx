function ProfileCard({ profile }) {
  const entries = [
    { label: '이름', value: profile.name },
    { label: '아이디', value: profile.username },
    { label: '이메일', value: profile.email },
    { label: '전화번호', value: profile.phone },
  ]

  return (
    <div className="profile-card">
      <h2>회원 정보</h2>
      <dl>
        {entries.map((entry) => (
          <div key={entry.label}>
            <dt>{entry.label}</dt>
            <dd>{entry.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default ProfileCard

