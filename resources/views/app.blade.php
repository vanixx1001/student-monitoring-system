<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Basahin agad ang theme preference mula sa localStorage bago mag-render ang DOM --}}
    <script>
        (function () {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        })();
    </script>

    {{-- Background color fallbacks para iwas white flicker tuwing magre-refresh --}}
    <style>
        html {
            background-color: #ffffff;
        }

        html.dark {
            background-color: #000000;
        }
    </style>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    @fonts

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    <x-inertia::head>
        <title>{{ config('app.name', 'University of Vanixx') }}</title>
    </x-inertia::head>
</head>

<body
    class="font-sans antialiased bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
    <x-inertia::app />
</body>

</html>