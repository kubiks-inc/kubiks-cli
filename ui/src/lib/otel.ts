function kindNumberToString(kind: number | undefined): string {
  switch (kind) {
    case 1: return 'INTERNAL'
    case 2: return 'SERVER'
    case 3: return 'CLIENT'
    case 4: return 'PRODUCER'
    case 5: return 'CONSUMER'
    default: return 'INTERNAL'
  }
}