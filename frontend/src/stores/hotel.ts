import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  DAMAGE_CATALOG, GUESTS, HK_CHECKS, HK_TASKS, INCIDENTS, LOST, MOVEMENTS, RESERVATIONS, ROOMS,
  type Guest, type HkTask, type Incident, type Movement, type Reservation, type Room, type RoomStatus,
} from '../data/mock'

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T
const nowHM = (): string => new Date().toTimeString().slice(0, 5)
export const total = (r: Reservation): number => r.charges.reduce((a, c) => a + c.amount, 0)
export const balance = (r: Reservation): number => total(r) - r.paid

export const useHotel = defineStore('hotel', () => {
  const rooms = ref<Room[]>(clone(ROOMS))
  const reservations = ref<Reservation[]>(clone(RESERVATIONS))
  const guests = ref<Guest[]>(clone(GUESTS))
  const tasks = ref<HkTask[]>(clone(HK_TASKS))
  const incidents = ref<Incident[]>(clone(INCIDENTS))
  const movements = ref<Movement[]>(clone(MOVEMENTS))
  const lost = ref(clone(LOST))
  const lastReady = ref('')

  const real = computed(() => reservations.value.filter((r) => r.status !== 'maintenance'))
  const inHouse = computed(() => real.value.filter((r) => r.status === 'inhouse'))
  const arrivals = computed(() => real.value.filter((r) => r.start === 0 && (r.status === 'confirmed' || r.status === 'pending' || r.status === 'inhouse')))
  const departures = computed(() => real.value.filter((r) => r.end === 0 && r.status === 'inhouse'))
  const peopleInHouse = computed(() => inHouse.value.reduce((a, r) => a + r.people, 0))
  const countBy = (s: RoomStatus): number => rooms.value.filter((r) => r.status === s).length
  const occupancy = computed(() => Math.round((countBy('occupied') / rooms.value.length) * 100))
  const pendingBalance = computed(() => inHouse.value.reduce((a, r) => a + Math.max(balance(r), 0), 0))

  const incomeTotal = computed(() => movements.value.filter((m) => m.amount > 0).reduce((a, m) => a + m.amount, 0))
  const byMethod = (list: string[]): number => movements.value.filter((m) => m.amount > 0 && list.includes(m.method)).reduce((a, m) => a + m.amount, 0)
  const cashIn = computed(() => byMethod(['Efectivo']))
  const cashOut = computed(() => movements.value.filter((m) => m.amount < 0 && m.method === 'Efectivo').reduce((a, m) => a - m.amount, 0))
  const OPENING = 200
  const cashExpected = computed(() => OPENING + cashIn.value - cashOut.value)

  const roomOf = (n: string): Room | undefined => rooms.value.find((r) => r.number === n)
  const occupantOf = (n: string): Reservation | undefined => inHouse.value.find((r) => r.room === n)
  const nextArrival = (n: string): Reservation | undefined =>
    real.value.filter((r) => r.room === n && (r.status === 'confirmed' || r.status === 'pending')).sort((a, b) => a.start - b.start)[0]

  function checkIn(id: string): string | null {
    const r = reservations.value.find((x) => x.id === id)
    const room = r && roomOf(r.room)
    if (!r || !room) return 'No se encontró la reserva.'
    if (room.status !== 'free') return `La habitación ${room.number} todavía no está lista (${room.status === 'cleaning' ? 'en limpieza' : 'no disponible'}).`
    r.status = 'inhouse'
    room.status = 'occupied'
    return null
  }
  function pay(id: string, amount: number, method: string, by: string): void {
    const r = reservations.value.find((x) => x.id === id)
    if (!r || amount <= 0) return
    r.paid += amount
    movements.value.push({ time: nowHM(), concept: 'Pago de estadía', room: r.room, method, amount, by })
  }
  function checkOut(id: string): string | null {
    const r = reservations.value.find((x) => x.id === id)
    const room = r && roomOf(r.room)
    if (!r || !room) return 'No se encontró la reserva.'
    if (balance(r) > 0) return 'La cuenta tiene saldo pendiente.'
    r.status = 'done'
    room.status = 'cleaning'
    if (!tasks.value.some((t) => t.room === room.number && t.state !== 'done')) {
      tasks.value.push({ id: `T-${tasks.value.length + 1}`, room: room.number, kind: 'Limpieza de salida', staff: 'Carla Mendoza', state: 'pending', checks: HK_CHECKS.map(() => false), time: '' })
    }
    return null
  }
  function toggleMaintenance(n: string): void {
    const room = roomOf(n)
    if (!room || room.status === 'occupied') return
    room.status = room.status === 'maintenance' ? 'free' : 'maintenance'
  }
  function startTask(id: string): void {
    const t = tasks.value.find((x) => x.id === id)
    if (t && t.state === 'pending') { t.state = 'doing'; t.time = nowHM() }
  }
  function finishTask(id: string): void {
    const t = tasks.value.find((x) => x.id === id)
    const room = t && roomOf(t.room)
    if (!t || !room || !t.checks.every(Boolean)) return
    t.state = 'done'
    t.time = nowHM()
    room.status = 'free'
    lastReady.value = room.number
  }
  function reportDamage(room: string, item: string, by: string, note: string): void {
    const price = DAMAGE_CATALOG.find((d) => d.item === item)?.price ?? 0
    const n = 147 + incidents.value.filter((i) => i.id > 'INC-0146').length
    incidents.value.unshift({ id: `INC-0${n}`, date: '30 oct', room, item, amount: price, by, state: 'review', note })
  }
  function resolveIncident(id: string, approve: boolean): void {
    const i = incidents.value.find((x) => x.id === id)
    if (i) i.state = approve ? 'closed' : 'rejected'
  }

  return {
    rooms, reservations, guests, tasks, incidents, movements, lost, lastReady, real, inHouse, arrivals, departures,
    peopleInHouse, occupancy, pendingBalance, incomeTotal, cashIn, cashOut, cashExpected, OPENING,
    countBy, byMethod, roomOf, occupantOf, nextArrival, checkIn, pay, checkOut, toggleMaintenance, startTask, finishTask, reportDamage, resolveIncident,
  }
})
