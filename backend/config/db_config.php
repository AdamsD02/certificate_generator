<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    $conn = mysqli_connect('localhost', 'root', '', 'cert_gen');
    if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

} catch (\Throwable $th) {
    echo "Connection Failed." . $th->getMessage();
}
?>