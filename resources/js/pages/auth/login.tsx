import React, { FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Lock,
    Mail,
    ArrowRight,
    UserCheck,
    GraduationCap,
    KeyRound,
} from "lucide-react";

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post("/login", {
            onFinish: () => reset("password"),
        });
    };

    // Quick fill helper para sa manual demo testing
    const fillDemoCredentials = (email: string) => {
        setData((prev) => ({
            ...prev,
            email,
            password: "password123", // standard test password
        }));
    };

    return (
        <>
            <Head title="Sign In — University of Vanixx" />

            <form onSubmit={submit} className="space-y-6">
                {/* Heading */}
                <div className="space-y-2 pb-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Sign In
                    </h1>   
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Welcome back. Access your academic portal and records.
                    </p>
                </div>

                {/* Session Status Banner */}
                {status && (
                    <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/10 text-xs font-semibold text-teal-700 dark:text-teal-300">
                        {status}
                    </div>
                )}

                {/* Form Fields */}
                <div className="space-y-4">
                    {/* Institutional Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                        >
                            Institutional Email
                        </label>
                        <div className="relative">
                            <Mail
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
                            />
                            <input
                                id="email"
                                type="email"
                                autoComplete="username"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder="user@edutrack.edu.ph"
                                required
                                className="w-full h-12 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition shadow-sm"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                            >
                                Password
                            </label>
                            {canResetPassword && (
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <Lock
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
                            />
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="••••••••"
                                required
                                className="w-full h-12 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition shadow-sm"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Remember Session Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                                className="size-4 rounded border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-teal-600 focus:ring-teal-500/30 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                Keep me signed in on this device
                            </span>
                        </label>
                    </div>
                </div>

                {/* Sign In Button */}
                <div className="pt-1">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-bold text-white shadow-lg shadow-teal-900/30 hover:bg-teal-500 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <span>{processing ? "Signing In..." : "Sign In"}</span>
                        <ArrowRight size={17} />
                    </button>
                </div>

                {/* Register Link */}
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 underline underline-offset-4 transition"
                    >
                        Create an account
                    </Link>
                </p>

                {/* Demo Accounts Quick Fill Box */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-stone-100/70 dark:bg-zinc-900/40 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            <KeyRound
                                size={14}
                                className="text-teal-600 dark:text-teal-400"
                            />
                            <span>Quick Evaluation Credentials</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() =>
                                    fillDemoCredentials("student@test.com")
                                }
                                className="flex items-center gap-2 p-2 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:border-teal-500/50 hover:bg-teal-500/10 text-left transition text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-sm group"
                            >
                                <GraduationCap
                                    size={15}
                                    className="text-teal-600 dark:text-teal-400 shrink-0"
                                />
                                <div className="truncate">
                                    <p className="text-[11px] font-bold leading-none group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                                        Student Demo
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                        student@test.com
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    fillDemoCredentials("prof@test.com")
                                }
                                className="flex items-center gap-2 p-2 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:border-teal-500/50 hover:bg-teal-500/10 text-left transition text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-sm group"
                            >
                                <UserCheck
                                    size={15}
                                    className="text-teal-600 dark:text-teal-400 shrink-0"
                                />
                                <div className="truncate">
                                    <p className="text-[11px] font-bold leading-none group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                                        Professor Demo
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                        prof@test.com
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
