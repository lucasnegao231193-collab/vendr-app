/**
 * Testes do Componente ShareChatLink
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareChatLink } from '@/components/ShareChatLink'

// Mock do useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('ShareChatLink Component', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    })
  })

  it('renderiza o botão de compartilhar', () => {
    render(<ShareChatLink />)
    const button = screen.getByRole('button', { name: /compartilhar/i })
    expect(button).toBeInTheDocument()
  })

  it('abre o dialog ao clicar no botão', async () => {
    render(<ShareChatLink />)
    const button = screen.getByRole('button', { name: /compartilhar/i })
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/Link de Compartilhamento/i)).toBeInTheDocument()
    })
  })

  it('gera um link ao clicar em "Gerar Link"', async () => {
    render(<ShareChatLink />)
    const shareButton = screen.getByRole('button', { name: /compartilhar/i })
    
    fireEvent.click(shareButton)
    
    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /gerar link/i })
      fireEvent.click(generateButton)
    })

    await waitFor(() => {
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toContain('/chat/shared/')
    })
  })

  it('copia o link para a área de transferência', async () => {
    render(<ShareChatLink />)
    const shareButton = screen.getByRole('button', { name: /compartilhar/i })
    
    fireEvent.click(shareButton)
    
    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /gerar link/i })
      fireEvent.click(generateButton)
    })

    await waitFor(() => {
      const copyButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')
      )
      if (copyButton) {
        fireEvent.click(copyButton)
      }
    })

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })
})
