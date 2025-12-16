<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

// common json response handler
function return_json($status, $msg, $data = null)
{
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status,
        'message' => $msg,
        'data' => $data
    ]);
    exit();
}

try {

    if (!isset($_POST['action'])) {
        return_json('error', 'Failed to perform action');
    }

    $action = $_POST['action'];
    switch ($action) {
        // LOGIN
        case 'login':
            if (isset($_POST['email']) && isset($_POST['pswd'])) {
                login_user($conn); // exits inside
            }
            return_json('error', 'Missing email or password');
            break;


        // LOGOUT
        case 'logout':
            logout_user(); // exits inside
            break;


        // CHECK LOGIN
        case 'check':
            check_login();
            break;

        default:
            return_json('error', 'Invalid action');
            break;
    }
} catch (\Throwable $th) {

    return_json('error', 'Server error');
}


function login_user($conn)
{
        $email = trim($_POST['email']);
        $plain  = $_POST['pswd'];

        $stmt = $conn->prepare("SELECT * FROM users WHERE u_email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            return_json("error", "Email not found");
        }

        // $user = $result->fetch_assoc();
        // if (!password_verify($pswd, $user['u_pswd'])) {
        //     return_json("error", "Invalid password");
        // }

        // /* ✅ LOGIN SUCCESS */
        // $_SESSION['uid']   = $user['u_id'];
        // $_SESSION['uname'] = $user['u_name'];
        // $_SESSION['role']  = $user['role'];

    if (!$row = $result->fetch_assoc()) {
        return_json('error', 'Email not found');
    }

    if (password_verify($plain, $row['u_pswd'])) {

        $_SESSION['uid'] = $row['u_id'];
        $_SESSION['uname'] = $row['u_name'];
        $_SESSION['role'] = $row['role'];

        return_json('success', 'Login successful');
    } else {

        return_json('error', 'Invalid Credentials');
    }
}


function logout_user()
{
    session_unset();
    session_destroy();

    return_json('success', 'Logged out successfully');
}


function check_login()
{
    if (isset($_SESSION['uid'])) {
        return_json('success', 'User Logged In!');
        
    } else {
        return_json('error', 'User not Logged In');
    }
}
