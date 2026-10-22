import React, { FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    GraduationCap,
    UserCheck,
    Lock,
    Mail,
    User,
    ArrowRight,
} from "lucide-react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        role: "student",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post("/register", {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Create Account — University of Vanixx" />

            <form onSubmit={submit} className="space-y-6">
                {/* Create Account Heading */}
                <div className="space-y-2 pb-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Create Account
                    </h1>

                    <p className="text-sm text-zinc-400">
                        Join the University of Vanixx portal. Fill in your
                        details to get started.
                    </p>
                </div>

                {/* Select Your Role */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-zinc-200">
                        Select Your Role
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Student */}
                        <button
                            type="button"
                            onClick={() => setData("role", "student")}
                            aria-pressed={data.role === "student"}
                            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition min-h-[84px] cursor-pointer ${
                                data.role === "student"
                                    ? "border-teal-500 bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/30"
                                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600"
                            }`}
                        >
                            <div
                                className={`p-2.5 rounded-lg border shrink-0 ${
                                    data.role === "student"
                                        ? "bg-teal-500/20 border-teal-500/40 text-teal-400"
                                        : "bg-zinc-800 border-zinc-700"
                                }`}
                            >
                                <GraduationCap size={22} />
                            </div>

                            <div>
                                <p className="text-sm font-bold">Student</p>
                                <p className="text-xs text-zinc-400 mt-1">
                                    View GWA & grades
                                </p>
                            </div>
                        </button>

                        {/* Professor */}
                        <button
                            type="button"
                            onClick={() => setData("role", "professor")}
                            aria-pressed={data.role === "professor"}
                            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition min-h-[84px] cursor-pointer ${
                                data.role === "professor"
                                    ? "border-teal-500 bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/30"
                                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600"
                            }`}
                        >
                            <div
                                className={`p-2.5 rounded-lg border shrink-0 ${
                                    data.role === "professor"
                                        ? "bg-teal-500/20 border-teal-500/40 text-teal-400"
                                        : "bg-zinc-800 border-zinc-700"
                                }`}
                            >
                                <UserCheck size={22} />
                            </div>

                            <div>
                                <p className="text-sm font-bold">Professor</p>
                                <p className="text-xs text-zinc-400 mt-1">
                                    Encode term grades
                                </p>
                            </div>
                        </button>
                    </div>

                    {errors.role && (
                        <p className="text-xs text-rose-400">{errors.role}</p>
                    )}
                </div>

                {/* Registration Fields */}
                <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-zinc-300 mb-2"
                        >
                            Full Name
                        </label>

                        <div className="relative">
                            <User
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                            />

                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="e.g., Alex Mercer"
                                required
                                className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-900/70 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            />
                        </div>

                        {errors.name && (
                            <p className="text-xs text-rose-400 mt-1.5">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-zinc-300 mb-2"
                        >
                            Institutional Email
                        </label>

                        <div className="relative">
                            <Mail
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                            />

                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder="user@vanixx.edu.ph"
                                required
                                className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-900/70 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            />
                        </div>

                        {errors.email && (
                            <p className="text-xs text-rose-400 mt-1.5">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-zinc-300 mb-2"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                                />

                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-900/70 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                />
                            </div>

                            {errors.password && (
                                <p className="text-xs text-rose-400 mt-1.5">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-semibold text-zinc-300 mb-2"
                            >
                                Confirm Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                                />

                                <input
                                    id="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-900/70 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                />
                            </div>

                            {errors.password_confirmation && (
                                <p className="text-xs text-rose-400 mt-1.5">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Create Account Button */}
                <div className="pt-1">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-bold text-white shadow-lg shadow-teal-900/30 hover:bg-teal-500 transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <span>
                            {processing
                                ? "Creating Account..."
                                : "Create Account"}
                        </span>

                        <ArrowRight size={17} />
                    </button>
                </div>

                {/* Login Link */}
                <p className="text-center text-sm text-zinc-400">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-bold text-teal-400 hover:text-teal-300 underline underline-offset-4 transition"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </>
    );
}
