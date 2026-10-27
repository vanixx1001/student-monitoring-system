import React, { FormEventHandler, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    GraduationCap,
    UserCheck,
    Lock,
    Mail,
    User,
    ArrowRight,
    Eye,
    EyeOff,
    CheckCircle2,
    KeyRound,
    Loader2,
} from "lucide-react";

export default function Register() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        setError,
        clearErrors,
    } = useForm({
        name: "",
        email: "",
        role: "student",
        password: "",
        password_confirmation: "",
        otp: "",
    });

    // Eye toggle states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // OTP states
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpMessage, setOtpMessage] = useState<string | null>(null);

    const handleSendOtp = async () => {
        if (!data.email) {
            setError("email", "Please provide your email address first.");
            return;
        }

        clearErrors("email");
        setIsSendingOtp(true);
        setOtpMessage(null);

        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || "";

            const response = await fetch("/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ email: data.email }),
            });

            const resData = await response.json();

            if (response.ok && resData.status === "success") {
                setOtpSent(true);
                setOtpMessage(resData.message);
            } else {
                if (resData.errors?.email) {
                    setError("email", resData.errors.email[0]);
                } else if (resData.message) {
                    setError("email", resData.message);
                } else {
                    setError("email", "Failed to send code. Please try again.");
                }
            }
        } catch (error) {
            setError(
                "email",
                "Failed to dispatch verification code. Please check your connection.",
            );
        } finally {
            setIsSendingOtp(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!otpSent) {
            setError(
                "otp",
                "Please click 'Send Code' and enter the verification code sent to your email.",
            );
            return;
        }

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
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                        Create Account
                    </h1>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Join the EduTrack portal. Fill in your
                        details to get started.
                    </p>
                </div>

                {/* Select Your Role */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-200">
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
                                    ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/30"
                                    : "border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600"
                            }`}
                        >
                            <div
                                className={`p-2.5 rounded-lg border shrink-0 ${
                                    data.role === "student"
                                        ? "bg-teal-500/20 border-teal-500/40 text-teal-600 dark:text-teal-400"
                                        : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                                }`}
                            >
                                <GraduationCap size={22} />
                            </div>

                            <div>
                                <p className="text-sm font-bold">Student</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
                                    ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/30"
                                    : "border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600"
                            }`}
                        >
                            <div
                                className={`p-2.5 rounded-lg border shrink-0 ${
                                    data.role === "professor"
                                        ? "bg-teal-500/20 border-teal-500/40 text-teal-600 dark:text-teal-400"
                                        : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                                }`}
                            >
                                <UserCheck size={22} />
                            </div>

                            <div>
                                <p className="text-sm font-bold">Professor</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Encode term grades
                                </p>
                            </div>
                        </button>
                    </div>

                    {errors.role && (
                        <p className="text-xs text-rose-500 dark:text-rose-400">
                            {errors.role}
                        </p>
                    )}
                </div>

                {/* Registration Fields */}
                <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                        >
                            Full Name
                        </label>

                        <div className="relative">
                            <User
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
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
                                className="w-full h-12 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition shadow-sm"
                            />
                        </div>

                        {errors.name && (
                            <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email with Send OTP Button */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                        >
                            Institutional Email
                        </label>

                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Mail
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
                                />

                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    placeholder="user@edutrack.edu.ph"
                                    required
                                    className="w-full h-12 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition shadow-sm"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="shrink-0 px-4 h-12 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {isSendingOtp ? (
                                    <>
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                        <span>Sending...</span>
                                    </>
                                ) : otpSent ? (
                                    <>
                                        <CheckCircle2
                                            size={15}
                                            className="text-teal-500"
                                        />
                                        <span>Resend</span>
                                    </>
                                ) : (
                                    <span>Send Code</span>
                                )}
                            </button>
                        </div>

                        {otpMessage && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                                {otpMessage}
                            </p>
                        )}
                        {errors.email && (
                            <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* 6-Digit OTP Field (Lilitaw kapag napindot ang Send Code) */}
                    {otpSent && (
                        <div className="animate-in fade-in duration-300">
                            <label
                                htmlFor="otp"
                                className="block text-sm font-semibold text-teal-600 dark:text-teal-400 mb-2"
                            >
                                6-Digit Verification Code
                            </label>

                            <div className="relative">
                                <KeyRound
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none"
                                />

                                <input
                                    id="otp"
                                    type="text"
                                    maxLength={6}
                                    value={data.otp}
                                    onChange={(e) =>
                                        setData("otp", e.target.value)
                                    }
                                    placeholder="123456"
                                    required
                                    className="w-full h-12 rounded-xl border border-teal-500/50 bg-teal-500/5 pl-10 pr-4 text-base font-mono tracking-widest text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition shadow-sm"
                                />
                            </div>

                            {errors.otp && (
                                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5 font-medium">
                                    {errors.otp}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Passwords with Eye Toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
                                />

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-12 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 pl-10 pr-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition shadow-sm"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                                    title={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                            >
                                Confirm Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"
                                />

                                <input
                                    id="password_confirmation"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
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
                                    className="w-full h-12 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 pl-10 pr-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition shadow-sm"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                                    title={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            </div>

                            {errors.password_confirmation && (
                                <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="pt-1">
                    <button
                        type="submit"
                        disabled={
                            processing ||
                            !otpSent ||
                            data.otp.trim().length !== 6
                        }
                        className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition shadow-lg ${
                            processing ||
                            !otpSent ||
                            data.otp.trim().length !== 6
                                ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 cursor-not-allowed shadow-none"
                                : "bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/30 active:scale-[0.98] cursor-pointer"
                        }`}
                    >
                        <span>
                            {processing
                                ? "Verifying & Creating..."
                                : !otpSent
                                  ? "Verify Email to Continue"
                                  : data.otp.trim().length !== 6
                                    ? "Enter 6-Digit Code"
                                    : "Register & Verify"}
                        </span>

                        <ArrowRight size={17} />
                    </button>
                </div>

                {/* Login Link */}
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 underline underline-offset-4 transition"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </>
    );
}
