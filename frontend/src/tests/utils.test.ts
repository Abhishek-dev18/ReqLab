import { describe, expect, it } from 'vitest'

function substituteVariables(value: string, variables: Record<string, string>): string {
  return value.replace(/\{\{(\s*[\w.-]+\s*)\}\}/g, (_, key: string) => {
    const trimmed = key.trim()
    return variables[trimmed] ?? `{{${trimmed}}}`
  })
}

describe('variable substitution', () => {
  it('replaces known variables', () => {
    expect(substituteVariables('{{base_url}}/users', { base_url: 'https://api.test' })).toBe(
      'https://api.test/users',
    )
  })

  it('leaves unknown variables unchanged', () => {
    expect(substituteVariables('{{unknown}}', {})).toBe('{{unknown}}')
  })
})
