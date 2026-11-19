/**
 * What the phone and the tablet on the desk say when picked up. Shared by the
 * drawer (phones, reduced motion) and the live screens of the 3D desk.
 */
export const DESK_DEMOS = {
  zh: {
    phone: { thing: '手機 · 財伴 oSave', title: '幫自己做一次財務健檢', lede: '拉拉看收入和支出，雷達圖會跟著變。這是財伴首頁那張健康度的簡化版，門檻是示意。', href: '/work/osave/', cta: '看財伴怎麼做的' },
    tablet: { thing: '平板 · 醫數行銷 MedaLink', title: '幫診所排一個療程', lede: '一個療程有好幾個步驟，每一步要的人、診間、儀器都要同時有空，才排得進去。', href: '/work/medalink/', cta: '看診所系統' },
  },
  en: {
    phone: { thing: 'Phone · oSave', title: 'Give yourself a financial check-up', lede: 'Move income and spending and watch the radar change. A simpler version of the health score on oSave’s home screen; the thresholds are illustrative.', href: '/work/osave/', cta: 'How oSave was built' },
    tablet: { thing: 'Tablet · MedaLink', title: 'Book a treatment for a clinic', lede: 'A treatment is a chain of steps, and each step needs its people, room and machine free at the same time.', href: '/work/medalink/', cta: 'See the clinic system' },
  },
} as const
