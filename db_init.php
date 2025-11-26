<?php

// Setup admin details in DB
try {
    $conn = mysqli_connect('localhost', 'root', '', 'cert_gen');

    $uname = "admin";
    $role = 'Admin';
    $email = "admin@gmail.com";
    $plainPswd = "admin123";

    $hashed = password_hash($plainPswd, PASSWORD_DEFAULT); // bcrypt/argon

    $sql = "INSERT INTO users (u_name, role, u_email, u_pswd) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $uname, $role, $email, $hashed);
    $stmt->execute();

    echo '<hr/><br/><span style="color: #00aa50">Success !!</span><br/><hr/>';

} catch (Throwable $th) {
    echo '<hr/><br/><span style="color: #aa0050">Failed: </span>' . $th->getMessage() . "<br/><hr/>";
}
?>
