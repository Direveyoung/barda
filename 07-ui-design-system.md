# BARDA — UI 스펙 (Tailwind 기반)
**작성일: 2026.02.16**  
**목표: 일관된 디자인 시스템 구축**

---

## 1. 디자인 토큰

### 1-1. 컬러 시스템

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      colors: {
        // Primary
        primary: {
          DEFAULT: '#D4726A',
          light: '#E8927C',
          dark: '#B85850',
        },
        
        // Time-based Accent
        am: {
          accent: '#FDE68A',      // 따뜻한 옐로우
          light: '#FEF3C7',
          dark: '#F59E0B',
        },
        pm: {
          accent: '#C4B5FD',      // 소프트 퍼플
          light: '#DDD6FE',
          dark: '#8B5CF6',
        },
        
        // Conflict Levels
        conflict: {
          high: '#DC2626',        // 레드
          medium: '#D97706',      // 앰버
          low: '#FCD34D',         // 옐로우
        },
        
        // Scores
        score: {
          excellent: '#059669',   // 그린 (90+)
          good: '#3B82F6',        // 블루 (80+)
          fair: '#F59E0B',        // 오렌지 (60+)
          poor: '#DC2626',        // 레드 (60-)
        },
        
        // Neutrals
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      
      // Gradients
      backgroundImage: {
        'gradient-landing': 'linear-gradient(to bottom, rgba(232, 146, 124, 0.1), white)',
        'gradient-am': 'linear-gradient(to right, rgba(253, 230, 138, 0.2), rgba(59, 130, 246, 0.1))',
        'gradient-pm': 'linear-gradient(to right, rgba(196, 181, 253, 0.2), rgba(139, 92, 246, 0.1))',
      },
    },
  },
};
```

### 1-2. 타이포그래피

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
    },
  },
};
```

### 1-3. 스페이싱

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      spacing: {
        '0': '0px',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
      },
    },
  },
};
```

### 1-4. 둥근 모서리

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
        'sm': '0.5rem',    // 8px
        'DEFAULT': '0.75rem',  // 12px
        'md': '0.75rem',   // 12px
        'lg': '1rem',      // 16px
        'xl': '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
        'full': '9999px',
      },
    },
  },
};
```

### 1-5. 그림자

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 12px 32px rgba(0, 0, 0, 0.16)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
};
```

---

## 2. 애니메이션

### 2-1. Transitions

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
        '500': '500ms',
        '1000': '1000ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
};
```

### 2-2. Keyframes & Animations

```typescript
// tailwind.config.ts

export default {
  theme: {
    extend: {
      keyframes: {
        // 체크 바운스
        checkBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        
        // 완료 애니메이션
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
        
        // 페이드업
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        
        // 점수 게이지
        scoreReveal: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        
        // 펄스 (알림)
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        
        // 쉐이크 (에러)
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
      
      animation: {
        'check-bounce': 'checkBounce 0.3s ease-out',
        'confetti': 'confetti 0.5s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'score-reveal': 'scoreReveal 1.5s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
    },
  },
};
```

---

## 3. 반응형 브레이크포인트

```typescript
// tailwind.config.ts

export default {
  theme: {
    screens: {
      'sm': '640px',      // 모바일 가로
      'md': '768px',      // 태블릿
      'lg': '1024px',     // 데스크탑
      'xl': '1280px',     // 큰 데스크탑
      '2xl': '1536px',    // 매우 큰 화면
    },
  },
};

// 사용 예시
<div className="
  text-base        /* 모바일: 16px */
  sm:text-lg       /* 모바일 가로: 18px */
  md:text-xl       /* 태블릿: 20px */
  lg:text-2xl      /* 데스크탑: 24px */
">
```

---

## 4. 공통 컴포넌트 스타일

### 4-1. Button Variants

```typescript
// components/shared/Button.tsx

const buttonVariants = {
  // Primary
  primary: 'bg-primary text-white hover:bg-primary-light active:bg-primary-dark shadow-md hover:shadow-lg',
  
  // Secondary
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
  
  // Outline
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  
  // Ghost
  ghost: 'text-primary hover:bg-primary/10 active:bg-primary/20',
  
  // Danger
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};
```

### 4-2. Card Styles

```typescript
// components/shared/Card.tsx

const cardVariants = {
  // Default
  default: 'bg-white rounded-2xl shadow-sm border border-gray-100',
  
  // Elevated
  elevated: 'bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow',
  
  // Outlined
  outlined: 'bg-white rounded-2xl border-2 border-gray-200',
  
  // Gradient
  gradient: 'bg-gradient-to-br from-primary-light/10 to-pm-accent/10 rounded-2xl',
};
```

### 4-3. Input Styles

```typescript
// components/shared/Input.tsx

const inputStyles = `
  w-full px-4 py-3 
  border-2 border-gray-200 
  rounded-xl 
  focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
  transition-all
  placeholder:text-gray-400
  disabled:bg-gray-100 disabled:cursor-not-allowed
`;
```

### 4-4. Badge Styles

```typescript
// components/shared/Badge.tsx

const badgeVariants = {
  // 피부타입
  skinType: 'px-3 py-1 bg-primary-light/20 text-primary rounded-full text-xs font-semibold',
  
  // 고민
  concern: 'px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs',
  
  // 충돌 수준
  conflictHigh: 'px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold',
  conflictMedium: 'px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold',
  conflictLow: 'px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold',
  
  // 점수
  scoreExcellent: 'px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold',
  scoreGood: 'px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold',
  scoreFair: 'px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold',
  scorePoor: 'px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold',
};
```

---

## 5. 레이아웃 패턴

### 5-1. Container

```typescript
// 최대 너비 컨테이너
<div className="max-w-4xl mx-auto px-4 py-8">
  {/* 콘텐츠 */}
</div>

// 반응형 패딩
<div className="px-4 sm:px-6 lg:px-8">
  {/* 콘텐츠 */}
</div>
```

### 5-2. Grid Layouts

```typescript
// 2열 그리드 (모바일 1열, 데스크탑 2열)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// 3열 그리드 (모바일 1열, 태블릿 2열, 데스크탑 3열)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### 5-3. Flexbox Patterns

```typescript
// 중앙 정렬
<div className="flex items-center justify-center min-h-screen">
  <div>중앙 콘텐츠</div>
</div>

// 양쪽 정렬
<div className="flex items-center justify-between">
  <div>왼쪽</div>
  <div>오른쪽</div>
</div>

// 세로 스택
<div className="flex flex-col gap-4">
  <div>아이템 1</div>
  <div>아이템 2</div>
  <div>아이템 3</div>
</div>
```

---

## 6. 모바일 퍼스트 디자인

### 6-1. 기본 원칙
```typescript
// ❌ 나쁜 예 (데스크탑 우선)
<div className="text-2xl md:text-base">

// ✅ 좋은 예 (모바일 우선)
<div className="text-base md:text-2xl">
```

### 6-2. 터치 타겟 크기

```typescript
// 최소 44x44px (Apple HIG)
// 최소 48x48px (Material Design)

// 버튼
<button className="min-h-[44px] px-4 py-3">

// 체크박스
<input type="checkbox" className="w-6 h-6">

// 아이콘 버튼
<button className="w-12 h-12 flex items-center justify-center">
  <Icon />
</button>
```

### 6-3. 모바일 네비게이션

```typescript
// 하단 고정 네비게이션
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
  <div className="flex items-center justify-around h-16">
    {navItems.map(item => (
      <NavItem key={item.id} {...item} />
    ))}
  </div>
</nav>

// Safe Area (아이폰 노치)
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
};
```

---

## 7. 다크모드 준비 (옵션)

```typescript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',  // 또는 'media'
};

// 사용
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  콘텐츠
</div>
```

---

## 8. 유틸리티 클래스 조합

### 8-1. cn 헬퍼 함수

```typescript
// lib/utils/cn.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 사용
<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  className
)}>
```

### 8-2. 조건부 스타일링

```typescript
// ❌ 나쁜 예
<div className={isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}>

// ✅ 좋은 예
<div className={cn(
  'base-class',
  isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
)}>

// ✅ 더 좋은 예 (공통 스타일 분리)
<div className={cn(
  'px-4 py-2 rounded-lg transition',
  isActive 
    ? 'bg-primary text-white shadow-md' 
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
)}>
```

---

## 9. 접근성 (A11y) 스타일

### 9-1. Focus Styles

```typescript
// 모든 인터랙티브 요소
<button className="
  focus:outline-none 
  focus:ring-2 
  focus:ring-primary 
  focus:ring-offset-2
">

// 링크
<a className="
  focus:outline-none 
  focus:underline 
  focus:ring-2 
  focus:ring-primary 
  rounded
">
```

### 9-2. Screen Reader Only

```typescript
// lib/utils/styles.ts

export const srOnly = 'sr-only';

// tailwind.config.ts (이미 내장)
// .sr-only {
//   position: absolute;
//   width: 1px;
//   height: 1px;
//   padding: 0;
//   margin: -1px;
//   overflow: hidden;
//   clip: rect(0, 0, 0, 0);
//   white-space: nowrap;
//   border-width: 0;
// }

// 사용
<span className="sr-only">아침 루틴 체크하기</span>
```

---

## 10. 성능 최적화

### 10-1. PurgeCSS 설정

```typescript
// tailwind.config.ts

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};
```

### 10-2. JIT 모드

```typescript
// tailwind.config.ts

module.exports = {
  mode: 'jit',  // Just-In-Time 컴파일
};

// 임의 값 사용 가능
<div className="top-[117px]">
<div className="bg-[#1da1f2]">
<div className="grid-cols-[1fr,auto,1fr]">
```

---

## 11. 스타일 가이드 체크리스트

### 11-1. 디자인 토큰 사용

- [ ] 하드코딩된 색상 없음 (hex/rgb 대신 토큰 사용)
- [ ] 일관된 스페이싱 (4px 단위)
- [ ] 정의된 폰트 사이즈만 사용
- [ ] 정의된 border-radius만 사용

### 11-2. 반응형

- [ ] 모바일 퍼스트 접근
- [ ] 모든 브레이크포인트 테스트
- [ ] 터치 타겟 크기 44px+
- [ ] Safe Area 처리 (노치)

### 11-3. 접근성

- [ ] Focus 스타일 정의
- [ ] 색상 대비 WCAG AA 이상
- [ ] ARIA 속성 추가
- [ ] 키보드 네비게이션 가능

### 11-4. 성능

- [ ] 사용하지 않는 클래스 purge
- [ ] 중복 스타일 최소화
- [ ] 애니메이션 60fps 유지

---

## 12. 스타일 예제

### 12-1. 루틴 카드

```tsx
<div className="
  bg-white 
  rounded-2xl 
  p-4 
  shadow-sm 
  hover:shadow-md 
  transition-shadow 
  border 
  border-gray-100
">
  <div className="flex items-center gap-2 mb-2">
    <span className="px-2 py-1 bg-primary-light/20 text-primary text-xs rounded-full">
      건성
    </span>
  </div>
  
  <div className="text-2xl font-bold text-primary mb-1">
    92점 ⭐
  </div>
  
  <p className="text-sm text-gray-600">
    충돌 0건 ✅
  </p>
</div>
```

### 12-2. 체크리스트 아이템

```tsx
<button 
  onClick={onToggle}
  className={cn(
    'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
    isChecked 
      ? 'bg-green-50 opacity-70' 
      : 'bg-white hover:bg-gray-50'
  )}
>
  <div className={cn(
    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition',
    isChecked 
      ? 'bg-green-500 border-green-500' 
      : 'border-gray-300'
  )}>
    {isChecked && <span className="text-white text-sm">✓</span>}
  </div>
  
  <div className="flex-1 text-left">
    <div className={cn(
      'font-medium',
      isChecked && 'line-through text-gray-400'
    )}>
      {productName}
    </div>
    <div className="text-xs text-gray-500">
      {categoryName}
    </div>
  </div>
</button>
```

---

## 13. 다음 단계

1. ✅ 디자인 토큰 정의 완료
2. 🔜 Tailwind 설정 파일 작성
3. 🔜 공통 컴포넌트 스타일 구현
4. 🔜 스타일 가이드 문서화
5. 🔜 디자인 QA 체크리스트 작성
