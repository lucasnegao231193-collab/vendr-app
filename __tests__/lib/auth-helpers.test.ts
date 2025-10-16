/**
 * Testes dos Helpers de Autenticação
 */
import { getSiteUrl, getOAuthCallbackUrl } from '@/lib/auth-helpers'

describe('Auth Helpers', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    delete process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.NEXT_PUBLIC_VERCEL_URL
    delete process.env.NEXT_PUBLIC_NETLIFY_URL
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getSiteUrl', () => {
    it('retorna NEXT_PUBLIC_SITE_URL quando definido', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://venlo.com.br'
      expect(getSiteUrl()).toBe('https://venlo.com.br')
    })

    it('retorna URL do Netlify quando SITE_URL não está definido', () => {
      process.env.NEXT_PUBLIC_NETLIFY_URL = 'https://venlo.netlify.app'
      expect(getSiteUrl()).toBe('https://venlo.netlify.app')
    })

    it('retorna URL do Vercel quando outras não estão definidas', () => {
      process.env.NEXT_PUBLIC_VERCEL_URL = 'venlo.vercel.app'
      expect(getSiteUrl()).toBe('https://venlo.vercel.app')
    })

    it('retorna localhost como fallback', () => {
      expect(getSiteUrl()).toBe('http://localhost:3000')
    })
  })

  describe('getOAuthCallbackUrl', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://venlo.com.br'
    })

    it('retorna URL de callback para empresa', () => {
      const url = getOAuthCallbackUrl('empresa')
      expect(url).toBe('https://venlo.com.br/auth/callback?type=empresa')
    })

    it('retorna URL de callback para autônomo', () => {
      const url = getOAuthCallbackUrl('autonomo')
      expect(url).toBe('https://venlo.com.br/auth/callback?type=autonomo')
    })
  })
})
