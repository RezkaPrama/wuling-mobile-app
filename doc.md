wuling-maintenance/
├── app/                        ← Expo Router (file-based routing)
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (admin)/
│   │   ├── _layout.tsx         ← Tab/Stack navigator
│   │   ├── dashboard.tsx
│   │   ├── equipment/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── create.tsx
│   │   ├── schedules/
│   │   ├── records/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   ├── [id]/work.tsx
│   │   │   └── from-qr.tsx
│   │   └── check-sheet/
│   └── _layout.tsx             ← Root layout + auth guard
├── src/
│   ├── api/                    ← API client & services
│   │   ├── client.ts           ← Axios instance
│   │   ├── auth.ts
│   │   ├── equipment.ts
│   │   ├── schedules.ts
│   │   ├── records.ts
│   │   └── checkSheet.ts
│   ├── components/             ← Komponen reusable
│   ├── hooks/                  ← Custom hooks (useAuth, useRecord, dll)
│   ├── store/                  ← Zustand global state
│   ├── types/                  ← TypeScript types
│   └── theme/                  ← Design tokens dari Stitch
├── assets/
└── app.json