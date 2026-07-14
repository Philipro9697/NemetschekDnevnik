'use client'

import { useState } from 'react'
import { User as UserIcon, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useApp } from '@/components/app-provider'
import { authService } from '@/api/authService'
import { userService } from '@/api/userService'

export function LoginScreen() {
    const { login } = useApp()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!username.trim() || !password) {
            setError('Моля, попълнете всички полета.')
            return
        }

        setError('')
        setLoading(true)

        try {
            const data = await authService.login({
                email: username.trim(),
                password: password
            })

            const tokenString = typeof data.token === 'string'
                ? data.token
                : data.token?.accessToken ?? null;

            if (tokenString) {
                localStorage.setItem('accessToken', tokenString)
            }

            // /auth/login already returns userId, so fetch that user's own profile
            // (self-service is allowed by the backend) instead of a separate "current user" call.
            const userProfile = await userService.getUserProfile(data.userId)
            await login(userProfile)

        } catch (err: any) {
            console.error("Login failure:", err)
            setError('Невалидно потребителско име, грешна парола или акаунтът все още не е одобрен.')
        } finally {
            setLoading(false)
        }
    }

    function handleTogglePassword() {
        setShow((value) => !value)
    }

    return (
        <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_32%),linear-gradient(135deg,_#1f4f8b,_#2f7d6d)] px-4 py-8 sm:px-6 sm:py-10">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-32 -right-16 size-96 rounded-full bg-brand-blue/20 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 flex flex-col items-center gap-4 text-center">
                    <Logo size="lg" variant="light" />
                    <h1 className="text-balance font-heading text-2xl font-bold text-white">
                        Добре дошли в електронния дневник
                    </h1>
                </div>

                <div className="glass-surface p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="username" className="text-sm font-medium">
                                Потребителско име или Имейл
                            </label>
                            <div className="relative">
                                <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="username"
                                    disabled={loading}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="name@example.com"
                                    autoComplete="username"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="password" className="text-sm font-medium">
                                Парола
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={show ? 'text' : 'password'}
                                    disabled={loading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Парола"
                                    autoComplete="current-password"
                                    className="px-9"
                                />
                                <button
                                    type="button"
                                    disabled={loading}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        handleTogglePassword()
                                    }}
                                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    aria-label={show ? 'Скрий паролата' : 'Покажи паролата'}
                                >
                                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            disabled={loading}
                            className="mt-1 h-11 w-full text-sm font-semibold tracking-wide"
                        >
                            <LogIn className="size-4" />
                            {loading ? 'ЗАРЕЖДАНЕ...' : 'ВХОД'}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                className="text-sm font-medium text-brand-blue hover:underline"
                            >
                                Забравена парола?
                            </button>
                        </div>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-white/40">
                    Достъпът до системата се предоставя от администрацията на училището.
                </p>
            </div>
        </main>
    )
}