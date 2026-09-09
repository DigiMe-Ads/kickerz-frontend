<?php
/**
 * Copy this file to config.php in the same folder and fill in the real values.
 *
 * config.php holds live delivery settings and must never be committed to a
 * public repository or included in anything the browser can download. It is
 * read only by contact.php, which sits behind the /form-api/ exclusion in
 * .htaccess.
 *
 * NOTE: if you later switch contact.php to SMTP (PHPMailer), the SMTP username
 * and password belong in this file too - never in the React source, because
 * everything in the JavaScript bundle is public.
 */

declare(strict_types=1);

return [
    // Where enquiries are delivered.
    'to' => 'info@colombokickerz.lk',

    // Must be an address on the site's own domain, or Hostinger will refuse
    // to send and the mail will be rejected by the recipient's spam filter.
    'from' => 'Colombo Kickerz Website <no-reply@colombokickerz.lk>',

    // Prefixed to the subject line so enquiries are easy to filter in the inbox.
    'subject_prefix' => '[Kickerz Website]',

    // Browsers send an Origin header on cross-origin POSTs. Only these are
    // accepted; requests with no Origin header (same-origin) always pass.
    'allowed_origins' => [
        'https://colombokickerz.lk',
        'https://www.colombokickerz.lk',
    ],
];
