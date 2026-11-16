/** Original lightweight portraits; these are fictional companions, not learner accounts. */
export interface ClassmateTurn {
  name: string;
  text: string;
  answering: boolean;
}
export function ClassroomFriends({ turn }: { turn?: ClassmateTurn | null }) {
  const friends = [
    {
      name: '朵朵',
      background: '#fce5d9',
      shirt: '#d97875',
      skin: '#f3c6a1',
      hair: '#48312c',
      style: 'buns',
    },
    {
      name: '小宇',
      background: '#dceef9',
      shirt: '#518fc0',
      skin: '#c99570',
      hair: '#263b4c',
      style: 'short',
    },
    {
      name: '乐乐',
      background: '#e5eed3',
      shirt: '#749948',
      skin: '#f4d4b8',
      hair: '#63462f',
      style: 'bob',
    },
  ];
  return (
    <section aria-label="陪你学习的虚拟同学" className="border-t border-[#e5d4b0] px-3 py-4">
      <style>{`@keyframes coastal-classmate-wave{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(9deg)}}@media(prefers-reduced-motion:no-preference){.coastal-classmate-hand{transform-origin:64px 72px;animation:coastal-classmate-wave 1.8s ease-in-out infinite}}`}</style>
      <h3 className="mb-3 text-center text-xs font-bold text-[#72531d]">虚拟同学 · 一起学习</h3>
      <ul className="grid grid-cols-3 gap-2">
        {friends.map((friend) => (
          <li key={friend.name} className="min-w-0 text-center">
            <svg
              viewBox="0 0 80 88"
              role="img"
              aria-label={`${friend.name}的虚拟同学头像`}
              className="mx-auto w-full max-w-[72px]"
            >
              <rect x="1" y="1" width="78" height="86" rx="22" fill={friend.background} />
              <path d="M10 87V78Q13 58 40 60Q67 58 70 78V87Z" fill={friend.shirt} />
              {friend.style === 'buns' && (
                <g fill={friend.hair}>
                  <circle cx="16" cy="25" r="11" />
                  <circle cx="64" cy="25" r="11" />
                </g>
              )}
              {friend.style === 'bob' && (
                <rect x="15" y="12" width="50" height="53" rx="23" fill={friend.hair} />
              )}
              <circle cx="40" cy="37" r="23" fill={friend.skin} />
              <path
                d={
                  friend.style === 'short'
                    ? 'M17 36Q10 7 40 10Q69 7 63 35L52 24L38 30L29 24Z'
                    : 'M17 34Q13 10 40 11Q67 10 63 34L54 24Q40 34 24 26Z'
                }
                fill={friend.hair}
              />
              <g fill="#263b4c">
                <circle cx="32" cy="38" r="2.3" />
                <circle cx="48" cy="38" r="2.3" />
              </g>
              <g fill="#de927e" opacity=".65">
                <ellipse cx="26" cy="45" rx="4" ry="2.5" />
                <ellipse cx="54" cy="45" rx="4" ry="2.5" />
              </g>
              <path
                d="M34 48Q40 54 46 48"
                fill="none"
                stroke="#955b45"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M31 65L40 73L49 65"
                fill="none"
                stroke="#fff8e6"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {turn?.name === friend.name && (
                <g className="coastal-classmate-hand" data-raised-hand>
                  <path
                    d="M62 77L69 61L69 46"
                    fill="none"
                    stroke={friend.shirt}
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <circle cx="69" cy="41" r="6" fill={friend.skin} />
                </g>
              )}
            </svg>
            <p className="mt-1 text-sm font-bold text-[#52716e]">{friend.name}</p>
            {turn?.name === friend.name && (
              <p className="text-xs font-bold text-[#9a5a21]">
                {turn.answering ? '在分享' : '举手啦'}
              </p>
            )}
          </li>
        ))}
      </ul>
      {turn && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-white/90 p-3 text-sm leading-6 text-[#52716e]"
        >
          {turn.name}：{turn.text}
        </p>
      )}
    </section>
  );
}
