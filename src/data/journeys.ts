import type { Journey } from '../types/network'

// Journey labels, times, and categories are fictional test inputs, not passenger counts.
export const journeys: Journey[] = [
  { id: 'J-001', label: 'Avery · college commute', origin: 'willow', destination: 'west-college', departureMinute: 435, deadlineMinute: 510, category: 'student', priority: 'time-sensitive' },
  { id: 'J-002', label: 'Morgan · hospital visit', origin: 'meadow', destination: 'city-hospital', departureMinute: 450, deadlineMinute: 535, category: 'patient', priority: 'time-sensitive' },
  { id: 'J-003', label: 'Riley · market shift', origin: 'riverside', destination: 'market', departureMinute: 420, deadlineMinute: 500, category: 'worker', priority: 'standard' },
  { id: 'J-004', label: 'Jordan · university day', origin: 'northgate', destination: 'university', departureMinute: 440, deadlineMinute: 525, category: 'student', priority: 'time-sensitive' },
  { id: 'J-005', label: 'Casey · civic shift', origin: 'eastfield', destination: 'civic', departureMinute: 430, deadlineMinute: 520, category: 'worker', priority: 'standard' },
  { id: 'J-006', label: 'Taylor · clinic appointment', origin: 'hilltop', destination: 'south-hospital', departureMinute: 465, deadlineMinute: 545, category: 'patient', priority: 'time-sensitive' },
  { id: 'J-007', label: 'Quinn · college commute', origin: 'lakeside', destination: 'north-college', departureMinute: 425, deadlineMinute: 515, category: 'student', priority: 'standard' },
  { id: 'J-008', label: 'Drew · airport shift', origin: 'willow', destination: 'airport', departureMinute: 410, deadlineMinute: 515, category: 'worker', priority: 'standard' },
  { id: 'J-009', label: 'Finley · general travel', origin: 'harbor', destination: 'meadow', departureMinute: 480, deadlineMinute: 560, category: 'general', priority: 'standard' },
  { id: 'J-010', label: 'Reese · hospital visit', origin: 'northgate', destination: 'city-hospital', departureMinute: 455, deadlineMinute: 535, category: 'patient', priority: 'time-sensitive' },
  { id: 'J-011', label: 'Alex · west campus', origin: 'south-hospital', destination: 'west-college', departureMinute: 435, deadlineMinute: 530, category: 'student', priority: 'standard' },
  { id: 'J-012', label: 'Sam · mill shift', origin: 'meadow', destination: 'mill', departureMinute: 420, deadlineMinute: 535, category: 'worker', priority: 'standard' },
  { id: 'J-013', label: 'Robin · university day', origin: 'eastfield', destination: 'university', departureMinute: 445, deadlineMinute: 550, category: 'student', priority: 'time-sensitive' },
  { id: 'J-014', label: 'Emery · market errands', origin: 'hilltop', destination: 'market', departureMinute: 500, deadlineMinute: 575, category: 'general', priority: 'standard' },
  { id: 'J-015', label: 'Kai · hospital visit', origin: 'lakeside', destination: 'south-hospital', departureMinute: 460, deadlineMinute: 560, category: 'patient', priority: 'time-sensitive' },
  { id: 'J-016', label: 'Blake · civic shift', origin: 'north-college', destination: 'civic', departureMinute: 415, deadlineMinute: 500, category: 'worker', priority: 'standard' },
  { id: 'J-017', label: 'Parker · college commute', origin: 'meadow', destination: 'west-college', departureMinute: 430, deadlineMinute: 530, category: 'student', priority: 'standard' },
  { id: 'J-018', label: 'Sage · village connection', origin: 'willow', destination: 'riverside', departureMinute: 490, deadlineMinute: 560, category: 'general', priority: 'standard' },
  { id: 'J-019', label: 'Rowan · city shift', origin: 'south-hospital', destination: 'northgate', departureMinute: 425, deadlineMinute: 535, category: 'worker', priority: 'standard' },
  { id: 'J-020', label: 'Cameron · campus visit', origin: 'harbor', destination: 'north-college', departureMinute: 475, deadlineMinute: 560, category: 'student', priority: 'time-sensitive' },
  { id: 'J-021', label: 'Hayden · airport transfer', origin: 'lakeside', destination: 'airport', departureMinute: 440, deadlineMinute: 530, category: 'general', priority: 'standard' },
  { id: 'J-022', label: 'Frankie · market shift', origin: 'northgate', destination: 'market', departureMinute: 435, deadlineMinute: 520, category: 'worker', priority: 'standard' },
  { id: 'J-023', label: 'Jules · hospital appointment', origin: 'willow', destination: 'south-hospital', departureMinute: 455, deadlineMinute: 555, category: 'patient', priority: 'time-sensitive' },
  { id: 'J-024', label: 'Shiloh · east campus', origin: 'riverside', destination: 'university', departureMinute: 465, deadlineMinute: 555, category: 'student', priority: 'standard' },
]