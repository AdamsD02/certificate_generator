<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require __DIR__ . '/../config/db_config.php';

try {

    if (isset($_POST['action'])) {
        $action = $_POST['action'];

        switch ($action) {

            // LOGIN
            case 'login':
                if (isset($_POST['email']) && isset($_POST['pswd'])) {
                    login_user($conn); // exits inside
                }

                header("Content-Type: application/json");
                echo json_encode([
                    "status" => "error",
                    "message" => "Missing email or password"
                ]);
                exit();


            // LOGOUT
            case 'logout':
                logout_user(); // exits inside
                break;


            // CHECK LOGIN
            case 'check':
                check_login();
                break;

            default:
                header("Content-Type: application/json");
                echo json_encode([
                    "status" => "error",
                    "message" => "Invalid action"
                ]);
                exit();
        }
    }

} catch (\Throwable $th) {

    header("Content-Type: application/json");
    echo json_encode([
        "status" => "error",
        "message" => "Server error"
    ]);
    exit();
}

function login_user($conn) {

    header("Content-Type: application/json");

    $plain = $_POST['pswd'];
    $email = $_POST['email'];

    $sql = "SELECT * FROM users WHERE u_email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$row = $result->fetch_assoc()) {
        echo json_encode([
            "status" => "error",
            "message" => "Email not found"
        ]);
        exit();
    }

    if (password_verify($plain, $row['u_pswd'])) {

        $_SESSION['uid'] = $row['u_id'];
        $_SESSION['uname'] = $row['u_name'];
        $_SESSION['role'] = $row['role'];

        echo json_encode([
            "status" => "success",
            "message" => "Login successful."
        ]);

    } else {

        echo json_encode([
            "status" => "error",
            "message" => "Invalid credentials"
        ]);
    }
    exit();
}

function logout_user() {

    header("Content-Type: application/json");

    session_unset();
    session_destroy();

    echo json_encode([
        "status" => "success",
        "message" => "Logged out successfully"
    ]);
    exit();
}



function check_login() {

    header("Content-Type: application/json");

    echo json_encode([
        "logged_in" => isset($_SESSION['uid'])
    ]);
    exit();
}
?>
