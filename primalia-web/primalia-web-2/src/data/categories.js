export const CATEGORIAS_GASTO = [
  { id: 'supermercado', nombre: 'Supermercado', color: '#34A353', icono: 'cart' },
  { id: 'cafeteria', nombre: 'Cafeteria', color: '#D89214', icono: 'cup' },
  { id: 'restaurante', nombre: 'Restaurante', color: '#FF7A27', icono: 'fork' },
  { id: 'ocio', nombre: 'Ocio', color: '#9E73FF', icono: 'ticket' },
  { id: 'transporte', nombre: 'Transporte', color: '#EE9933', icono: 'car' },
  { id: 'salud', nombre: 'Salud', color: '#D95266', icono: 'health' },
  { id: 'hogar', nombre: 'Hogar', color: '#669980', icono: 'home' },
  { id: 'ropa', nombre: 'Ropa', color: '#D98C33', icono: 'shirt' },
  { id: 'suscripciones', nombre: 'Suscripciones', color: '#8066CC', icono: 'repeat' },
  { id: 'otros', nombre: 'Otros', color: '#A39D97', icono: 'grid' }
]

export const CATEGORIAS_PAGO = [
  { id: 'transferencia', nombre: 'Transferencia', color: '#FF7A27', cuentaComoGasto: false, icono: 'transfer' },
  { id: 'financieraCredito', nombre: 'Financiera / Credito', color: '#9E73FF', cuentaComoGasto: true, icono: 'card' },
  { id: 'telefoniaFibra', nombre: 'Telefonia y Fibra', color: '#408CD9', cuentaComoGasto: true, icono: 'wifi' },
  { id: 'suscripciones', nombre: 'Suscripciones', color: '#8066CC', cuentaComoGasto: true, icono: 'repeat' },
  { id: 'reservaViaje', nombre: 'Reserva / Viaje', color: '#34A353', cuentaComoGasto: true, icono: 'plane' },
  { id: 'recibos', nombre: 'Recibo', color: '#D89214', cuentaComoGasto: true, icono: 'file' },
  { id: 'alquiler', nombre: 'Alquiler', color: '#D95266', cuentaComoGasto: false, icono: 'home' },
  { id: 'otro', nombre: 'Otro', color: '#A39D97', cuentaComoGasto: false, icono: 'more' }
]

export const TIPOS_CUENTA = [
  { id: 'corriente', nombre: 'Cuenta Corriente', color: '#FF7A27' },
  { id: 'nomina', nombre: 'Cuenta Nomina', color: '#9E73FF' },
  { id: 'ahorro', nombre: 'Cuenta de Ahorro', color: '#D89214' },
  { id: 'remunerada', nombre: 'Cuenta Remunerada', color: '#34A353' }
]

export const TIPOS_AVISO = [
  { id: 'unDia', nombre: '1 dia antes' },
  { id: 'dosDias', nombre: '2 dias antes' },
  { id: 'unaSemana', nombre: '1 semana antes' }
]

export const TIPOS_REPETICION = ['Nunca', 'Cada dia', 'Cada semana', 'Cada 2 semanas', 'Cada mes', 'Cada año', 'Personalizado']

export function catGasto(id) {
  return CATEGORIAS_GASTO.find(c => c.id === id) || CATEGORIAS_GASTO[CATEGORIAS_GASTO.length - 1]
}

export function catPago(id) {
  return CATEGORIAS_PAGO.find(c => c.id === id) || CATEGORIAS_PAGO[CATEGORIAS_PAGO.length - 1]
}

export function tipoCuenta(id) {
  return TIPOS_CUENTA.find(c => c.id === id) || TIPOS_CUENTA[0]
}
