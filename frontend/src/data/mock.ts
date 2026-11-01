// Datos de ejemplo del Hotel Demo Lima. Ningún dato es real.
// Fecha de la demo: viernes 30 de octubre de 2026.

export type RoomStatus = 'free' | 'occupied' | 'cleaning' | 'maintenance'
export type ResStatus = 'confirmed' | 'pending' | 'inhouse' | 'done' | 'maintenance'

export interface RoomType { id: string; name: string; capacity: number; rate: number }
export interface Room { number: string; floor: number; type: string; status: RoomStatus; note?: string }
export interface Charge { concept: string; amount: number }
export interface Reservation {
  id: string; room: string; guest: string; start: number; end: number
  status: ResStatus; source: string; rate: number; paid: number
  charges: Charge[]; deposit: boolean; people: number
}
export interface Guest { name: string; doc: string; nat: string; origin: string; stays: number; last: string; note: string }
export interface HkTask { id: string; room: string; kind: string; staff: string; state: 'pending' | 'doing' | 'done'; checks: boolean[]; time: string }
export interface Incident {
  id: string; date: string; room: string; item: string; amount: number
  by: string; state: 'open' | 'review' | 'closed' | 'rejected'; note: string
}
export interface Movement { time: string; concept: string; room: string; method: string; amount: number; by: string }
export interface Lost { id: string; item: string; room: string; found: string; where: string; state: 'Sin reclamar' | 'Entregado' }

export const TODAY = new Date(2026, 9, 30)
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export function dayAt(offset: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + offset)
  return d
}
export const fmtDay = (offset: number): string => {
  const d = dayAt(offset)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}
export const dayName = (offset: number): string => DAYS[dayAt(offset).getDay()]
export const money = (n: number): string => `S/ ${n.toLocaleString('es-PE')}`

export const ROOM_TYPES: RoomType[] = [
  { id: 'std', name: 'Estándar', capacity: 2, rate: 200 },
  { id: 'sup', name: 'Superior', capacity: 3, rate: 240 },
  { id: 'sui', name: 'Suite', capacity: 4, rate: 320 },
]

const typeOf = (n: string): string => {
  if (['101', '102', '103', '104', '105', '106', '201', '202'].includes(n)) return 'Estándar'
  if (['203', '204', '205', '206', '301', '302'].includes(n)) return 'Superior'
  return 'Suite'
}
const STATUS: Record<string, RoomStatus> = {
  '101': 'occupied', '103': 'occupied', '104': 'occupied', '201': 'occupied', '203': 'occupied',
  '204': 'occupied', '301': 'occupied', '303': 'occupied', '305': 'occupied', '306': 'occupied',
  '102': 'cleaning', '202': 'cleaning', '205': 'cleaning', '304': 'maintenance',
}
export const ROOMS: Room[] = ['101', '102', '103', '104', '105', '106', '201', '202', '203', '204', '205', '206', '301', '302', '303', '304', '305', '306'].map((n) => ({
  number: n, floor: Number(n[0]), type: typeOf(n), status: STATUS[n] ?? 'free',
  note: n === '304' ? 'Fuga en el grifo del baño' : undefined,
}))

function res(id: string, room: string, guest: string, start: number, end: number, status: ResStatus, source: string, extra = 0, paidAll = false, people = 1): Reservation {
  const rate = ROOM_TYPES.find((t) => t.name === typeOf(room))!.rate
  const nights = end - start
  const charges: Charge[] = [{ concept: `Estadía, ${nights} noche${nights === 1 ? '' : 's'}`, amount: nights * rate }]
  if (extra) charges.push({ concept: 'Lavandería', amount: extra })
  const total = charges.reduce((a, c) => a + c.amount, 0)
  const deposit = ['R-2051', 'R-2053'].includes(id)
  return { id, room, guest, start, end, status, source, rate, charges, people, deposit, paid: paidAll ? total : deposit ? 160 : 0 }
}

export const RESERVATIONS: Reservation[] = [
  { ...res('R-2041', '101', 'Pérez Ruiz, Jorge', -3, 0, 'inhouse', 'Directo', 40), paid: 300 },
  res('R-2042', '103', 'Huamán Reyes, Marta', -2, 0, 'inhouse', 'Booking', 0, true),
  res('R-2043', '201', 'Herrera Díaz, Luis', -1, 0, 'inhouse', 'Airbnb', 0, true),
  res('R-2044', '301', 'Ortega Ruiz, Pablo', -4, 0, 'inhouse', 'Directo', 0, true),
  res('R-2045', '104', 'Castillo Vera, Elena', -2, 2, 'inhouse', 'Booking', 0, true, 2),
  res('R-2046', '203', 'Fernández Mora, Raúl', -1, 3, 'inhouse', 'Directo', 0, true, 1),
  res('R-2047', '204', 'Salazar Peña, Inés', -3, 1, 'inhouse', 'Airbnb', 0, true),
  res('R-2048', '303', 'Bravo Núñez, Diego', -2, 4, 'inhouse', 'Directo', 0, true, 2),
  res('R-2049', '305', 'Quispe Ramos, Lucía', -1, 2, 'inhouse', 'Agencia', 0, true, 1),
  res('R-2050', '306', 'Delgado Ríos, Mateo', -5, 1, 'inhouse', 'Directo', 0, true, 1),
  res('R-2051', '105', 'Mendoza Ríos, Carla', 0, 3, 'confirmed', 'Directo'),
  res('R-2052', '106', 'Rodríguez Silva, Luis', 0, 2, 'confirmed', 'Booking'),
  res('R-2053', '206', 'Torres Restrepo, Ana', 0, 4, 'confirmed', 'Directo', 0, false, 3),
  res('R-2054', '302', 'Vega Castro, Iván', 0, 2, 'confirmed', 'Airbnb'),
  res('R-2055', '102', 'Núñez Paredes, Rosa', 0, 1, 'confirmed', 'Directo', 0, false, 1),
  res('R-2056', '101', 'Soto Medina, Raquel', 1, 4, 'confirmed', 'Booking'),
  res('R-2057', '205', 'Rojas Luna, Andrés', 1, 3, 'pending', 'Directo'),
  res('R-2058', '201', 'Paz Aguirre, Sofía', 2, 4, 'confirmed', 'Airbnb'),
  res('R-2059', '202', 'Cruz Medina, Óscar', 2, 5, 'confirmed', 'Agencia'),
  res('R-2060', '103', 'Lara Campos, Tomás', 3, 6, 'confirmed', 'Directo'),
  res('R-2061', '104', 'Vargas Rey, Nuria', 3, 6, 'pending', 'Booking'),
  res('R-2062', '302', 'Lagos Pinto, Hugo', 4, 7, 'confirmed', 'Directo'),
  res('R-2063', '106', 'Mora Salas, Daniela', 5, 8, 'pending', 'Booking'),
  res('R-2064', '301', 'Ibáñez Cano, Julia', 3, 6, 'confirmed', 'Airbnb'),
  res('R-2065', '206', 'Ruiz Barrios, Pedro', 6, 9, 'confirmed', 'Directo'),
  res('R-2066', '305', 'Arce Tello, Camila', 4, 8, 'confirmed', 'Agencia'),
  res('R-2067', '303', 'Nieto Vidal, Álvaro', 6, 10, 'confirmed', 'Directo'),
  res('R-2068', '105', 'Cano Soler, Mireia', 6, 9, 'confirmed', 'Booking'),
  { id: 'M-01', room: '304', guest: 'Mantenimiento', start: -2, end: 3, status: 'maintenance', source: '', rate: 0, paid: 0, charges: [], deposit: false, people: 0 },
]

export const GUESTS: Guest[] = [
  ['Pérez Ruiz, Jorge', 'DNI 41822093', 'Perú', 'Lima', 3, '27 oct 2026'], ['Huamán Reyes, Marta', 'DNI 45120377', 'Perú', 'Arequipa', 1, '28 oct 2026'],
  ['Herrera Díaz, Luis', 'Pasaporte AA1204558', 'México', 'Guadalajara', 1, '29 oct 2026'], ['Ortega Ruiz, Pablo', 'DNI 40977712', 'Perú', 'Trujillo', 5, '26 oct 2026'],
  ['Castillo Vera, Elena', 'DNI 70311854', 'Perú', 'Lima', 2, '28 oct 2026'], ['Fernández Mora, Raúl', 'Pasaporte PA882901', 'Argentina', 'Córdoba', 1, '29 oct 2026'],
  ['Salazar Peña, Inés', 'DNI 43829015', 'Perú', 'Cusco', 4, '27 oct 2026'], ['Bravo Núñez, Diego', 'Pasaporte XDE30127', 'Chile', 'Santiago', 2, '28 oct 2026'],
  ['Quispe Ramos, Lucía', 'DNI 46650218', 'Perú', 'Huancayo', 1, '29 oct 2026'], ['Delgado Ríos, Mateo', 'DNI 72104459', 'Perú', 'Piura', 6, '25 oct 2026'],
  ['Mendoza Ríos, Carla', 'DNI 44013265', 'Perú', 'Lima', 7, '12 sep 2026'], ['Rodríguez Silva, Luis', 'DNI 09822134', 'Perú', 'Ica', 2, '03 ago 2026'],
  ['Torres Restrepo, Ana', 'Pasaporte BC771204', 'Colombia', 'Medellín', 1, 'Primera visita'], ['Vega Castro, Iván', 'DNI 47220931', 'Perú', 'Chiclayo', 3, '19 jun 2026'],
  ['Núñez Paredes, Rosa', 'DNI 40118876', 'Perú', 'Lima', 8, '02 oct 2026'], ['Soto Medina, Raquel', 'Pasaporte YT5521098', 'España', 'Madrid', 1, 'Primera visita'],
  ['Rojas Luna, Andrés', 'DNI 70448123', 'Perú', 'Lima', 2, '14 jul 2026'], ['Paz Aguirre, Sofía', 'DNI 48812906', 'Perú', 'Tacna', 1, 'Primera visita'],
].map(([name, doc, nat, origin, stays, last]) => ({ name, doc, nat, origin, stays, last, note: '' }) as Guest)

export const HK_CHECKS = ['Cama y ropa de cama', 'Baño y amenities', 'Piso y superficies', 'Revisión de objetos olvidados', 'Ventilación y aroma']
export const HK_TASKS: HkTask[] = [
  { id: 'T-1', room: '202', kind: 'Limpieza de salida', staff: 'Carla Mendoza', state: 'doing', checks: [true, true, false, false, false], time: '13:40' },
  { id: 'T-2', room: '102', kind: 'Limpieza de salida', staff: 'Carla Mendoza', state: 'pending', checks: [false, false, false, false, false], time: '' },
  { id: 'T-3', room: '205', kind: 'Limpieza de salida', staff: 'Ana Villanueva', state: 'pending', checks: [false, false, false, false, false], time: '' },
  { id: 'T-4', room: '105', kind: 'Limpieza de salida', staff: 'Carla Mendoza', state: 'done', checks: [true, true, true, true, true], time: '10:55' },
  { id: 'T-5', room: '106', kind: 'Limpieza de salida', staff: 'Ana Villanueva', state: 'done', checks: [true, true, true, true, true], time: '11:20' },
  { id: 'T-6', room: '206', kind: 'Limpieza profunda', staff: 'Carla Mendoza', state: 'done', checks: [true, true, true, true, true], time: '12:10' },
  { id: 'T-7', room: '302', kind: 'Limpieza de salida', staff: 'Ana Villanueva', state: 'done', checks: [true, true, true, true, true], time: '12:45' },
]

export const DAMAGE_CATALOG: { item: string; price: number }[] = [
  { item: 'Toalla manchada', price: 40 }, { item: 'Control remoto perdido', price: 60 }, { item: 'Sábana manchada', price: 90 },
  { item: 'Lámpara rota', price: 150 }, { item: 'Vidrio de ventana roto', price: 240 }, { item: 'Colchón manchado', price: 380 },
  { item: 'Llave perdida', price: 50 }, { item: 'Fumar en la habitación', price: 200 },
]
export const INCIDENTS: Incident[] = [
  { id: 'INC-0146', date: '30 oct', room: '204', item: 'Sábana manchada', amount: 90, by: 'Carla Mendoza', state: 'review', note: 'Mancha de vino, no sale con lavado.' },
  { id: 'INC-0145', date: '30 oct', room: '203', item: 'Control remoto perdido', amount: 60, by: 'Carla Mendoza', state: 'review', note: 'No estaba en la habitación al revisar.' },
  { id: 'INC-0144', date: '29 oct', room: '304', item: 'Grifo con fuga', amount: 0, by: 'María Rodríguez', state: 'open', note: 'Mantenimiento. No lleva cargo al huésped.' },
  { id: 'INC-0143', date: '26 oct', room: '303', item: 'Colchón manchado', amount: 380, by: 'Ana Villanueva', state: 'closed', note: 'Cargo aprobado y cobrado en la salida.' },
  { id: 'INC-0142', date: '22 oct', room: '206', item: 'Vidrio de ventana roto', amount: 240, by: 'María Rodríguez', state: 'closed', note: 'Descontado del depósito de garantía.' },
]
export const LOST: Lost[] = [
  { id: 'OL-31', item: 'Cargador de celular', room: '201', found: '28 oct', where: 'Recepción, casillero 2', state: 'Sin reclamar' },
  { id: 'OL-30', item: 'Gafas de sol', room: '306', found: '25 oct', where: 'Recepción, casillero 1', state: 'Sin reclamar' },
  { id: 'OL-29', item: 'Chaqueta azul', room: '105', found: '12 oct', where: 'Entregada a su dueño', state: 'Entregado' },
]

export const MOVEMENTS: Movement[] = [
  { time: '08:05', concept: 'Pago de estadía', room: '305', method: 'Efectivo', amount: 240, by: 'María Rodríguez' },
  { time: '09:20', concept: 'Pago de estadía', room: '204', method: 'Yape', amount: 350, by: 'María Rodríguez' },
  { time: '10:02', concept: 'Pago de estadía', room: '303', method: 'Tarjeta', amount: 310, by: 'María Rodríguez' },
  { time: '10:40', concept: 'Pago de estadía', room: '203', method: 'Efectivo', amount: 200, by: 'María Rodríguez' },
  { time: '11:15', concept: 'Pago de estadía', room: '306', method: 'Plin', amount: 260, by: 'María Rodríguez' },
  { time: '11:50', concept: 'Compra de insumos de limpieza', room: '-', method: 'Efectivo', amount: -60, by: 'María Rodríguez' },
  { time: '12:30', concept: 'Pago de estadía', room: '104', method: 'Efectivo', amount: 320, by: 'María Rodríguez' },
  { time: '13:05', concept: 'Depósito de garantía', room: '105', method: 'Efectivo', amount: 160, by: 'María Rodríguez' },
]
export const PAST_CASH = [
  { date: '29 oct 2026', shift: 'Turno mañana', total: 1620, diff: 0 },
  { date: '28 oct 2026', shift: 'Turno mañana', total: 2050, diff: -10 },
  { date: '27 oct 2026', shift: 'Turno mañana', total: 1380, diff: 0 },
]
export const PAY_METHODS = ['Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Transferencia']

export const TEAM = [
  { name: 'Jorge Velásquez', email: 'jorge.velasquez@hotel-name.com', role: 'Admin de hotel', status: 'Activo' },
  { name: 'María Rodríguez', email: 'maria.rodriguez@hotel-name.com', role: 'Recepción', status: 'Activo' },
  { name: 'Carla Mendoza', email: 'carla.mendoza@hotel-name.com', role: 'Housekeeping', status: 'Activo' },
  { name: 'Ana Villanueva', email: 'ana.villanueva@hotel-name.com', role: 'Housekeeping', status: 'Invitación pendiente' },
]

// Series del mes de octubre. Se generan de forma fija para que los totales cuadren.
function series(): { rev: number[]; occ: number[] } {
  const raw = Array.from({ length: 29 }, (_, i) => 1 + 0.32 * Math.sin(i * 1.7) + (dayAt(i - 28).getDay() >= 5 ? 0.22 : 0))
  const rawSum = raw.reduce((a, b) => a + b, 0)
  const target = 71690 - 1840
  const rev = raw.map((v) => Math.round((v / rawSum) * target / 10) * 10)
  rev.push(1840)
  rev[27] += 71690 - rev.reduce((a, b) => a + b, 0)
  const occRaw = raw.map((v) => v * 62)
  const mean = occRaw.reduce((a, b) => a + b, 0) / 29
  const occ = occRaw.map((v) => Math.max(30, Math.min(96, Math.round(v * (62 * 30 - 56) / 29 / mean))))
  occ.push(56)
  return { rev, occ }
}
export const SERIES = series()
export const PAY_SPLIT = [['Efectivo', 26500], ['Yape y Plin', 17890], ['Tarjeta', 15300], ['Transferencia', 12000]] as const
export const SOURCE_SPLIT = [['Directo', 28400], ['Booking', 22300], ['Airbnb', 12490], ['Agencias', 8500]] as const
export const NIGHTS_SOLD = 335

export const DEMO_USERS = [
  { email: 'jorge.velasquez@hotel-name.com', name: 'Jorge Velásquez', role: 'admin' as const },
  { email: 'maria.rodriguez@hotel-name.com', name: 'María Rodríguez', role: 'reception' as const },
  { email: 'carla.mendoza@hotel-name.com', name: 'Carla Mendoza', role: 'housekeeping' as const },
]
export const DEMO_PASSWORD = 'kuntur123'
