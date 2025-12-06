<?php 
session_start();

require_once __DIR__ . '/../config/db_config.php';

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
    if (isset($_POST['action'])) {
        $action = $_POST['action'];
        switch ($action) {
            case 'create':
                # Save Certificate in DB
                if ( empty($_POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code']) ) {
                    return_json('error', 'Required field missing.');
                }
                save_cert($conn);
                break;

            case 'edit':
                # Update certificate in DB

                if (empty($_POST['id'])) {
                    return_json('error', 'cert not passed.');
                }
                if (empty($_POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code']) ) {
                    return_json('error', 'Required fields missing.');
                }

                update_cert($conn);
                break;

            case 'delete':
                # Delete certificate from DB
                if (!isset($_POST['id'])) {
                    return_json('error', 'cert not passed.');
                }

                delete_cert($conn);
                break;

            case 'list':
                # List templates onto Dashboard
                list_certs($conn);
                break;

            case 'use':
                # sets the Cert-ID into Session

                if (isset($_POST['id'])) {
                    $_SESSION['c_id'] = $_POST['id'];

                    return_json('success', 'cert ready.');

                }

                return_json('error', 'cert not passed.');

                break;
            
            case 'unuse':
                # resets the Cert-ID in Session

                if (isset($_SESSION['c_id'])) {
                    unset($_SESSION['c_id']);
                    return_json('success', 'Cert id reset.');
                }

                return_json('error', 'Cert id not reset.');
                break;

            case 'id_selected':
                # Returns data of Cer-ID in Session 
                if (isset($_SESSION['c_id'])) {
                    get_cert($conn);
                }

                return_json('error', 'cert not passed.');

                break;
            
            default:
                return_json('error', 'Invalid action.');
                break;
        }
    }
} 
catch (\Throwable $th) {
    //throw $th;
    return_json('error', 'Error thrown by Server.');
}

function save_cert($conn) {

    // forwarded template data
    $t_id = $_POST['t_id'];
    $tname = $_POST['tname'];
    $orientation = $_POST['orientation'];
    $html_code = $_POST['html_code'];
    $bg_img = $_POST['bg_img'] ?? '';
    $opacity = $_POST['opacity'] ?? '';
    // Certificate data
    $r_name = $_POST['r_name'];
    $course = $_POST['course'];
    $issue_date = $_POST['issue_date'];
    $purpose = $_POST['purpose'] ?? ''; 
    $u_id = $_SESSION['uid'];
    // placeholder data
    $placeholders = $_POST['pldrs'] ?? []; // ['pname'=>'pval', 'pname'=>'pval', ...]

    $query = "INSERT INTO certificates ( r_name, course, issue_date, purpose, t_id, t_name, orientation, html_code, bg_img, opacity, u_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ssssisssssi', $r_name, $course, $issue_date, $purpose, $t_id, $tname, $orientation, $html_code, $bg_img, $opacity, $u_id );

    if (!$stmt->execute()) {
        return_json('error', 'Failed to save Certificate.' . $stmt->error);
    }
    $c_id = $conn->insert_id;

    if(empty($placeholders)) {
        return_json('success', 'Certificate saved successfully with no placeholders.');
    }

    // insert individual placeholder
    $err_check = 0;
    foreach ($placeholders as $key => $value) {
        $query2 = "INSERT INTO placeholders (p_name, p_value, c_id) VALUES (?, ?, ?)";
        $stmt2 = $conn->prepare($query2);
        $stmt2->bind_param('ssi', $key, $value, $c_id);
        if(!$stmt2->execute()) {
            $err_check = 1;
        }
    }
    if($err_check) {
        return_json('error', 'Error occured while saving placeholders.');
    }

    return_json('success', 'Saved Certificate successfully.', ['c_id' => $c_id]);
}

function get_cert($conn) {
    $id = $_SESSION['c_id'];
    
    $query = 'SELECT * FROM certificates WHERE c_id = ?';
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$row = $result->fetch_assoc()) {
        return_json('error', 'No Certificate Data available.');
    }

    $data = [
        // template data
            't_id' => $row['t_id'],
            't_name' => $row['t_name'],
            'orientation' => $row['orientation'],
            'html_code' => $row['html_code'],
            'bg_img' => $row['bg_img'] ?? '',
            'opacity' => $row['opacity'] ?? '',
        // cert data
            'r_name' => $row['r_name'],
            'course' => $row['course'],
            'issue_date' => $row['issue_date'],
            'purpose' => $row['purpose']
    ];
    
    $query2 = "SELECT * FROM placeholders where c_id = ?";
    $stmt2 = $conn->prepare($query2);
    $stmt2->bind_param('i', $id);
    $stmt2->execute();
    $result2 = $stmt2->get_result();
    if ( $result2->num_rows <= 0) {
        return_json('success', 'Retrieved Certificate Successfuly with no placeholders.', $data);
    }
    $placeholders = [];
    foreach ($result2 as $pldr) {
        $placeholders[$pldr['p_name']] = $pldr['p_value'];
    }
    $data['pldrs'] = $placeholders;
    return_json('success', 'Retrieved Certificate Successfuly.', $data);

}

function delete_cert($conn) {

    $id = $_POST['id'];

    // First check if certificate exists
    $checkQuery = 'SELECT c_id FROM certificates WHERE c_id = ?';
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result->fetch_assoc()) {
        return_json('error', 'Certificate does not exist.');
    }

    // Delete query
    $deleteQuery = 'DELETE FROM certificates WHERE c_id = ?';
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        return_json('success', 'Certificate deleted successfully.');
    } else {
        return_json('error', 'Failed to delete certificate.');
    }
}


function update_cert($conn) {
    // Certificate data
    $id = $_POST['id'];
    $r_name = $_POST['r_name'];
    $course = $_POST['course'];
    $issue_date = $_POST['issue_date'];
    $purpose = $_POST['purpose'] ?? ''; 
    // placeholder data
    $placeholders = $_POST['pldrs'] ?? []; // ['pname'=>'pval', 'pname'=>'pval', ...]

    $query = "UPDATE certificates 
            SET r_name = ?, course = ?, issue_date = ?, purpose = ?
            WHERE c_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('ssssi', $r_name, $course, $issue_date, $purpose, $id);

    if (!$stmt->execute()) {
        return_json('error', 'Failed to update Certificate.');
    }

    //Try blind DELETE on placeholders
    $stmt = $conn->prepare("DELETE FROM placeholders WHERE c_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    if(empty($placeholders)) {
        return_json('success', 'Certificate updated successfully with no placeholders.');
    }

    // insert individual placeholder
    $err_check = 0;
    foreach ($placeholders as $key => $value) {
        $query2 = "INSERT INTO placeholders (p_name, p_value, c_id) VALUES (?, ?, ?)";
        $stmt2 = $conn->prepare($query2);
        $stmt2->bind_param('ssi', $key, $value, $id);
        if(!$stmt2->execute()) {
            $err_check = 1;
        }
    }
    if($err_check) {
        return_json('error', 'Error occured while saving placeholders.');
    }

    return_json('success', 'Updated Certificate successfully.');

}

function list_certs($conn) {

    $query = "SELECT c_id, r_name, course, issue_date, purpose, t_name FROM certificates";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if no records found
    if ($result->num_rows === 0) {
        return_json('error', 'No certificates found.');
    }

    // Fetch all templates
    $templates = [];
    while ($row = $result->fetch_assoc()) {
        $templates[] = $row;
    }
    return_json('success', 'Certificates retrieved successfully.', $templates);

}

?>
