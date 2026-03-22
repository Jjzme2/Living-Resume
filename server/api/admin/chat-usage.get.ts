import { kvGet } from '../../utils/kv'

interface DayUsage {
  input_tokens: number
  output_tokens: number
  calls: number
}

// Haiku 4.5 pricing (per million tokens)
const INPUT_COST_PER_M  = 0.80
const OUTPUT_COST_PER_M = 4.00

function calcCost(input: number, output: number): number {
  return (input / 1_000_000) * INPUT_COST_PER_M + (output / 1_000_000) * OUTPUT_COST_PER_M
}

export default defineEventHandler(async () => {
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  const [total, ...dailyRaw] = await Promise.all([
    kvGet<DayUsage>('chat:usage:total'),
    ...days.map((day) => kvGet<DayUsage>(`chat:usage:daily:${day}`)),
  ])

  const daily = days.map((date, i) => {
    const d = dailyRaw[i] ?? { input_tokens: 0, output_tokens: 0, calls: 0 }
    return {
      date,
      input_tokens:  d.input_tokens,
      output_tokens: d.output_tokens,
      calls:         d.calls,
      estimated_cost: calcCost(d.input_tokens, d.output_tokens),
    }
  })

  const t = total ?? { input_tokens: 0, output_tokens: 0, calls: 0 }

  return {
    total: {
      input_tokens:   t.input_tokens,
      output_tokens:  t.output_tokens,
      calls:          t.calls,
      estimated_cost: calcCost(t.input_tokens, t.output_tokens),
    },
    daily,
    pricing: { input_per_m: INPUT_COST_PER_M, output_per_m: OUTPUT_COST_PER_M, model: 'claude-haiku-4-5' },
  }
})
