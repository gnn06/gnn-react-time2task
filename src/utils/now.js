export function getNow() {
    const fake = import.meta.env.VITE_FAKE_NOW
    if (!fake) return new Date()
    const [datePart, timePart = '00:00'] = fake.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes = 0] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hours, minutes)
}
