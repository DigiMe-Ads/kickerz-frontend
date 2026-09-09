<?php
/**
 * Colombo Kickerz - contact form endpoint
 * ---------------------------------------------------------------------------
 * Receives the JSON body posted by the React contact form and emails it to the
 * academy. Lives in its own /form-api/ folder, deliberately separate from the
 * existing /api/ folder that serves the mobile app - nothing in this file
 * should ever be reachable from, or interfere with, that folder.
 *
 * The SPA rewrite in .htaccess excludes /form-api/, so this file is served
 * directly by PHP rather than falling through to index.html.
 *
 * DEPLOYMENT
 *   1. Upload as: public_html/form-api/contact.php
 *   2. Copy config.sample.php to config.php in the same folder and fill in the
 *      real values. config.php is NOT part of the React build and must never
 *      be committed anywhere public.
 *   3. Confirm .htaccess still contains the /form-api/ exclusion in rule 1.
 *
 * This uses PHP's built-in mail(). If Hostinger's mail() proves unreliable,
 * swap the send_message() body for PHPMailer configured against the academy's
 * SMTP account - the rest of this file does not need to change.
 * ---------------------------------------------------------------------------
 */

declare(strict_types=1);

// This endpoint's only output is JSON. A stray PHP warning printed before the
// body would corrupt it and the browser's response.json() would throw, so
// warnings go to the error log instead of the response.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// --- Response helpers -------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/**
 * Emits a JSON response and stops.
 */
function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// --- Method guard -----------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Method not allowed.');
}

// --- Configuration ----------------------------------------------------------

$configPath = __DIR__ . '/config.php';

if (!is_readable($configPath)) {
    // Do not leak the reason to the visitor - log it for the developer instead.
    error_log('form-api/contact.php: config.php is missing or unreadable.');
    respond(500, false, 'The contact form is not configured. Please email us directly.');
}

/** @var array{to:string,from:string,subject_prefix:string,allowed_origins:array<string>} $config */
$config = require $configPath;

// --- Origin check -----------------------------------------------------------
// Keeps other sites from posting through this endpoint.

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== '' && !in_array($origin, $config['allowed_origins'], true)) {
    respond(403, false, 'Forbidden.');
}

// --- Read and validate input ------------------------------------------------

$raw = file_get_contents('php://input');
$data = json_decode((string) $raw, true);

if (!is_array($data)) {
    respond(400, false, 'Invalid request.');
}

/**
 * Trims a field and caps its length so an oversized payload cannot be used to
 * stuff the outgoing email.
 */
function field(array $data, string $key, int $maxLength = 500): string
{
    $value = is_string($data[$key] ?? null) ? trim($data[$key]) : '';

    return mb_substr($value, 0, $maxLength);
}

// Honeypot: the form renders a hidden "company" field that a human never sees.
// Anything that fills it in is a bot. Return success so the bot stops retrying.
if (field($data, 'company', 100) !== '') {
    respond(200, true, 'Thank you for your message.');
}

$name    = field($data, 'name', 120);
$email   = field($data, 'email', 180);
$phone   = field($data, 'phone', 60);
$subject = field($data, 'subject', 120);
$message = field($data, 'message', 4000);

$errors = [];

if ($name === '') {
    $errors[] = 'name';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}
if ($message === '') {
    $errors[] = 'message';
}

if ($errors !== []) {
    respond(422, false, 'Please complete the required fields with valid details.');
}

// Header injection guard: no CR/LF may reach an email header.
foreach ([$name, $email, $subject, $phone] as $headerValue) {
    if (preg_match('/[\r\n]/', $headerValue) === 1) {
        respond(400, false, 'Invalid request.');
    }
}

// --- Build and send ---------------------------------------------------------

$lines = [
    'New enquiry from the Colombo Kickerz website',
    str_repeat('-', 46),
    'Name:    ' . $name,
    'Email:   ' . $email,
    'Phone:   ' . ($phone !== '' ? $phone : '(not provided)'),
    'Subject: ' . ($subject !== '' ? $subject : '(not selected)'),
    '',
    'Message:',
    $message,
    '',
    str_repeat('-', 46),
    'Received: ' . date('Y-m-d H:i:s T'),
    'IP:       ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
];

$body = implode("\n", $lines);

$mailSubject = $config['subject_prefix']
    . ' ' . ($subject !== '' ? $subject : 'Website enquiry');

$headers = implode("\r\n", [
    'From: ' . $config['from'],
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
    'X-Mailer: PHP/' . phpversion(),
]);

// Silenced deliberately: a failure is reported through the JSON response and
// the error log below, never as raw output that would break the JSON body.
$sent = @mail($config['to'], $mailSubject, $body, $headers);

if (!$sent) {
    error_log('form-api/contact.php: mail() returned false for ' . $email);
    respond(502, false, 'We could not send your message right now. Please email us directly.');
}

respond(200, true, 'Thank you for your message. We will be in touch shortly.');
