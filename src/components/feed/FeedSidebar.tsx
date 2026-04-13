'use client';

import { TrendingUp, Users, Smile } from 'lucide-react';

// ---------------------------------------------------------------------------
// 더미 데이터
// ---------------------------------------------------------------------------

const TRENDING_TAGS = [
  { tag: '번아웃', count: 47 },
  { tag: '월요일', count: 23 },
  { tag: '카페', count: 18 },
  { tag: '출근', count: 15 },
  { tag: '운동', count: 12 },
];

const RECOMMENDED_USERS = [
  { nickname: '나냥', tags: ['연차', '커피'], initial: '나' },
  { nickname: 'Test_som', tags: ['일상', '회사'], initial: 'T' },
  { nickname: '기록하는곰', tags: ['독서', '성장'], initial: '기' },
];

const EMPATHY_FEEDS = [
  { tag: '번아웃', count: 47 },
  { tag: '월요일블루스', count: 31 },
  { tag: '야근', count: 19 },
];

// ---------------------------------------------------------------------------
// 섹션 래퍼
// ---------------------------------------------------------------------------

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-[12px] font-bold tracking-widest text-gray-400 uppercase">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedSidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-3 w-72 shrink-0 pt-2">
      {/* 트렌딩 태그 */}
      <Section icon={<TrendingUp size={13} />} title="오늘의 트렌딩">
        <ul className="space-y-2.5">
          {TRENDING_TAGS.map((item, i) => (
            <li key={item.tag} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-300 w-4">
                  {i + 1}
                </span>
                <span className="text-[13px] font-semibold text-gray-800">
                  #{item.tag}
                </span>
              </div>
              <span className="text-[11px] text-gray-400">
                {item.count}명
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 추천 유저 */}
      <Section icon={<Users size={13} />} title="추천 유저">
        <ul className="space-y-3">
          {RECOMMENDED_USERS.map((user) => (
            <li key={user.nickname} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-[12px] font-bold text-gray-500 shrink-0">
                  {user.initial}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800 leading-none">
                    {user.nickname}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {user.tags.map((t) => `#${t}`).join(' ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-[12px] font-semibold text-gray-900 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors"
              >
                팔로우
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {/* 익명 공감 피드 */}
      <Section icon={<Smile size={13} />} title="익명 공감">
        <ul className="space-y-2">
          {EMPATHY_FEEDS.map((item) => (
            <li
              key={item.tag}
              className="rounded-xl bg-gray-50 px-3 py-2.5 text-[12px] text-gray-600 leading-relaxed"
            >
              오늘{' '}
              <span className="font-semibold text-gray-900">#{item.tag}</span>
              을 기록한 사람이{' '}
              <span className="font-semibold text-gray-900">{item.count}명</span>
            </li>
          ))}
        </ul>
      </Section>

      <p className="text-[11px] font-bold text-center text-gray-300 px-2">
        더미 데이터 · 실제 연동 예정
      </p>
    </aside>
  );
}
