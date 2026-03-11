import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import Login from '@/app/auth/signin/page'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

describe('Login Component', () => {
  it('renders login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockSignIn = jest.fn()
    jest.mock('next-auth/react', () => ({
      useSession: () => ({ data: null, status: 'unauthenticated' }),
      signIn: mockSignIn,
      signOut: jest.fn(),
    }))

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    )

    const phoneInput = screen.getByLabelText(/phone/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(phoneInput, { target: { value: '0750000001' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        phone: '0750000001',
        password: 'password123',
        redirect: false,
      })
    })
  })
})
