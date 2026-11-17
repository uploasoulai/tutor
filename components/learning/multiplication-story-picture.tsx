/** Original reusable vector artwork. No textbook scan, paid image call or external asset. */
export function MultiplicationStoryPicture() {
  return (
    <figure className="my-5 overflow-hidden rounded-3xl border-2 border-[#d9e8d2] bg-[#e9f6fa]">
      <svg
        role="img"
        aria-label="两只小海豹在沙滩上，每只面前有一篮3颗贝壳，一共两篮"
        viewBox="0 0 720 330"
        className="w-full"
      >
        <defs>
          <linearGradient id="story-sky" x2="0" y2="1">
            <stop stopColor="#d5f1fb" />
            <stop offset="1" stopColor="#f7f3d4" />
          </linearGradient>
        </defs>
        <rect width="720" height="330" fill="url(#story-sky)" />
        <circle cx="620" cy="65" r="34" fill="#ffdb80" />
        <path d="M0 150Q80 120 160 150T320 150T480 150T640 150T800 150V260H0Z" fill="#99dcd7" />
        <path d="M0 200Q160 164 320 202T720 195V330H0Z" fill="#f6dca7" />
        {[210, 510].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy="225" rx="66" ry="21" fill="#d7c28c" opacity=".35" />
            <ellipse
              cx={x}
              cy="192"
              rx="49"
              ry="48"
              fill={i ? '#9fc9d8' : '#c8d8de'}
              stroke="#618892"
              strokeWidth="3"
            />
            <path
              d={`M${x - 40} 207q-44 25 -10 27M${x + 40} 207q44 25 10 27`}
              fill="none"
              stroke="#618892"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <circle cx={x - 15} cy="178" r="4" fill="#2d5662" />
            <circle cx={x + 15} cy="178" r="4" fill="#2d5662" />
            <path
              d={`M${x - 8} 196q8 9 16 0`}
              fill="none"
              stroke="#2d5662"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse cx={x} cy="186" rx="7" ry="4" fill="#527781" />
            <path
              d={`M${x - 51} 252h102l-14 44h-74Z`}
              fill="#cb9a5e"
              stroke="#936637"
              strokeWidth="3"
            />
            {[-30, 0, 30].map((dx) => (
              <g key={dx} transform={`translate(${x + dx},247)`}>
                <path
                  d="M-12 0Q-19-27 0-26Q19-27 12 0L5 8H-5Z"
                  fill="#ffb58f"
                  stroke="#b87b5b"
                  strokeWidth="2"
                />
                <path d="M0-19V3M-7-16L-3 3M7-16L3 3" stroke="#fff1cd" strokeWidth="2" />
              </g>
            ))}
            <text x={x} y="126" textAnchor="middle" fill="#38636c" fontSize="22" fontWeight="bold">
              {i ? '乐乐' : '朵朵'}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="bg-[#fff8df] px-5 py-4 text-lg font-bold leading-8">
        朵朵和乐乐各找到3颗贝壳。两个篮子里一样多，可以怎样数得更快？
      </figcaption>
    </figure>
  );
}
