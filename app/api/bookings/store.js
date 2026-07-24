const globalStore = globalThis

if (!globalStore.atithiBookings) globalStore.atithiBookings = []
if (!globalStore.atithiBookingListeners) globalStore.atithiBookingListeners = new Set()

export function getBookings() {
  return globalStore.atithiBookings
}

export function addBooking(booking) {
  globalStore.atithiBookings = [booking, ...globalStore.atithiBookings]
  for (const listener of globalStore.atithiBookingListeners) listener(booking)
}

export function subscribe(listener) {
  globalStore.atithiBookingListeners.add(listener)
  return () => globalStore.atithiBookingListeners.delete(listener)
}
