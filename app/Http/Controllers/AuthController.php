<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\SendOtpNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Render Login View
     */
    public function showLogin()
    {
        return Inertia::render('auth/login');
    }

    /**
     * Handle Login (Web Session + API Fallback)
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['Maling email o password.'],
            ]);
        }

        $request->session()->regenerate();

        if ($request->wantsJson()) {
            $user = Auth::user();
            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user,
            ]);
        }

        return redirect()->intended('/dashboard');
    }

    /**
     * Render Register View
     */
    public function showRegister()
    {
        return Inertia::render('auth/register');
    }

    /**
     * Step A: Generate and dispatch a 6-digit OTP to the applicant's Gmail
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
        ], [
            'email.unique' => 'An account is already registered with this email address.',
            'email.required' => 'Please provide an active email address.',
        ]);

        $email = $request->email;
        $otp = (string) random_int(100000, 999999);

        // Itago sa Cache ang OTP sa loob ng 10 minuto (600 seconds)
        Cache::put('register_otp_' . $email, $otp, 600);

        try {
            // Ipadala ang notification gamit ang on-demand mail route
            Notification::route('mail', $email)->notify(new SendOtpNotification($otp));

            return response()->json([
                'status' => 'success',
                'message' => 'A 6-digit verification code has been dispatched to your email.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to deliver the security code. Please verify your mail settings.',
            ], 500);
        }
    }

    /**
     * Step B: Validate the OTP and complete account creation
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', Rule::in(['student', 'professor'])],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'otp' => ['required', 'string', 'size:6'],
        ], [
            'otp.required' => 'The 6-digit verification code is required.',
            'otp.size' => 'The verification code must be exactly 6 digits.',
        ]);

        // Kunin ang naka-imbak na code para sa email na ito
        $cachedOtp = Cache::get('register_otp_' . $validated['email']);

        if (!$cachedOtp || $cachedOtp !== $validated['otp']) {
            throw ValidationException::withMessages([
                'otp' => ['The verification code entered is invalid or has expired.'],
            ]);
        }

        // Burahin ang OTP sa cache oras na magamit na
        Cache::forget('register_otp_' . $validated['email']);

        // Lumikha ng verified user record
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        event(new Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        if ($request->wantsJson()) {
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'status' => 'success',
                'token' => $token,
                'user' => $user,
            ], 201);
        }

        return redirect()->route('dashboard');
    }

    /**
     * Handle Logout
     */
    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully logged out',
            ]);
        }

        return redirect('/');
    }
}