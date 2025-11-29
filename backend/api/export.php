<?php 
session_start();

// get resources 
require_once __DIR__ . '/../lib/dompdf/autoload.inc.php';
require_once __DIR__ . '/../config/db_config.php';

use Dompdf\Dompdf;
use Dompdf\Options;

// common json response handler
function return_json($status, $msg, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status,
        'message' => $msg,
        'data' => $data
    ]);
    exit();
}

try {
    if(isset($_POST['action'])) {
        $action = $_POST['action'];
        switch ($action) {
            case 'create':
                if(!isset($_POST['id'])) {
                    return_json('error', 'Certificate was not passed.');
                }
                generate_pdf($conn);
                break;
            
            default:
                # code...
                break;
        }
    }
} catch (\Throwable $th) {
    //throw $th;
}

// apply dompdf 
function generate_pdf($conn) {
    // get certificate data from db
    $query = 'SELECT * FROM certificates WHERE c_id = ?';
    $q_stmt = $conn->prepare($query);
    $q_stmt->bind_param('i', $_POST['id']);

    if(!$q_stmt->execute()){
        return_json('error', 'DB connection error');
    }
    $result = $q_stmt->get_result();

    if($result->num_rows <= 0){
        return_json('error', 'Certificate Not found.');
    }
    if($result->num_rows > 1){
        return_json('error', 'Many matching Certificates found.');
    }

    $row = $result->fetch_assoc();
    $r_name = $row['r_name'];
    $course = $row['course'];
    $issue_date = $row['issue_date'];

    $html_code = $row['html_code'];
    $orientation = $row['orientation'] ?? 'landscape' ;
    $opacity = $row['opacity'] ?? '40%';
    $bg_img = $row['bg_img'] ?? '';
    $issue_cnt = $row['issue_cnt'] + 1;

    // instantiate and use the dompdf class
    $dompdf = new Dompdf();
    $dompdf->loadHtml('hello world');

    // (Optional) Setup the paper size and orientation
    $dompdf->setPaper('A4', 'landscape');

    // Render the HTML as PDF
    $dompdf->render();

    // Output the generated PDF to Browser
    $dompdf->stream();
}
?>