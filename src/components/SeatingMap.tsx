import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  Grid2X2,
  LayoutGrid,
  Map as MapIcon,
  Minus,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  UserPlus,
  UserRound,
  UsersRound,
} from 'lucide-react'

type Table = {
  id: string
  number: number
  seated: number
  capacity: number
  zone: string
  position: keyof typeof positionClasses
  shape: 'round' | 'pill'
}

const positionClasses = {
  northWest: 'left-[12%] top-[16%]',
  north: 'left-[40%] top-[10%]',
  northEast: 'right-[12%] top-[20%]',
  southWest: 'left-[20%] top-[60%]',
  southEast: 'right-[24%] top-[58%]',
} as const

const initialTables: Table[] = [
  { id: 'table-1', number: 1, seated: 6, capacity: 8, zone: 'tables.mainHall', position: 'northWest', shape: 'round' },
  { id: 'table-2', number: 2, seated: 8, capacity: 8, zone: 'tables.mainHall', position: 'north', shape: 'round' },
  { id: 'table-3', number: 3, seated: 4, capacity: 8, zone: 'tables.garden', position: 'northEast', shape: 'round' },
  { id: 'table-4', number: 4, seated: 5, capacity: 6, zone: 'tables.garden', position: 'southWest', shape: 'round' },
  { id: 'table-5', number: 5, seated: 7, capacity: 8, zone: 'tables.lounge', position: 'southEast', shape: 'pill' },
]

function LanguageToggle() {
  const { i18n } = useTranslation()
  const isHebrew = i18n.language === 'he'

  const changeLanguage = (language: 'en' | 'he') => {
    void i18n.changeLanguage(language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr'
  }

  return (
    <div className="flex items-center rounded-xl border border-bronze/30 bg-cream/80 p-1 shadow-sm dark:border-gold/20 dark:bg-navy/80">
      <button type="button" onClick={() => changeLanguage('en')} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold tracking-wider transition-colors ${!isHebrew ? 'bg-navy text-cream dark:bg-gold dark:text-navy' : 'text-navy/55 hover:text-navy dark:text-cream/60 dark:hover:text-cream'}`}>EN</button>
      <button type="button" onClick={() => changeLanguage('he')} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold tracking-wider transition-colors ${isHebrew ? 'bg-navy text-cream dark:bg-gold dark:text-navy' : 'text-navy/55 hover:text-navy dark:text-cream/60 dark:hover:text-cream'}`}>עב</button>
    </div>
  )
}

function TableNode({ table, onOptions }: { table: Table; onOptions: (id: string) => void }) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: table.id })
  const percentage = Math.round((table.seated / table.capacity) * 100)
  const isFull = percentage === 100

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`absolute ${positionClasses[table.position]} z-10 flex cursor-grab touch-none flex-col items-center justify-center border-2 border-gold/60 bg-cream/95 text-center shadow-lg shadow-navy/15 transition-[filter,opacity] hover:brightness-105 active:cursor-grabbing dark:border-gold/70 dark:bg-navy/95 dark:shadow-black/30 ${table.shape === 'pill' ? 'h-28 w-48 rounded-full' : 'size-36 rounded-full sm:size-40'} ${isDragging ? 'opacity-30' : 'opacity-100'}`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-navy dark:text-cream">
        <LayoutGrid className="size-3.5 text-bronze dark:text-gold" aria-hidden="true" />
        <span className="text-sm font-semibold">{t('tables.title', { number: String(table.number).padStart(2, '0') })}</span>
      </div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-bronze dark:text-gold">{t(table.zone)}</p>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-navy/65 dark:text-cream/65">
        <span>{t('tables.seated', { seated: table.seated, capacity: table.capacity })}</span>
        <span className={isFull ? 'font-bold text-bronze dark:text-gold' : ''}>{percentage}%</span>
      </div>
      <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => onOptions(table.id)} className="absolute right-3 top-3 rounded-full p-1 text-navy/45 hover:bg-navy/10 hover:text-navy dark:text-cream/45 dark:hover:bg-cream/10 dark:hover:text-cream" aria-label={t('actions.tableOptions')}>
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </button>
      <div className="absolute bottom-5 h-1 w-14 overflow-hidden rounded-full bg-navy/10 dark:bg-cream/10">
        <div className="h-full rounded-full bg-bronze dark:bg-gold" style={{ width: `${percentage}%` }} />
      </div>
    </article>
  )
}

function Canvas({ tables, onOptions }: { tables: Table[]; onOptions: (id: string) => void }) {
  const { t } = useTranslation()
  const { setNodeRef, isOver } = useDroppable({ id: 'seating-canvas' })
  return (
    <div ref={setNodeRef} className={`relative h-[calc(100vh-210px)] min-h-[540px] overflow-hidden rounded-[2rem] border bg-cream/45 shadow-inner backdrop-blur-[2px] transition-colors dark:bg-navy/45 ${isOver ? 'border-gold bg-gold/5' : 'border-bronze/25 dark:border-gold/20'}`}>
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(20,33,61,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,33,61,0.08)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 flex size-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-gold/50 bg-gold/5 text-center sm:size-56">
        <span className="max-w-24 text-[10px] font-semibold uppercase tracking-[0.2em] text-bronze dark:text-gold">{t('map.danceFloor')}</span>
      </div>
      {tables.map((table) => <TableNode key={table.id} table={table} onOptions={onOptions} />)}
      <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-navy/40 dark:text-cream/40">{t('map.dragHint')}</p>
    </div>
  )
}

export function SeatingMap() {
  const { t, i18n } = useTranslation()
  const [isDark, setIsDark] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [tables, setTables] = useState(initialTables)
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    document.documentElement.lang = i18n.language
    document.documentElement.dir = i18n.language === 'he' ? 'rtl' : 'ltr'
  }, [i18n.language])

  const activeTable = useMemo(() => tables.find((table) => table.id === activeId), [activeId, tables])
  const handleDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))
  const handleDragEnd = ({ active, delta }: DragEndEvent) => {
    const table = tables.find((item) => item.id === active.id)
    if (!table) return
    const positions = Object.keys(positionClasses) as Array<keyof typeof positionClasses>
    const currentIndex = positions.indexOf(table.position)
    const move = delta.x > 100 || delta.y > 100 ? 1 : delta.x < -100 || delta.y < -100 ? -1 : 0
    setTables((current) => current.map((item) => item.id === table.id ? { ...item, position: positions[Math.max(0, Math.min(positions.length - 1, currentIndex + move))] } : item))
    setActiveId(null)
  }

  const totalSeated = tables.reduce((sum, table) => sum + table.seated, 0)
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <main className="min-h-screen overflow-hidden bg-cream text-navy dark:bg-navy dark:text-cream">
        <header className="fixed inset-x-0 top-0 z-30 border-b border-bronze/20 bg-cream/80 backdrop-blur-xl dark:border-gold/15 dark:bg-navy/85">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-navy text-gold shadow-sm dark:bg-gold dark:text-navy"><Sparkles className="size-4" aria-hidden="true" /></div>
              <span className="text-lg font-semibold tracking-tight">{t('brand')}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageToggle />
              <div className="hidden items-center rounded-xl border border-bronze/25 bg-cream/70 p-1 dark:border-gold/20 dark:bg-navy/70 sm:flex">
                <button type="button" className="grid size-8 place-items-center rounded-lg text-navy/60 hover:bg-navy/10 hover:text-navy dark:text-cream/60 dark:hover:bg-cream/10 dark:hover:text-cream" onClick={() => setZoom((current) => Math.max(80, current - 10))} aria-label={t('actions.zoomOut')}><Minus className="size-4" aria-hidden="true" /></button>
                <span className="w-12 text-center text-xs font-medium text-navy/60 dark:text-cream/60">{zoom}%</span>
                <button type="button" className="grid size-8 place-items-center rounded-lg text-navy/60 hover:bg-navy/10 hover:text-navy dark:text-cream/60 dark:hover:bg-cream/10 dark:hover:text-cream" onClick={() => setZoom((current) => Math.min(120, current + 10))} aria-label={t('actions.zoomIn')}><Plus className="size-4" aria-hidden="true" /></button>
              </div>
              <button type="button" onClick={() => { setIsDark(!isDark); document.documentElement.classList.toggle('dark', !isDark) }} className="grid size-10 place-items-center rounded-xl text-navy/60 hover:bg-navy/10 hover:text-navy dark:text-cream/60 dark:hover:bg-cream/10 dark:hover:text-cream" aria-label={t('actions.toggleTheme')}>{isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}</button>
              <button type="button" className="grid size-10 place-items-center rounded-xl border border-bronze/25 bg-cream text-navy/65 shadow-sm hover:text-navy dark:border-gold/20 dark:bg-navy dark:text-cream/65 dark:hover:text-cream" aria-label={t('actions.profile')}><UserRound className="size-4" aria-hidden="true" /></button>
            </div>
          </div>
        </header>

        <section className="relative min-h-screen bg-[radial-gradient(circle,_rgba(157,122,66,0.16)_1px,_transparent_1px)] [background-size:24px_24px] px-4 pb-36 pt-24 sm:px-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-5 px-1"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze dark:text-gold">{t('map.title')}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{t('map.subtitle')}</h1></div>
            <div className="origin-center transition-transform duration-300" style={{ transform: `scale(${zoom / 100})` }}><Canvas tables={tables} onOptions={(id) => setTables((current) => current.map((table) => table.id === id ? { ...table, seated: table.seated === table.capacity ? 0 : table.seated + 1 } : table))} /></div>
          </div>
          <div className="fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-5 rounded-2xl border border-bronze/25 bg-cream/90 px-4 py-3 shadow-xl shadow-navy/10 backdrop-blur-xl dark:border-gold/20 dark:bg-navy/90 sm:bottom-24 sm:gap-7 sm:px-6">
            <div className="flex gap-4 sm:gap-7">
              <div><p className="text-[10px] font-medium uppercase tracking-wider text-navy/55 dark:text-cream/55">{t('status.totalSeated')}</p><p className="mt-0.5 text-sm font-semibold">{totalSeated}</p></div>
              <div><p className="text-[10px] font-medium uppercase tracking-wider text-navy/55 dark:text-cream/55">{t('status.unseated')}</p><p className="mt-0.5 text-sm font-semibold">12</p></div>
              <div><p className="text-[10px] font-medium uppercase tracking-wider text-navy/55 dark:text-cream/55">{t('status.vips')}</p><p className="mt-0.5 text-sm font-semibold">8</p></div>
            </div>
            <button type="button" className="flex shrink-0 items-center gap-2 rounded-xl bg-navy px-3.5 py-2.5 text-xs font-semibold text-cream shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-gold dark:text-navy sm:px-4"><UserPlus className="size-4" aria-hidden="true" /><span className="hidden sm:inline">{t('actions.assignGuests')}</span></button>
          </div>
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-bronze/20 bg-cream/85 px-4 pb-3 pt-2 backdrop-blur-xl dark:border-gold/15 dark:bg-navy/90 sm:px-8">
          <div className="mx-auto grid max-w-lg grid-cols-4">{[
            { label: 'navigation.map', icon: MapIcon, active: true },
            { label: 'navigation.tables', icon: Grid2X2, active: false },
            { label: 'navigation.guests', icon: UsersRound, active: false },
            { label: 'navigation.settings', icon: Settings, active: false },
          ].map(({ label, icon: Icon, active }) => <button key={label} type="button" className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${active ? 'text-bronze dark:text-gold' : 'text-navy/50 hover:text-navy dark:text-cream/50 dark:hover:text-cream'}`} aria-current={active ? 'page' : undefined}><Icon className="size-5" strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" /><span>{t(label)}</span></button>)}</div>
        </nav>
      </main>
      <DragOverlay>{activeTable ? <div className={`flex items-center justify-center border-2 border-gold bg-cream/95 font-semibold text-navy shadow-2xl dark:bg-navy dark:text-cream ${activeTable.shape === 'pill' ? 'h-28 w-48 rounded-full' : 'size-36 rounded-full'}`}>{t('tables.title', { number: String(activeTable.number).padStart(2, '0') })}</div> : null}</DragOverlay>
    </DndContext>
  )
}
