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
    $c_id = $_POST['id'];
    $query = 'SELECT * FROM certificates WHERE c_id = ?';
    $q_stmt = $conn->prepare($query);
    $q_stmt->bind_param('i', $c_id);

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
    $r_name = trim($row['r_name']);
    $course = trim($row['course']);
    $issue_date = trim($row['issue_date']);

    $filename = "Cert_" . $r_name . "_" . $course . "_" . str_replace('-', '_', $issue_date) . '.pdf';

    $html_code = $row['html_code'];
    $my_para = $html_code;  // duplicate
    $orientation = $row['orientation'] ?? 'landscape' ;
    $opacity = $row['opacity'] ?? '40%';
    $bg_img = $row['bg_img'] ?? '';
    $issue_cnt = $row['issue_cnt'] + 1;

    $placeholders = [];

    $q_stmt2 = $conn->prepare('SELECT p_name, p_value FROM placeholders WHERE c_id = ?');
    $q_stmt2->bind_param('i', $c_id);

    if(!$q_stmt2->execute()){
        return_json('error', 'DB connection error');
    }
    $result2 = $q_stmt2->get_result();

    if($result2->num_rows >= 1){
        foreach ($result2->fetch_assoc() as $row2) {
            $pattern = '/{{\s*' . preg_quote($row2['p_name'], '/') . '\s*}}/i';
            $my_para = preg_replace($pattern, $row2['p_value'], $my_para);

        }
    }

    $img_block = '';
    if (!empty($bg_img)) {
        $filepath = __DIR__ . "/../../public/uploads/backgrounds/" . $bg_img;

        if (file_exists($filepath)) {
            $img_block = `<img src="$filepath"
                style="position = 'absolute'; 
                top = 0;
                left = 0;
                width = '100%';
                height = '100%';
                objectFit = 'cover';
                filter = 'opacity($opacity)';
                zIndex = '0';
                pointerEvents = 'none';
            ></img>`;
        }
    }
    $cert_html = `<div style="margin: 0; padding:0; width: 100%; height: 100%;">
            $img_block
            <div>
                $my_para
            </div>
        </div>
    `;

    // instantiate and use the dompdf class
    $dompdf = new Dompdf();
    $dompdf->loadHtml($cert_html);

    // (Optional) Setup the paper size and orientation
    $dompdf->setPaper('A4', $orientation);

    // Render the HTML as PDF
    $dompdf->render();

    // Output the generated PDF to Browser
    $dompdf->stream($filename);
}
?>