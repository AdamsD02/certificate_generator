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
                if(!isset($_POST['c_id'])) {
                    return_json('error', 'Certificate was not passed.');
                }
                generate_pdf($conn);
                break;
            
            case 'download':
                if(!isset($_POST['c_id'])) {
                    return_json('error', 'Certificate was not passed.');
                }
                download_cert($conn);
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
    $c_id = (int)$_POST['c_id'];
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
    $pdf_path = __DIR__ . '/../../uploads/certificates/' . $filename;

    $html_code = $row['html_code'];
    $my_para = $html_code;  // duplicate
    $orientation = $row['orientation'] ?? 'landscape' ;
    $opacity = $row['opacity'] ?? '40%';
    $bg_img = $row['bg_img'] ?? '';
    $issue_cnt = max(1, (int)$row['issue_cnt'] + 1);

    $placeholders = [];

    $q_stmt2 = $conn->prepare('SELECT p_name, p_value FROM placeholders WHERE c_id = ?');
    $q_stmt2->bind_param('i', $c_id);

    if(!$q_stmt2->execute()){
        return_json('error', 'DB connection error');
    }
    $result2 = $q_stmt2->get_result();

    if($result2->num_rows >= 1){
        while ($row2 = $result2->fetch_assoc()) {
            $pattern = '/{{\s*' . preg_quote($row2['p_name'], '/') . '\s*}}/i';
            $my_para = preg_replace($pattern, $row2['p_value'], $my_para);

        }
    }

    $img_block = '';
    if (!empty($bg_img)) {
        $filepath = __DIR__ . "/../../uploads/backgrounds/" . $bg_img;

        if (file_exists($filepath)) {
            $img_block = "<img src=\"$filepath\" 
                            style=\"position:absolute; 
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            filter: opacity($opacity);
                            z-index: '0';
                            pointer-events: none;\"
                        />";
        }
    }
    $cert_html = "<div style=\"margin: 0; padding:0; width: 100%; height: 100%;\">
                        $img_block
                        <div>
                            $my_para
                        </div>
                    </div>";

    // instantiate and use the dompdf class
    $options = new Options();
    $options->set('isRemoteEnabled', TRUE);
    $dompdf = new Dompdf($options);

    // $dompdf = new Dompdf();
    $dompdf->loadHtml($cert_html);

    // (Optional) Setup the paper size and orientation
    $dompdf->setPaper('A4', $orientation);

    // Render the HTML as PDF
    $dompdf->render();

    // delete old file if exists
    if (file_exists($pdf_path)) {
        unlink($pdf_path);
    }

    // Output the generated PDF to Browser
    $output_file = $dompdf->output();
    file_put_contents($pdf_path, $output_file);

    $msg = 'Certificate saved as pdf with name ' . $filename;

    // update issue count = 1, last issued time
    $stmt = $conn->prepare("
        UPDATE certificates
        SET issue_cnt = ?,
            last_issued_at = NOW(),
            updated_at = NOW()
        WHERE c_id = ?
    ");
    $stmt->bind_param("ii", $issue_cnt, $c_id);
    $stmt->execute();

    return_json('success', $msg);

    // force download 
    // $dompdf->stream($filename, ['Attachment' => true]);
}

function download_cert($conn) {

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

    if (!file_exists($filepath)) {
        return_json('error', 'PDF file not found on server.');
    }

    /********** FORCE DOWNLOAD **********/
    header("Content-Type: application/pdf");
    header("Content-Disposition: attachment; filename=\"$filename\"");
    header("Content-Length: " . filesize($filepath));

    ob_clean();
    flush();

    readfile($filepath);
    return_json('success', 'PDF downloaded.');
}
?>