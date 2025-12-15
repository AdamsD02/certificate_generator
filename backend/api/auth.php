<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

/* ✅ CORRECT DB CONFIG PATH */

require_once dirname(__DIR__) . '/config/db_config.php';

/* ---------------------------
   COMMON JSON RESPONSE
----------------------------*/
function json_response($status, $message = "", $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ]);
    exit();
}

/* ---------------------------
   VALIDATE REQUEST
----------------------------*/
if (!isset($_POST['action'])) {
    json_response("error", "Invalid request");
}

$action = $_POST['action'];

/* ---------------------------
   ACTION HANDLER
----------------------------*/
switch ($action) {

    /* ---------- LOGIN ---------- */
    case "login":

        if (empty($_POST['email']) || empty($_POST['pswd'])) {
            json_response("error", "Email and password required");
        }

        $email = trim($_POST['email']);
        $pswd  = $_POST['pswd'];

        $stmt = $conn->prepare("SELECT * FROM users WHERE u_email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            json_response("error", "Email not found");
        }

        $user = $result->fetch_assoc();

        if (!password_verify($pswd, $user['u_pswd'])) {
            json_response("error", "Invalid password");
        }

        /* ✅ LOGIN SUCCESS */
        $_SESSION['uid']   = $user['u_id'];
        $_SESSION['uname'] = $user['u_name'];
        $_SESSION['role']  = $user['role'];

        json_response("success", "Login successful");
        break;

    /* ---------- LOGOUT ---------- */
    case "logout":

        session_unset();
        session_destroy();

        json_response("success", "Logged out");
        break;

    /* ---------- CHECK SESSION ---------- */
    case "check":

        json_response("success", "", [
            "logged_in" => isset($_SESSION['uid']),
            "user" => $_SESSION['uname'] ?? null
        ]);
        break;

    default:
        json_response("error", "Invalid action");
}
