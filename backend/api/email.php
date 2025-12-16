<?php 
session_start();

require __DIR__ . "/../lib/PHPMailer/src/PHPMailer.php";
require __DIR__ . "/../lib/PHPMailer/src/SMTP.php";
require __DIR__ . "/../lib/PHPMailer/src/Exception.php";

require_once __DIR__ . '/../lib/dompdf/autoload.inc.php';

require_once __DIR__ . '/../config/db_config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

use Dompdf\Dompdf;
use Dompdf\Options;


function return_json($status, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

if (!isset($_POST['c_id'])) {
    return_json('error', 'Certificate-ID not passed.');
}

if ($_POST['action'] === 'send') {

    // check data passed
    if (!isset($_POST['body'])) return_json('error', 'body not set');
    if (!isset($_POST['from_email'])) return_json('error', 'body not set');
    if (!isset($_POST['from_name'])) return_json('error', 'body not set');
    if (!isset($_POST['to_email'])) return_json('error', 'body not set');
    if (!isset($_POST['subject'])) return_json('error', 'body not set');
    
    // Basic data
    $to_email = $_POST['to_email'];
    $from_name = $_POST['from_name'];
    $from_email = $_POST['from_email'];
    $body = $_POST['body'];
    $subject = $_POST['subject'];

    // Optional Data
    $alt_body  = $_POST['alt_body'] ?? '';
    $cc_email = $_POST['cc_email'] ?? '';
    $bcc_email = $_POST['bcc_email'] ?? '';

    // Create Email
    
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();

        // when using Gmail for email
        $mail->Host       = 'smtp.gmail.com';    // your SMTP host
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your-email@gmail.com';
        $mail->Password   = 'your-app-password'; // NOT Gmail password, 16-digit pswd generated 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // when host domain provides emailing
        /*
        // SMTP Host: mail.yourdomain.com
        // Port: 465 (SSL) / 587 (TLS)
        $mail->Host = 'mail.yourdomain.com';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;
        */

        // Recipients
        $mail->setFrom($from_email, $from_name);
        $mail->addAddress($to_email);  
        if ($cc_email) { $mail->addCC($cc_email); }
        if ($bcc_email) { $mail->addBCC($bcc_email); }

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        if ($alt_body) { $mail->AltBody = $alt_body; }


        //--------- Attachement Handling -----------

        $c_id = (int)$_POST['c_id'];

        // Get certificate row
        $stmt = $conn->prepare("SELECT r_name, course, issue_date FROM certificates WHERE c_id = ?");
        $stmt->bind_param("i", $c_id);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows !== 1) {
            return_json('error', 'Certificate not found.');
        }

        $row = $res->fetch_assoc();

        // Rebuild filename
        $filename = "Cert_" . trim($row['r_name']) . "_" . trim($row['course']) . "_" . str_replace('-', '_', trim($row['issue_date'])) . ".pdf";

        $filepath = __DIR__ . "/../../uploads/certificates/" . $filename;

        $conn->close(); //close db

        if (!file_exists($filepath)) {
            return_json('error', 'PDF file not found on server.');
        }
        // adding attachments
        $mail->addAttachment($filepath);

        $mail->send();
        return_json('success',  "Email sent successfully!");
    } catch (Exception $e) {
        return_json('error',  "Email could not be sent. Error: {$mail->ErrorInfo}");
    }

}


return_json('error', 'Action not recognized.');

// get id of cert
// derive name of cert based on cert-data 
// search if saved certificate pdf exists - backend/saved_certs
// if cert does not exist -> create new cert-pdf
// set receiver details, and basic email details
// perform sending of cert
// increment issue-cnt 

?>