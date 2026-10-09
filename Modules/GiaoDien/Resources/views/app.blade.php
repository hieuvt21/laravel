<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#ff9f43">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'POS') }}</title>
    <link rel="manifest" href="/manifest.webmanifest">
    @vite('resources/js/app.js')
</head>
<body>
    <div id="app"></div>
</body>
</html>
