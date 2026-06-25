<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$SMTP_HOST = "smtp.hostinger.com";
$SMTP_PORT = 465;
$SMTP_USER = "postpencil@protoolvault.in";
$SMTP_PASS = "6pR&&/ikdc";
$SMTP_FROM = "PostPencil <postpencil@protoolvault.in>";

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$to = $input["to"] ?? "";
$subject = $input["subject"] ?? "";
$html = $input["html"] ?? "";

if (empty($to) || empty($subject) || empty($html)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email address"]);
    exit;
}

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: " . $SMTP_FROM . "\r\n";
$headers .= "Reply-To: " . $SMTP_USER . "\r\n";

$sent = @mail($to, $subject, $html, $headers);

if ($sent) {
    echo json_encode(["success" => true, "message" => "Email sent successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Failed to send email"]);
}

