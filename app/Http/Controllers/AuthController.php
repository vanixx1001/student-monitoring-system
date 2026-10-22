<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

        // Kung API request, ibalik ang JSON token
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
     * Handle User Registration with Strict Role Validation
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', Rule::in(['student', 'professor'])],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

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