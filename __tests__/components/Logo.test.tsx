/**
 * Testes do Componente Logo
 */
import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/Logo'

describe('Logo Component', () => {
  it('renderiza o logo corretamente', () => {
    render(<Logo />)
    const logo = screen.getByText(/venlo/i)
    expect(logo).toBeInTheDocument()
  })

  it('renderiza com tamanho pequeno', () => {
    const { container } = render(<Logo size="sm" />)
    expect(container.firstChild).toHaveClass('text-xl')
  })

  it('renderiza com tamanho médio', () => {
    const { container } = render(<Logo size="md" />)
    expect(container.firstChild).toHaveClass('text-2xl')
  })

  it('renderiza com tamanho grande', () => {
    const { container } = render(<Logo size="lg" />)
    expect(container.firstChild).toHaveClass('text-4xl')
  })
})
