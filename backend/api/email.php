<?php 
session_start();

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

return_json('success', 'Certificate-ID was passed.');
// get id of cert
// derive name of cert based on cert-data 
// search if saved certificate pdf exists - backend/saved_certs
// if cert does not exist -> create new cert-pdf
// set receiver details, and basic email details
// perform sending of cert
// increment issue-cnt 

?>